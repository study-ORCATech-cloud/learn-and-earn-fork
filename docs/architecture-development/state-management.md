# State Management Guide

This document provides a comprehensive guide to state management in the LabDojo Learning Platform, covering Context API patterns, state organization, and best practices for maintaining scalable and maintainable state.

## Table of Contents

1. [Overview](#overview)
2. [State Architecture](#state-architecture)
3. [Context Providers](#context-providers)
4. [State Patterns](#state-patterns)
5. [Custom Hooks](#custom-hooks)
6. [Performance Optimization](#performance-optimization)
7. [Testing State](#testing-state)
8. [Best Practices](#best-practices)
9. [Common Patterns](#common-patterns)
10. [Troubleshooting](#troubleshooting)

## Overview

The LabDojo Learning Platform uses React's Context API as the primary state management solution, supplemented by local component state and custom hooks. This approach provides:

- **Global State Management**: Shared state across components
- **Type Safety**: Full TypeScript integration
- **Performance**: Optimized re-rendering patterns
- **Maintainability**: Clear separation of concerns
- **Testability**: Easy to mock and test

### State Management Stack

```typescript
// Primary Technologies
- React Context API
- TypeScript
- Custom Hooks
- Local Storage (persistence)
- React Hook Form (form state)
- TanStack Query (server state, when needed)
```

## State Architecture

### State Layers

The application uses a layered state architecture:

```
┌─────────────────────────────────────┐
│           Global State              │
│        (Context Providers)          │
├─────────────────────────────────────┤
│          Feature State              │
│       (Custom Hooks)               │
├─────────────────────────────────────┤
│         Component State             │
│      (useState, useReducer)         │
├─────────────────────────────────────┤
│          Form State                 │
│      (React Hook Form)              │
└─────────────────────────────────────┘
```

### Context Structure

```typescript
// Context Provider Hierarchy
<UserProgressProvider>
  <SearchProvider>
    <App />
  </SearchProvider>
</UserProgressProvider>
```

## Context Providers

### UserProgressContext

Manages user progress, preferences, and achievements across the platform.

#### Context Definition

```typescript
interface UserProgressContextType {
  progress: UserProgress;
  toggleFavorite: (resourceId: string) => void;
  markComplete: (resourceId: string) => void;
  updateProgress: (updates: Partial<UserProgress>) => void;
  getCompletionRate: (pathId: string) => number;
}

const UserProgressContext = createContext<UserProgressContextType | undefined>(undefined);
```

#### State Structure

```typescript
interface UserProgress {
  userId: string;
  completedResources: string[];
  favorites: string[];
  lastAccessed: Date;
  totalHours: number;
  achievements: Achievement[];
  preferences: UserPreferences;
}

interface UserPreferences {
  theme: 'light' | 'dark';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  interests: string[];
  notifications: boolean;
}
```

#### Implementation Pattern

```typescript
export const UserProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initialize state from localStorage
  const [progress, setProgress] = useState<UserProgress>(() => {
    const stored = localStorage.getItem('labdojo-progress');
    return stored ? JSON.parse(stored) : DEFAULT_PROGRESS;
  });

  // 2. Persist state changes
  useEffect(() => {
    localStorage.setItem('labdojo-progress', JSON.stringify(progress));
  }, [progress]);

  // 3. Action handlers
  const toggleFavorite = useCallback((resourceId: string) => {
    setProgress(prev => ({
      ...prev,
      favorites: prev.favorites.includes(resourceId)
        ? prev.favorites.filter(id => id !== resourceId)
        : [...prev.favorites, resourceId]
    }));
  }, []);

  // 4. Provide context value
  const contextValue = useMemo(() => ({
    progress,
    toggleFavorite,
    markComplete,
    updateProgress,
    getCompletionRate
  }), [progress, toggleFavorite, markComplete, updateProgress, getCompletionRate]);

  return (
    <UserProgressContext.Provider value={contextValue}>
      {children}
    </UserProgressContext.Provider>
  );
};
```

### SearchContext

Manages global search functionality, filters, and results.

#### Context Definition

```typescript
interface SearchContextType {
  searchQuery: string;
  searchResults: SearchItem[];
  filters: SearchFilters;
  isLoading: boolean;
  search: (query: string) => void;
  updateFilters: (filters: Partial<SearchFilters>) => void;
  clearSearch: () => void;
}
```

#### Search State Management

```typescript
export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [isLoading, setIsLoading] = useState(false);

  // Debounced search implementation
  const search = useCallback((query: string) => {
    setSearchQuery(query);
    setIsLoading(true);
    
    // Perform search logic
    const results = performSearch(query, filters);
    
    // Simulate async operation
    setTimeout(() => {
      setSearchResults(results);
      setIsLoading(false);
    }, 200);
  }, [filters]);

  // Filter management
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  return (
    <SearchContext.Provider value={{
      searchQuery,
      searchResults,
      filters,
      isLoading,
      search,
      updateFilters,
      clearSearch
    }}>
      {children}
    </SearchContext.Provider>
  );
};
```

## State Patterns

### 1. Provider Pattern

Used for global state that needs to be accessed by multiple components:

```typescript
// Creating a Context
const MyContext = createContext<MyContextType | undefined>(undefined);

// Provider Component
export const MyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState(initialState);
  
  return (
    <MyContext.Provider value={{ state, setState }}>
      {children}
    </MyContext.Provider>
  );
};

// Custom Hook
export const useMyContext = () => {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error('useMyContext must be used within MyProvider');
  }
  return context;
};
```

### 2. Reducer Pattern

For complex state logic with multiple actions:

```typescript
interface State {
  loading: boolean;
  data: any[];
  error: string | null;
}

type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: any[] }
  | { type: 'FETCH_ERROR'; payload: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, data: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

// Usage in component
const [state, dispatch] = useReducer(reducer, initialState);
```

### 3. Computed State Pattern

For derived state values:

```typescript
const useUserStats = () => {
  const { progress } = useUserProgress();
  
  const stats = useMemo(() => ({
    completionRate: progress.completedResources.length / totalResources,
    favoriteCount: progress.favorites.length,
    achievementCount: progress.achievements.length,
    isActive: Date.now() - progress.lastAccessed.getTime() < 24 * 60 * 60 * 1000
  }), [progress]);
  
  return stats;
};
```

### 4. Action Pattern

For consistent state updates:

```typescript
// Action creators
const actions = {
  toggleFavorite: (resourceId: string) => ({
    type: 'TOGGLE_FAVORITE' as const,
    payload: resourceId
  }),
  
  markComplete: (resourceId: string) => ({
    type: 'MARK_COMPLETE' as const,
    payload: resourceId
  }),
  
  updatePreferences: (preferences: Partial<UserPreferences>) => ({
    type: 'UPDATE_PREFERENCES' as const,
    payload: preferences
  })
};

// Usage
dispatch(actions.toggleFavorite('course-123'));
```

## Custom Hooks

### State Management Hooks

#### useUserProgress

```typescript
export const useUserProgress = () => {
  const context = useContext(UserProgressContext);
  if (!context) {
    throw new Error('useUserProgress must be used within UserProgressProvider');
  }
  return context;
};

// Usage example
const MyComponent = () => {
  const { progress, toggleFavorite, markComplete } = useUserProgress();
  
  return (
    <div>
      <p>Completed: {progress.completedResources.length}</p>
      <button onClick={() => toggleFavorite('resource-1')}>
        Toggle Favorite
      </button>
    </div>
  );
};
```

#### useSearch

```typescript
export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider');
  }
  return context;
};

// Usage with debouncing
const SearchComponent = () => {
  const { search, searchResults, isLoading } = useSearch();
  const [inputValue, setInputValue] = useState('');
  
  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue) {
        search(inputValue);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [inputValue, search]);
  
  return (
    <div>
      <input 
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Search..."
      />
      {isLoading && <p>Searching...</p>}
      {searchResults.map(result => (
        <div key={result.id}>{result.title}</div>
      ))}
    </div>
  );
};
```

### Feature-Specific Hooks

#### useCourseFilters

```typescript
export const useCourseFilters = ({ resources, resourceGroups }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  // Computed values
  const availableDifficulties = useMemo(() => {
    const difficulties = new Set<string>();
    resources?.forEach(resource => {
      if (resource.difficulty) difficulties.add(resource.difficulty);
    });
    return Array.from(difficulties);
  }, [resources]);

  const filterResources = useCallback((resources: Resource[]) => {
    return resources.filter(resource => {
      const matchesSearch = !searchTerm || 
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDifficulty = !difficultyFilter || 
        resource.difficulty === difficultyFilter;
      
      const matchesType = !typeFilter || 
        resource.type === typeFilter;
      
      return matchesSearch && matchesDifficulty && matchesType;
    });
  }, [searchTerm, difficultyFilter, typeFilter]);

  return {
    searchTerm,
    setSearchTerm,
    difficultyFilter,
    setDifficultyFilter,
    typeFilter,
    setTypeFilter,
    availableDifficulties,
    filterResources,
    // ... other methods
  };
};
```

## Performance Optimization

### 1. Memoization

#### Context Value Memoization

```typescript
// Always memoize context values
const contextValue = useMemo(() => ({
  state,
  actions: {
    updateState,
    resetState
  }
}), [state, updateState, resetState]);

return (
  <MyContext.Provider value={contextValue}>
    {children}
  </MyContext.Provider>
);
```

#### Callback Memoization

```typescript
// Memoize callbacks to prevent unnecessary re-renders
const toggleFavorite = useCallback((resourceId: string) => {
  setProgress(prev => ({
    ...prev,
    favorites: prev.favorites.includes(resourceId)
      ? prev.favorites.filter(id => id !== resourceId)
      : [...prev.favorites, resourceId]
  }));
}, []); // No dependencies = stable reference
```

### 2. Context Splitting

Split large contexts into smaller, focused ones:

```typescript
// Instead of one large context
interface LargeContextType {
  user: User;
  preferences: Preferences;
  progress: Progress;
  search: SearchState;
}

// Split into focused contexts
interface UserContextType {
  user: User;
  updateUser: (user: User) => void;
}

interface PreferencesContextType {
  preferences: Preferences;
  updatePreferences: (prefs: Preferences) => void;
}
```

### 3. Selective Subscriptions

Use multiple contexts to allow components to subscribe only to needed state:

```typescript
// Component only subscribes to user data
const UserProfile = () => {
  const { user } = useUser(); // Only re-renders when user changes
  return <div>{user.name}</div>;
};

// Component only subscribes to search state
const SearchResults = () => {
  const { results } = useSearch(); // Only re-renders when search changes
  return <div>{results.length} results</div>;
};
```

### 4. State Normalization

Keep state flat and normalized:

```typescript
// Avoid nested state
interface BadState {
  courses: {
    [id: string]: {
      details: Course;
      progress: Progress;
      favorites: boolean;
    };
  };
}

// Use normalized state
interface GoodState {
  courses: { [id: string]: Course };
  progress: { [courseId: string]: Progress };
  favorites: string[];
}
```

## Testing State

### Testing Context Providers

```typescript
import { render, screen } from '@testing-library/react';
import { UserProgressProvider, useUserProgress } from '../UserProgressContext';

// Test component
const TestComponent = () => {
  const { progress, toggleFavorite } = useUserProgress();
  return (
    <div>
      <span data-testid="favorites-count">{progress.favorites.length}</span>
      <button onClick={() => toggleFavorite('test-id')}>
        Toggle Favorite
      </button>
    </div>
  );
};

// Test wrapper
const renderWithProvider = (ui: React.ReactElement) => {
  return render(
    <UserProgressProvider>
      {ui}
    </UserProgressProvider>
  );
};

// Test case
test('toggles favorite correctly', async () => {
  renderWithProvider(<TestComponent />);
  
  const favoritesCount = screen.getByTestId('favorites-count');
  const toggleButton = screen.getByText('Toggle Favorite');
  
  expect(favoritesCount).toHaveTextContent('0');
  
  fireEvent.click(toggleButton);
  
  await waitFor(() => {
    expect(favoritesCount).toHaveTextContent('1');
  });
});
```

### Mocking Contexts

```typescript
// Mock context for testing
const mockUserProgress = {
  progress: {
    userId: 'test-user',
    completedResources: [],
    favorites: [],
    lastAccessed: new Date(),
    totalHours: 0,
    achievements: [],
    preferences: {
      theme: 'dark',
      difficulty: 'Beginner',
      interests: [],
      notifications: true
    }
  },
  toggleFavorite: jest.fn(),
  markComplete: jest.fn(),
  updateProgress: jest.fn(),
  getCompletionRate: jest.fn(() => 0)
};

jest.mock('../context/UserProgressContext', () => ({
  useUserProgress: () => mockUserProgress
}));
```

## Best Practices

### 1. Context Design

#### Keep Contexts Focused

```typescript
// Good: Focused context
interface UserProgressContextType {
  progress: UserProgress;
  toggleFavorite: (resourceId: string) => void;
  markComplete: (resourceId: string) => void;
}

// Avoid: Overly broad context
interface AppContextType {
  user: User;
  progress: Progress;
  search: SearchState;
  ui: UIState;
  notifications: Notification[];
}
```

#### Provide Default Values

```typescript
const UserProgressContext = createContext<UserProgressContextType | undefined>(undefined);

// Custom hook with error handling
export const useUserProgress = () => {
  const context = useContext(UserProgressContext);
  if (!context) {
    throw new Error('useUserProgress must be used within UserProgressProvider');
  }
  return context;
};
```

### 2. State Updates

#### Use Functional Updates

```typescript
// Good: Functional update
setProgress(prev => ({
  ...prev,
  favorites: [...prev.favorites, resourceId]
}));

// Avoid: Direct state mutation
progress.favorites.push(resourceId);
setProgress(progress);
```

#### Batch Related Updates

```typescript
// Good: Single state update
const markResourceComplete = (resourceId: string) => {
  setProgress(prev => ({
    ...prev,
    completedResources: [...prev.completedResources, resourceId],
    lastAccessed: new Date(),
    totalHours: prev.totalHours + 1
  }));
};

// Avoid: Multiple separate updates
const markResourceComplete = (resourceId: string) => {
  setCompletedResources(prev => [...prev, resourceId]);
  setLastAccessed(new Date());
  setTotalHours(prev => prev + 1);
};
```

### 3. Performance

#### Memoize Expensive Computations

```typescript
const getCompletionRate = useMemo(() => {
  return (pathId: string) => {
    const pathResources = getResourcesForPath(pathId);
    const completedInPath = progress.completedResources.filter(
      id => pathResources.includes(id)
    );
    return completedInPath.length / pathResources.length;
  };
}, [progress.completedResources]);
```

#### Use Callback Dependencies Carefully

```typescript
// Good: Minimal dependencies
const updatePreference = useCallback((key: string, value: any) => {
  setProgress(prev => ({
    ...prev,
    preferences: {
      ...prev.preferences,
      [key]: value
    }
  }));
}, []); // No dependencies needed

// Avoid: Unnecessary dependencies
const updatePreference = useCallback((key: string, value: any) => {
  // ... same logic
}, [progress]); // Will recreate on every progress change
```

### 4. Type Safety

#### Define Strict Types

```typescript
// Good: Specific action types
type ProgressAction =
  | { type: 'TOGGLE_FAVORITE'; payload: string }
  | { type: 'MARK_COMPLETE'; payload: string }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<UserPreferences> };

// Avoid: Generic action types
type ProgressAction = {
  type: string;
  payload: any;
};
```

#### Use Generic Contexts When Appropriate

```typescript
interface ListContextType<T> {
  items: T[];
  addItem: (item: T) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<T>) => void;
}

function createListContext<T>() {
  return createContext<ListContextType<T> | undefined>(undefined);
}
```

## Common Patterns

### 1. Persistent State

```typescript
const usePersistentState = <T>(key: string, defaultValue: T) => {
  const [state, setState] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState] as const;
};
```

### 2. Async State Management

```typescript
const useAsyncState = <T>(asyncFn: () => Promise<T>) => {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: string | null;
  }>({
    data: null,
    loading: false,
    error: null
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await asyncFn();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }));
    }
  }, [asyncFn]);

  return { ...state, execute };
};
```

### 3. Form State Integration

```typescript
const useFormWithProgress = (courseId: string) => {
  const { markComplete } = useUserProgress();
  const form = useForm();

  const handleSubmit = form.handleSubmit(async (data) => {
    // Process form data
    await processFormData(data);
    
    // Mark course as complete
    markComplete(courseId);
    
    // Show success message
    toast.success('Course completed!');
  });

  return { form, handleSubmit };
};
```

## Troubleshooting

### Common Issues

#### 1. Context Not Found Error

```typescript
// Error: useUserProgress must be used within UserProgressProvider
// Solution: Ensure component is wrapped in provider

const App = () => (
  <UserProgressProvider>
    <MyComponent /> {/* Now has access to context */}
  </UserProgressProvider>
);
```

#### 2. Stale Closure in useEffect

```typescript
// Problem: Stale closure
useEffect(() => {
  const interval = setInterval(() => {
    setCount(count + 1); // 'count' is stale
  }, 1000);
  return () => clearInterval(interval);
}, []); // Empty dependency array

// Solution: Use functional update
useEffect(() => {
  const interval = setInterval(() => {
    setCount(prev => prev + 1); // Always current
  }, 1000);
  return () => clearInterval(interval);
}, []);
```

#### 3. Unnecessary Re-renders

```typescript
// Problem: Context value recreated on every render
const Provider = ({ children }) => {
  const [state, setState] = useState(initialState);
  
  return (
    <Context.Provider value={{ state, setState }}>
      {children}
    </Context.Provider>
  );
};

// Solution: Memoize context value
const Provider = ({ children }) => {
  const [state, setState] = useState(initialState);
  
  const value = useMemo(() => ({ state, setState }), [state]);
  
  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
};
```

### Debugging State

#### 1. Add Debug Logging

```typescript
const useUserProgress = () => {
  const context = useContext(UserProgressContext);
  
  // Debug logging in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('UserProgress updated:', context?.progress);
    }
  }, [context?.progress]);
  
  return context;
};
```

#### 2. State DevTools

```typescript
// Custom hook for debugging
const useDebugValue = (value: any, formatter?: (value: any) => any) => {
  useDebugValue(value, formatter);
  return value;
};

// Usage in context
const useUserProgress = () => {
  const context = useContext(UserProgressContext);
  
  // Show in React DevTools
  useDebugValue(context?.progress, progress => ({
    completed: progress?.completedResources.length,
    favorites: progress?.favorites.length
  }));
  
  return context;
};
```

## Conclusion

Effective state management in the LabDojo Learning Platform relies on:

1. **Clear Architecture**: Well-defined state layers and responsibilities
2. **Type Safety**: Comprehensive TypeScript integration
3. **Performance**: Optimized re-rendering and memoization
4. **Maintainability**: Focused contexts and reusable patterns
5. **Testing**: Comprehensive test coverage for state logic

By following these patterns and best practices, the application maintains scalable, performant, and maintainable state management that supports the platform's educational goals.

For specific implementation details, refer to the existing context providers and custom hooks in the codebase.
