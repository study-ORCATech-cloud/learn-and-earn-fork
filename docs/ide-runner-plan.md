# IDE Code Runner Implementation Plan

## Overview
This document outlines the comprehensive plan to implement browser-based code execution capabilities in the LabDojo IDE, allowing users to run code directly in their browser without requiring backend infrastructure.

## 🎯 Goals
- Execute code directly in the browser for multiple languages
- Provide real-time output and error handling
- Maintain security through proper sandboxing
- Offer live preview capabilities for web technologies
- Support educational coding exercises and labs

## 🏗️ Architecture Overview

```
┌─────────────────┬─────────────────┐
│                 │                 │
│   Monaco Editor │   Runner Panel  │
│                 │                 │
│   Files Tree    │   ┌───────────┐ │
│                 │   │ Output    │ │
│   [Run] Button  │   │ Console   │ │
│                 │   │ Preview   │ │
│                 │   │ Errors    │ │
│                 │   └───────────┘ │
└─────────────────┴─────────────────┘
```

## 📋 Implementation Phases

### Phase 1: Core Infrastructure (Week 1-2)
**Goal**: Set up the foundation for code execution

#### 1.1 UI Components
- [ ] Create `CodeRunner` component
- [ ] Add Runner Panel to IDE layout
- [ ] Implement output/console display
- [ ] Add Run button to toolbar
- [ ] Create loading states and error handling

#### 1.2 Base Runner Service
```typescript
interface CodeRunner {
  language: string;
  execute(code: string, files?: FileMap): Promise<ExecutionResult>;
  stop(): void;
  isSupported(): boolean;
}

interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
  memoryUsage?: number;
}
```

#### 1.3 File Structure
```
src/
├── components/
│   └── ide/
│       ├── CodeRunner.tsx        # Main runner component
│       ├── OutputPanel.tsx       # Output display
│       ├── ConsoleOutput.tsx     # Console logs
│       └── PreviewPanel.tsx      # Live preview
├── services/
│   └── runners/
│       ├── BaseRunner.ts         # Abstract base class
│       ├── JavaScriptRunner.ts   # JS execution
│       ├── PythonRunner.ts       # Python via Pyodide
│       ├── WebRunner.ts          # HTML/CSS/JS preview
│       └── RunnerFactory.ts      # Runner selection
└── types/
    └── runner.ts                 # Type definitions
```

### Phase 2: JavaScript Execution (Week 2-3)
**Goal**: Implement secure JavaScript code execution

#### 2.1 Web Worker Setup
- [ ] Create isolated Web Worker for JS execution
- [ ] Implement console capture and redirection
- [ ] Add timeout and memory limits
- [ ] Handle errors and exceptions gracefully

#### 2.2 JavaScript Runner Implementation
```typescript
class JavaScriptRunner extends BaseRunner {
  private worker: Worker;
  
  async execute(code: string): Promise<ExecutionResult> {
    return new Promise((resolve) => {
      this.worker.postMessage({
        code,
        timestamp: Date.now()
      });
      
      this.worker.onmessage = (event) => {
        resolve(event.data);
      };
    });
  }
}
```

#### 2.3 Security Features
- [ ] Sandboxed execution environment
- [ ] Disable dangerous APIs (file system, network)
- [ ] Execution timeout (5-10 seconds)
- [ ] Memory usage limits
- [ ] Code validation and sanitization

#### 2.4 Feature Set
- [x] Console.log output capture
- [x] Error handling and stack traces
- [x] Variable inspection
- [x] Multiple file support
- [x] Import/export between files
- [x] Async/await support
- [x] DOM manipulation (limited)

### Phase 3: Python Execution (Week 3-4)
**Goal**: Add Python support using Pyodide

#### 3.1 Pyodide Integration
- [ ] Load Pyodide runtime (lazy loading)
- [ ] Configure Python environment
- [ ] Handle package imports
- [ ] Implement matplotlib/plotting support

#### 3.2 Python Runner Implementation
```typescript
class PythonRunner extends BaseRunner {
  private pyodide: any;
  
  async initialize() {
    if (!this.pyodide) {
      this.pyodide = await loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/"
      });
    }
  }
  
  async execute(code: string): Promise<ExecutionResult> {
    await this.initialize();
    
    // Capture stdout
    this.pyodide.runPython(`
      import sys
      from io import StringIO
      sys.stdout = StringIO()
    `);
    
    const result = this.pyodide.runPython(code);
    const output = this.pyodide.runPython("sys.stdout.getvalue()");
    
    return { success: true, output, result };
  }
}
```

#### 3.3 Python Features
- [x] Standard library support
- [x] NumPy, Pandas integration
- [x] Matplotlib plotting
- [x] File I/O simulation
- [x] Package installation (micropip)
- [x] Interactive REPL mode
- [x] Data visualization output

#### 3.4 Educational Python Libraries
```python
# Pre-loaded packages for education
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import json
import math
import random
import datetime
```

### Phase 4: Web Technologies (Week 4-5)
**Goal**: Live preview for HTML, CSS, JavaScript

#### 4.1 Live Preview System
- [ ] Iframe-based preview
- [ ] Real-time updates on code change
- [ ] Responsive preview modes
- [ ] Device simulation

#### 4.2 Web Runner Implementation
```typescript
class WebRunner extends BaseRunner {
  private previewFrame: HTMLIFrameElement;
  
  async execute(files: FileMap): Promise<ExecutionResult> {
    const html = files['index.html'] || '';
    const css = files['style.css'] || '';
    const js = files['script.js'] || '';
    
    const previewContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${css}</style>
        </head>
        <body>
          ${html}
          <script>
            // Console capture for iframe
            window.parent.postMessage({
              type: 'console',
              data: arguments
            }, '*');
            
            ${js}
          </script>
        </body>
      </html>
    `;
    
    this.previewFrame.srcdoc = previewContent;
    return { success: true, output: 'Preview updated' };
  }
}
```

#### 4.3 Web Features
- [x] Multi-file HTML projects
- [x] CSS preprocessing (optional)
- [x] JavaScript console in preview
- [x] Responsive design testing
- [x] External CDN library support
- [x] Mobile device simulation
- [x] Auto-refresh on save

### Phase 5: Advanced Languages (Week 5-6)
**Goal**: Support for compiled languages via WebAssembly

#### 5.1 WebAssembly Runners
- [ ] C/C++ compilation (Emscripten)
- [ ] Rust execution
- [ ] Go WebAssembly support
- [ ] Assembly.js integration

#### 5.2 Online Compiler Integration
```typescript
class RemoteRunner extends BaseRunner {
  async execute(code: string, language: string): Promise<ExecutionResult> {
    // Integration with Judge0 or similar
    const response = await fetch('/api/execute', {
      method: 'POST',
      body: JSON.stringify({ code, language }),
    });
    
    return response.json();
  }
}
```

#### 5.3 Supported Languages
- [x] **Immediate (Browser-based)**:
  - JavaScript/TypeScript
  - Python (Pyodide)
  - HTML/CSS
  - Markdown
  - JSON

- [x] **WebAssembly**:
  - C/C++
  - Rust
  - Go
  - AssemblyScript

- [x] **Online Compilation**:
  - Java
  - C#
  - PHP
  - Ruby
  - Swift

### Phase 6: Enhanced Features (Week 6-7)
**Goal**: Advanced IDE capabilities

#### 6.1 Multi-File Projects
- [ ] File dependency resolution
- [ ] Import/export handling
- [ ] Package.json support for Node.js projects
- [ ] Requirements.txt for Python

#### 6.2 Interactive Features
- [ ] Variable inspection and debugging
- [ ] Step-through execution (JavaScript)
- [ ] Memory usage visualization
- [ ] Performance profiling
- [ ] Test runner integration

#### 6.3 Educational Enhancements
- [ ] Code execution hints and tips
- [ ] Automated test validation
- [ ] Expected output comparison
- [ ] Progress tracking per exercise
- [ ] Code quality metrics

## 🔧 Technical Implementation Details

### Runner Factory Pattern
```typescript
class RunnerFactory {
  static createRunner(language: string): CodeRunner {
    switch (language) {
      case 'javascript':
      case 'js':
        return new JavaScriptRunner();
      case 'python':
      case 'py':
        return new PythonRunner();
      case 'html':
      case 'web':
        return new WebRunner();
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
  }
}
```

### Language Detection
```typescript
const detectLanguage = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'html': 'html',
    'css': 'css',
    'json': 'json',
    'md': 'markdown',
    // ... more mappings
  };
  
  return languageMap[extension] || 'plaintext';
};
```

### Output Formatting
```typescript
interface FormattedOutput {
  type: 'log' | 'error' | 'result' | 'plot';
  content: string | object;
  timestamp: number;
  level?: 'info' | 'warn' | 'error';
}

class OutputFormatter {
  static format(output: any, type: string): FormattedOutput[] {
    // Handle different output types
    // Console logs, errors, plots, data tables, etc.
  }
}
```

## 🚀 UI/UX Design

### Runner Panel Layout
```typescript
const RunnerPanel = () => {
  return (
    <div className="flex flex-col h-full">
      {/* Header with controls */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Button onClick={runCode} disabled={isRunning}>
            {isRunning ? <Loader /> : <Play />}
            Run Code
          </Button>
          <Button onClick={stopExecution} variant="outline">
            <Square />
            Stop
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline">{detectedLanguage}</Badge>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Settings className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Auto-run on save</DropdownMenuItem>
              <DropdownMenuItem>Clear output</DropdownMenuItem>
              <DropdownMenuItem>Download output</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Tabbed output area */}
      <Tabs className="flex-1">
        <TabsList>
          <TabsTrigger value="output">Output</TabsTrigger>
          <TabsTrigger value="console">Console</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
        </TabsList>
        
        <TabsContent value="output">
          <OutputDisplay output={executionResult?.output} />
        </TabsContent>
        
        <TabsContent value="console">
          <ConsoleOutput logs={consoleLogs} />
        </TabsContent>
        
        <TabsContent value="preview">
          <PreviewPanel files={currentFiles} />
        </TabsContent>
        
        <TabsContent value="errors">
          <ErrorDisplay errors={executionErrors} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
```

### Responsive Design
- **Desktop**: Side-by-side editor and runner
- **Tablet**: Stackable panels with tabs
- **Mobile**: Full-screen mode switching

## 🔒 Security Considerations

### Sandboxing Strategy
1. **Web Workers**: Isolated execution context
2. **CSP Headers**: Content Security Policy restrictions
3. **API Restrictions**: Disable file system, network access
4. **Resource Limits**: CPU time, memory usage caps
5. **Code Validation**: AST parsing for dangerous patterns

### Safe APIs Only
```typescript
const ALLOWED_APIS = [
  'console',
  'Math',
  'Date',
  'JSON',
  'Array',
  'Object',
  'String',
  'Number',
  // Educational APIs only
];

const BLOCKED_APIS = [
  'fetch',
  'XMLHttpRequest',
  'WebSocket',
  'localStorage',
  'sessionStorage',
  'indexedDB',
  // Dangerous APIs
];
```

## 📊 Performance Optimization

### Lazy Loading Strategy
- Load Pyodide only when Python code is executed
- Cache compiled WebAssembly modules
- Progressive loading of language support
- Service Worker for offline capability

### Resource Management
- Automatic cleanup of execution contexts
- Memory usage monitoring
- Execution time limits
- Output size restrictions

## 🧪 Testing Strategy

### Unit Tests
- [ ] Runner factory creation
- [ ] Individual language runners
- [ ] Output formatting
- [ ] Error handling
- [ ] Security restrictions

### Integration Tests
- [ ] Multi-file project execution
- [ ] Cross-language scenarios
- [ ] UI component interactions
- [ ] Performance benchmarks

### Educational Content Tests
- [ ] Sample exercise validation
- [ ] Expected output verification
- [ ] Progressive difficulty testing
- [ ] Accessibility compliance

## 🚀 Deployment Plan

### Phase Rollout
1. **Beta Release**: JavaScript runner only
2. **Limited Release**: Add Python support
3. **Full Release**: All language support
4. **Enhancement**: Advanced features

### Feature Flags
```typescript
const RUNNER_FEATURES = {
  javascript: true,
  python: process.env.REACT_APP_PYTHON_RUNNER === 'true',
  webassembly: process.env.REACT_APP_WASM_RUNNER === 'true',
  remoteExecution: process.env.REACT_APP_REMOTE_RUNNER === 'true',
};
```

## 📈 Success Metrics

### User Engagement
- Code execution frequency per session
- Time spent in IDE vs viewer mode
- Feature adoption rates
- User satisfaction scores

### Technical Metrics
- Execution time performance
- Error rates and types
- Resource usage patterns
- Browser compatibility

### Educational Outcomes
- Exercise completion rates
- Code quality improvements
- Learning progression speed
- Support ticket reduction

## 🔮 Future Enhancements

### Advanced Features
- AI-powered code suggestions
- Collaborative real-time coding
- Git integration and version control
- Cloud project synchronization
- Mobile app with runner support

### Language Ecosystem
- Package manager integration
- Database connections (SQLite)
- API simulation and mocking
- Microservice testing
- DevOps pipeline simulation

## 📚 References and Resources

### Documentation
- [Pyodide Documentation](https://pyodide.org/)
- [WebAssembly Guide](https://webassembly.org/)
- [Web Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)
- [Monaco Editor API](https://microsoft.github.io/monaco-editor/)

### Libraries and Tools
- **Pyodide**: Python in the browser
- **Emscripten**: C/C++ to WebAssembly
- **Judge0**: Online code execution API
- **CodeMirror**: Alternative code editor
- **Sandpack**: React-based code runner

### Security Resources
- [OWASP Secure Coding Practices](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/)
- [Content Security Policy Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Web Worker Security](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers#Worker_global_scope)

---

## 📋 Implementation Checklist

### Phase 1: Foundation ✅
- [ ] Create base runner architecture
- [ ] Implement UI components
- [ ] Set up testing framework
- [ ] Define type interfaces

### Phase 2: JavaScript ⏳
- [ ] Web Worker implementation
- [ ] Console output capture
- [ ] Error handling
- [ ] Security sandboxing

### Phase 3: Python 📋
- [ ] Pyodide integration
- [ ] Package management
- [ ] Plot output support
- [ ] Performance optimization

### Phase 4: Web Technologies 📋
- [ ] Live preview system
- [ ] Multi-file support
- [ ] Responsive testing
- [ ] External library loading

### Phase 5: Advanced Languages 📋
- [ ] WebAssembly runners
- [ ] Remote execution API
- [ ] Language-specific features
- [ ] Performance profiling

### Phase 6: Polish 📋
- [ ] Educational enhancements
- [ ] Accessibility improvements
- [ ] Mobile responsiveness
- [ ] Documentation completion

---

*This document will be updated as implementation progresses and requirements evolve.*