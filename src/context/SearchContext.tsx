
import React, { createContext, useContext, useState } from 'react';
import { SearchFilters, SearchItem } from '../types/learningPath';
import { useBackendData } from './BackendDataContext';

interface SearchContextType {
  searchQuery: string;
  searchResults: SearchItem[];
  filters: SearchFilters;
  isLoading: boolean;
  search: (query: string) => void;
  updateFilters: (filters: Partial<SearchFilters>) => void;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider');
  }
  return context;
};

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { data } = useBackendData();

  const search = (query: string) => {
    setSearchQuery(query);
    setIsLoading(true);
    
    // Convert learning paths and courses to search-friendly format
    const allItems: SearchItem[] = [
      ...data.learningPaths.map(path => ({
        id: path.id,
        title: path.title,
        description: path.description,
        type: 'path' as const,
        url: `/learning-path/${path.id}`,
        tags: path.tags || [],
        category: path.category || 'General',
        difficulty: 'Intermediate' // Default difficulty for paths
      })),
      ...Object.values(data.courses).map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        type: 'course' as const,
        url: `/course/${course.id}`,
        tags: course.tags || [],
        category: course.category || 'General',
        difficulty: course.difficulty || 'Intermediate'
      }))
    ];

    // Simple search implementation
    if (query.trim() === '') {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    const filteredResults = allItems.filter(item => {
      const searchTerm = query.toLowerCase();
      return (
        item.title.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    });

    setTimeout(() => {
      setSearchResults(filteredResults);
      setIsLoading(false);
    }, 200);
  };

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setFilters({});
  };

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
