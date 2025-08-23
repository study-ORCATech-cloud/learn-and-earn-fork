# Monaco Editor IDE Integration Plan

## Overview
This document outlines the comprehensive plan to integrate Monaco Editor (VS Code's editor) into the ORCATech learning platform, creating an in-browser IDE experience for labs and articles while maintaining the existing LabViewerPage as a fallback.

## Project Structure
```
src/
├── pages/
│   ├── LabViewerPage.tsx (existing - keep as fallback)
│   └── LabIDEPage.tsx (new - Monaco-powered IDE)
├── components/
│   └── ide/
│       ├── MonacoEditor.tsx (Monaco wrapper component)
│       ├── FileExplorer.tsx (enhanced file tree with edit capabilities)
│       ├── EditorTabs.tsx (multi-file tab management)
│       ├── IDEToolbar.tsx (save, reset, run actions)
│       └── LivePreview.tsx (optional - for web files)
└── hooks/
    └── useIDEState.tsx (IDE state management)
```

## Phase 1: Dependencies and Basic Setup

### 1.1 Package Dependencies
Add to package.json:
```json
{
  "dependencies": {
    "@monaco-editor/react": "^4.6.0",
    "monaco-editor": "^0.45.0"
  }
}
```

### 1.2 Monaco Editor Configuration
- Configure webpack/vite to handle Monaco Editor workers
- Set up language definitions and themes
- Configure IntelliSense and syntax highlighting

### 1.3 Route Setup
Add new route in App.tsx:
```typescript
<Route path="/course/:courseId/lab/:labId/ide" element={<LabIDEPage />} />
<Route path="/course/:courseId/article/:articleId/ide" element={<LabIDEPage />} />
```

## Phase 2: Core Components Development

### 2.1 MonacoEditor Component
**File**: `src/components/ide/MonacoEditor.tsx`
**Purpose**: Wrapper around Monaco Editor with custom configuration

**Key Features**:
- Dynamic language detection based on file extension
- Custom themes (dark theme to match site)
- Auto-save functionality
- Syntax highlighting for 20+ languages
- IntelliSense and code completion
- Error highlighting and linting

**Props Interface**:
```typescript
interface MonacoEditorProps {
  file: LabFile | null;
  onContentChange: (content: string) => void;
  readOnly?: boolean;
  theme?: 'vs-dark' | 'vs-light';
  language?: string;
}
```

**Implementation Details**:
- Use `@monaco-editor/react` for React integration
- Configure Monaco workers for different languages
- Handle file content synchronization
- Implement auto-save with debouncing (2 second delay)
- Add keyboard shortcuts (Ctrl+S for save, Ctrl+Z for undo)

### 2.2 FileExplorer Component
**File**: `src/components/ide/FileExplorer.tsx`
**Purpose**: Enhanced file tree with editing capabilities

**Key Features**:
- Same visual structure as current LabViewerPage
- Click to open files in editor
- Visual indicators for:
  - Modified files (unsaved changes)
  - Premium files (lock icon)
  - File types (different icons)
- Context menu for file operations (future enhancement)

**State Management**:
- Track which files are modified
- Handle file selection
- Manage expanded folders

### 2.3 EditorTabs Component
**File**: `src/components/ide/EditorTabs.tsx`
**Purpose**: Multi-file tab management

**Key Features**:
- Show currently open files as tabs
- Close tabs with X button
- Switch between files
- Show modified indicator (dot) on unsaved files
- Drag and drop to reorder tabs (future enhancement)

**Tab Interface**:
```typescript
interface EditorTab {
  file: LabFile;
  isModified: boolean;
  isActive: boolean;
}
```

### 2.4 IDEToolbar Component
**File**: `src/components/ide/IDEToolbar.tsx`
**Purpose**: Action buttons and IDE controls

**Key Features**:
- Save current file
- Save all files
- Reset file to original content
- Download all files (existing functionality)
- Run code (future enhancement for specific languages)
- Switch between IDE and viewer mode

**Actions**:
```typescript
interface IDEActions {
  saveCurrentFile: () => void;
  saveAllFiles: () => void;
  resetCurrentFile: () => void;
  resetAllFiles: () => void;
  downloadFiles: () => void;
  togglePreview: () => void; // For HTML/CSS/JS files
}
```

## Phase 3: State Management

### 3.1 useIDEState Hook
**File**: `src/hooks/useIDEState.tsx`
**Purpose**: Centralized IDE state management

**State Structure**:
```typescript
interface IDEState {
  // File management
  files: Map<string, LabFile>; // path -> file with content
  openTabs: string[]; // Array of file paths
  activeTab: string | null; // Currently active file path
  modifiedFiles: Set<string>; // Paths of modified files
  
  // UI state
  isLoading: boolean;
  error: string | null;
  showPreview: boolean;
  
  // Original content backup
  originalContent: Map<string, string>; // For reset functionality
}
```

**Actions**:
```typescript
interface IDEActions {
  // File operations
  openFile: (filePath: string) => void;
  closeFile: (filePath: string) => void;
  saveFile: (filePath: string, content: string) => void;
  resetFile: (filePath: string) => void;
  
  // Content management
  updateFileContent: (filePath: string, content: string) => void;
  
  // Tab management
  setActiveTab: (filePath: string) => void;
  reorderTabs: (newOrder: string[]) => void;
  
  // Bulk operations
  saveAllFiles: () => Promise<void>;
  resetAllFiles: () => void;
}
```

## Phase 4: Main IDE Page

### 4.1 LabIDEPage Component
**File**: `src/pages/LabIDEPage.tsx`
**Purpose**: Main IDE page that combines all components

**Layout Structure**:
```
┌─────────────────────────────────────────────────────────────┐
│ Header (existing)                                           │
├─────────────────────────────────────────────────────────────┤
│ Back Button | Lab Title              | IDE Toolbar         │
├─────┬───────────────────────────────────────────────────────┤
│     │ Editor Tabs                                           │
│ F   ├───────────────────────────────────────────────────────┤
│ i   │                                                       │
│ l   │                                                       │
│ e   │         Monaco Editor                                 │
│     │                                                       │
│ T   │                                                       │
│ r   │                                                       │
│ e   ├───────────────────────────────────────────────────────┤
│ e   │ Live Preview (optional, for web files)               │
│     │                                                       │
└─────┴───────────────────────────────────────────────────────┘
```

**Key Features**:
- Responsive layout (collapsible sidebar on mobile)
- Same data fetching logic as LabViewerPage
- Enhanced with Monaco Editor integration
- Fallback link to original LabViewerPage

## Phase 5: Language Support and Configuration

### 5.1 Language Mappings
```typescript
const LANGUAGE_MAP = {
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.py': 'python',
  '.java': 'java',
  '.cpp': 'cpp',
  '.c': 'c',
  '.cs': 'csharp',
  '.php': 'php',
  '.rb': 'ruby',
  '.go': 'go',
  '.rs': 'rust',
  '.html': 'html',
  '.css': 'css',
  '.scss': 'scss',
  '.json': 'json',
  '.xml': 'xml',
  '.md': 'markdown',
  '.yml': 'yaml',
  '.yaml': 'yaml',
  '.sql': 'sql',
  '.sh': 'shell',
  '.dockerfile': 'dockerfile',
};
```

### 5.2 Monaco Configuration
```typescript
// Configure Monaco Editor
monaco.languages.register({ id: 'custom-language' });
monaco.editor.defineTheme('orcatech-dark', {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '6A9955' },
    { token: 'keyword', foreground: '569CD6' },
    { token: 'string', foreground: 'CE9178' },
  ],
  colors: {
    'editor.background': '#0f172a', // Match site's slate-950
    'editor.foreground': '#e2e8f0', // Match site's text color
  }
});
```

## Phase 6: Advanced Features (Future Enhancements)

### 6.1 Live Preview
**For Web Technologies** (HTML/CSS/JS):
- Split pane with editor and preview
- Real-time preview updates
- Console output for JavaScript
- Responsive preview modes

### 6.2 Code Execution
**For Supported Languages**:
- Integrate with code execution services (Judge0, CodePen API)
- Show output/results panel
- Error handling and debugging
- Test case validation

### 6.3 Collaboration Features
**Multi-user Editing**:
- Real-time collaborative editing (future)
- Share IDE session with others
- Comment system on code lines

### 6.4 Project Templates
**Starter Code**:
- Language-specific templates
- Common project structures
- Boilerplate code generation

## Phase 7: Implementation Steps

### Step 1: Basic Setup (Day 1)
1. Add Monaco Editor dependencies to package.json
2. Create basic MonacoEditor component
3. Create LabIDEPage with simple layout
4. Add route and navigation link

### Step 2: Core Functionality (Day 2-3)
1. Implement FileExplorer with file opening
2. Add EditorTabs for multi-file support
3. Implement basic file editing and saving
4. Add useIDEState hook for state management

### Step 3: Enhanced Features (Day 4-5)
1. Add IDEToolbar with save/reset actions
2. Implement file modification tracking
3. Add syntax highlighting for all languages
4. Implement download functionality
5. Add proper error handling

### Step 4: Polish and Testing (Day 6-7)
1. Add loading states and error boundaries
2. Implement responsive design
3. Add keyboard shortcuts
4. Test with different file types
5. Performance optimization

### Step 5: Integration (Day 8)
1. Add toggle between IDE and viewer modes
2. Update ResourceCard to link to IDE
3. Add user preferences for default mode
4. Documentation and user guides

## Phase 8: Technical Considerations

### 8.1 Performance
- Lazy load Monaco Editor to reduce initial bundle size
- Implement virtual scrolling for large files
- Debounce auto-save to prevent excessive API calls
- Cache file content in localStorage

### 8.2 Security
- Validate file content before saving
- Prevent XSS in live preview
- Rate limiting for save operations
- Sanitize user input

### 8.3 Accessibility
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management

### 8.4 Browser Compatibility
- Modern browsers (Chrome 88+, Firefox 85+, Safari 14+)
- Progressive enhancement for older browsers
- Mobile responsiveness

## Phase 9: Rollout Strategy

### 9.1 Feature Flag Implementation
```typescript
// Add to environment variables
REACT_APP_ENABLE_IDE_MODE=true

// Use in ResourceCard
const isIDEEnabled = process.env.REACT_APP_ENABLE_IDE_MODE === 'true';
const ideUrl = `/course/${courseId}/${resourceType}/${resourceId}/ide`;
const viewerUrl = `/course/${courseId}/${resourceType}/${resourceId}`;
```

### 9.2 A/B Testing
- 50% users get IDE mode by default
- 50% users get viewer mode by default
- Track engagement and completion rates
- User feedback collection

### 9.3 Gradual Rollout
1. **Phase A**: Beta users only
2. **Phase B**: Opt-in for all users
3. **Phase C**: Default for new users
4. **Phase D**: Full rollout

## Phase 10: Success Metrics

### 10.1 User Engagement
- Time spent in IDE vs viewer
- Number of files edited per session
- Save frequency and patterns
- Feature usage statistics

### 10.2 Learning Outcomes
- Lab completion rates
- Code quality improvements
- User satisfaction scores
- Support ticket reduction

### 10.3 Technical Metrics
- Page load times
- Error rates
- Browser performance
- API response times

## Conclusion

This plan provides a comprehensive roadmap for implementing Monaco Editor as an integrated IDE within the ORCATech platform. The phased approach ensures manageable development cycles while maintaining the existing functionality as a fallback. The new IDE will significantly enhance the learning experience by allowing users to code directly in the browser with professional-grade editing capabilities.

The implementation prioritizes user experience, performance, and maintainability while providing a clear upgrade path from the current viewer-only approach to a full-featured development environment.