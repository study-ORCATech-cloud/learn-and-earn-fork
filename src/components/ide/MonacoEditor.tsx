import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { LabFile } from '../../types/lab';

interface MonacoEditorProps {
  file: LabFile | null;
  onContentChange: (content: string) => void;
  readOnly?: boolean;
  language?: string;
}

// Language mappings for file extensions
const LANGUAGE_MAP: { [key: string]: string } = {
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
  '.txt': 'plaintext',
};

const MonacoEditor: React.FC<MonacoEditorProps> = ({
  file,
  onContentChange,
  readOnly = false,
  language
}) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  // Determine language from file extension
  const getLanguage = (fileName: string): string => {
    if (language) return language;
    
    const ext = '.' + fileName.split('.').pop()?.toLowerCase();
    return LANGUAGE_MAP[ext] || 'plaintext';
  };

  // Configure Monaco Editor when it mounts
  const handleEditorDidMount = (editorInstance: editor.IStandaloneCodeEditor, monaco: typeof import('monaco-editor')) => {
    try {
      editorRef.current = editorInstance;

      // Configure TypeScript/JavaScript language features for real IntelliSense
      const jsDefaults = monaco.languages.typescript.javascriptDefaults;
      const tsDefaults = monaco.languages.typescript.typescriptDefaults;
      
      // Enable IntelliSense and error checking for JS/TS
      jsDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2020,
        allowNonTsExtensions: true,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.CommonJS,
        noEmit: true,
        esModuleInterop: true,
        jsx: monaco.languages.typescript.JsxEmit.React,
        reactNamespace: 'React',
        allowJs: true,
        typeRoots: ['node_modules/@types']
      });
      
      tsDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2020,
        allowNonTsExtensions: true,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.CommonJS,
        noEmit: true,
        esModuleInterop: true,
        jsx: monaco.languages.typescript.JsxEmit.React,
        reactNamespace: 'React',
        strict: true,
        typeRoots: ['node_modules/@types']
      });

      // Add common type definitions for better IntelliSense
      const commonTypes = `
        declare var console: {
          log(...args: any[]): void;
          error(...args: any[]): void;
          warn(...args: any[]): void;
          info(...args: any[]): void;
        };
        declare var setTimeout: (callback: () => void, ms: number) => number;
        declare var setInterval: (callback: () => void, ms: number) => number;
        declare var clearTimeout: (id: number) => void;
        declare var clearInterval: (id: number) => void;
      `;
      
      jsDefaults.addExtraLib(commonTypes, 'global.d.ts');
      tsDefaults.addExtraLib(commonTypes, 'global.d.ts');

      // Configure validation settings for JS/TS
      jsDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
      });
      
      tsDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
      });

      // Enhanced Python syntax highlighting (no fake validation)
      if (!monaco.languages.getLanguages().find(lang => lang.id === 'python')) {
        monaco.languages.register({ id: 'python' });
      }
      
      monaco.languages.setMonarchTokensProvider('python', {
        tokenizer: {
          root: [
            [/\b(def|class|if|elif|else|for|while|try|except|finally|with|import|from|as|return|yield|break|continue|pass|raise|assert|del|global|nonlocal|lambda|and|or|not|in|is)\b/, 'keyword'],
            [/\b(True|False|None)\b/, 'constant.language'],
            [/\b(int|float|str|list|dict|tuple|set|bool|object)\b/, 'type'],
            [/\b(print|len|range|enumerate|zip|map|filter|sorted|reversed|any|all|sum|min|max|abs|round|type|isinstance|hasattr|getattr|setattr|delattr)\b/, 'support.function'],
            [/\b\d+(\.\d+)?\b/, 'number'],
            [/"([^"\\]|\\.)*"/, 'string'],
            [/'([^'\\]|\\.)*'/, 'string'],
            [/"""[\s\S]*?"""/, 'string'],
            [/'''[\s\S]*?'''/, 'string'],
            [/#.*$/, 'comment'],
            [/[a-zA-Z_]\w*/, 'identifier'],
          ]
        }
      });

      // Enhanced language configuration for better editing experience
      monaco.languages.setLanguageConfiguration('python', {
        comments: {
          lineComment: '#'
        },
        brackets: [
          ['{', '}'],
          ['[', ']'],
          ['(', ')']
        ],
        autoClosingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '"', close: '"', notIn: ['string'] },
          { open: "'", close: "'", notIn: ['string', 'comment'] }
        ],
        surroundingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '"', close: '"' },
          { open: "'", close: "'" }
        ],
        indentationRules: {
          increaseIndentPattern: /^\s*(def|class|if|elif|else|for|while|try|except|finally|with).*:$/,
          decreaseIndentPattern: /^\s*(elif|else|except|finally).*:$/
        }
      });

      // Add Python code completion (basic snippets only)
      monaco.languages.registerCompletionItemProvider('python', {
        provideCompletionItems: (model, position) => {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn
          };

          const suggestions = [
            // Python keywords with snippets
            { label: 'def', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'def ${1:function_name}(${2:args}):\n    ${3:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range },
            { label: 'class', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'class ${1:ClassName}:\n    ${2:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range },
            { label: 'if', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'if ${1:condition}:\n    ${2:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range },
            { label: 'for', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'for ${1:item} in ${2:iterable}:\n    ${3:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range },
            { label: 'while', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'while ${1:condition}:\n    ${2:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range },
            { label: 'try', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'try:\n    ${1:pass}\nexcept ${2:Exception} as ${3:e}:\n    ${4:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range },
            
            // Built-in functions
            { label: 'print', kind: monaco.languages.CompletionItemKind.Function, insertText: 'print(${1:value})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range },
            { label: 'len', kind: monaco.languages.CompletionItemKind.Function, insertText: 'len(${1:object})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range },
            { label: 'range', kind: monaco.languages.CompletionItemKind.Function, insertText: 'range(${1:stop})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range },
            { label: 'enumerate', kind: monaco.languages.CompletionItemKind.Function, insertText: 'enumerate(${1:iterable})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range },
            { label: 'zip', kind: monaco.languages.CompletionItemKind.Function, insertText: 'zip(${1:iterable1}, ${2:iterable2})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range },
            
            // Common patterns
            { label: 'main', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'if __name__ == "__main__":\n    ${1:main()}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range },
            { label: 'import', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'import ${1:module}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range },
            { label: 'from', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'from ${1:module} import ${2:name}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range },
          ];

          return { suggestions };
        }
      });

      // Add Python hover provider for documentation
      monaco.languages.registerHoverProvider('python', {
        provideHover: (model, position) => {
          const word = model.getWordAtPosition(position);
          if (!word) return;

          const pythonDocs: { [key: string]: string } = {
            'print': 'print(*values, sep=" ", end="\\n", file=sys.stdout, flush=False)\n\nPrint values to a stream, or to sys.stdout by default.',
            'len': 'len(obj)\n\nReturn the length (the number of items) of an object.',
            'range': 'range(stop) or range(start, stop[, step])\n\nCreate a sequence of numbers from start to stop.',
            'enumerate': 'enumerate(iterable, start=0)\n\nReturn an enumerate object yielding pairs (index, value).',
            'zip': 'zip(*iterables)\n\nReturn an iterator of tuples from the input iterables.',
            'list': 'list([iterable])\n\nCreate a new list object.',
            'dict': 'dict(**kwarg) or dict(mapping, **kwarg) or dict(iterable, **kwarg)\n\nCreate a new dictionary.',
            'str': 'str(object="") or str(object, encoding, errors)\n\nCreate a new string object.',
            'int': 'int([x]) or int(x, base=10)\n\nConvert a number or string to an integer.',
            'float': 'float([x])\n\nConvert a string or number to a floating point number.',
            'bool': 'bool([x])\n\nConvert a value to a Boolean.',
          };

          const doc = pythonDocs[word.word];
          if (doc) {
            return {
              range: new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn),
              contents: [{ value: `\`\`\`python\n${doc}\n\`\`\`` }]
            };
          }
        }
      });

      // Configure custom theme to match site
      monaco.editor.defineTheme('labdojo-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'comment', foreground: '6A9955' },
          { token: 'keyword', foreground: '569CD6' },
          { token: 'string', foreground: 'CE9178' },
          { token: 'number', foreground: 'B5CEA8' },
          { token: 'function', foreground: 'DCDCAA' },
          { token: 'type', foreground: '4EC9B0' },
          { token: 'constant.language', foreground: '569CD6' },
          { token: 'support.function', foreground: 'DCDCAA' },
          { token: 'identifier', foreground: '9CDCFE' },
        ],
        colors: {
          'editor.background': '#0f172a',
          'editor.foreground': '#e2e8f0',
          'editorLineNumber.foreground': '#64748b',
          'editor.selectionBackground': '#334155',
          'editor.lineHighlightBackground': '#1e293b',
          'editorError.foreground': '#f87171',
          'editorWarning.foreground': '#fbbf24',
          'editorInfo.foreground': '#60a5fa',
        }
      });

      // Apply the custom theme
      monaco.editor.setTheme('labdojo-dark');

      // Configure enhanced editor options
      editorInstance.updateOptions({
        fontSize: 14,
        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
        lineHeight: 20,
        minimap: { enabled: true, maxColumn: 120 },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        wordWrap: 'on',
        tabSize: 2,
        insertSpaces: true,
        // Enhanced IntelliSense settings
        quickSuggestions: {
          other: true,
          comments: false,
          strings: false
        },
        parameterHints: {
          enabled: true,
          cycle: true
        },
        suggestOnTriggerCharacters: true,
        acceptSuggestionOnEnter: 'on',
        acceptSuggestionOnCommitCharacter: true,
        snippetSuggestions: 'top',
        wordBasedSuggestions: 'currentDocument',
        // Error and validation settings
        renderValidationDecorations: 'on',
        // Hover settings
        hover: {
          enabled: true,
          delay: 300
        },
        // Format settings
        formatOnPaste: true,
        formatOnType: true,
        // Folding
        folding: true,
        foldingStrategy: 'indentation',
        showFoldingControls: 'always',
        // Other helpful features
        matchBrackets: 'always',
        autoIndent: 'advanced',
        cursorSmoothCaretAnimation: 'explicit',
        smoothScrolling: true,
      });
    } catch (error) {
      // Silently handle Monaco Editor configuration errors
    }
  };

  // Handle content changes
  const handleChange = (value: string | undefined) => {
    try {
      if (value !== undefined && !readOnly) {
        onContentChange(value);
      }
    } catch (error) {
      // Silently handle editor content change errors
    }
  };

  // If no file is selected, show placeholder
  if (!file) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-950 rounded-lg border border-slate-800">
        <div className="text-center text-slate-400">
          <div className="text-4xl mb-4">📄</div>
          <p className="text-lg">Select a file to start editing</p>
          <p className="text-sm mt-2">Choose a file from the explorer to open it in the editor</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full rounded-lg overflow-hidden border border-slate-800">
      <Editor
        value={file.content || ''}
        language={getLanguage(file.name)}
        theme="labdojo-dark"
        onChange={handleChange}
        onMount={handleEditorDidMount}
        options={{
          readOnly,
          minimap: { enabled: true, maxColumn: 120 },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: 'on',
          fontSize: 14,
          lineHeight: 20,
          fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
          tabSize: 2,
          insertSpaces: true,
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
          // Enhanced IntelliSense and validation
          quickSuggestions: {
            other: true,
            comments: false,
            strings: false
          },
          parameterHints: {
            enabled: true,
            cycle: true
          },
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: 'on',
          snippetSuggestions: 'top',
          wordBasedSuggestions: 'currentDocument',
          renderValidationDecorations: 'on',
          hover: {
            enabled: true,
            delay: 300
          },
          formatOnPaste: true,
          formatOnType: true,
          folding: true,
          foldingStrategy: 'indentation',
          showFoldingControls: 'always',
          matchBrackets: 'always',
          autoIndent: 'advanced',
          cursorSmoothCaretAnimation: 'explicit',
          smoothScrolling: true,
        }}
        loading={
          <div className="h-full flex items-center justify-center bg-slate-950">
            <div className="text-center text-slate-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <p>Loading editor...</p>
            </div>
          </div>
        }
      />
    </div>
  );
};

export default MonacoEditor;