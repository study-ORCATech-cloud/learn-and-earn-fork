import { BaseRunner } from './BaseRunner';
import { ExecutionResult, FileMap, ConsoleLog } from '../../types/runner';

// Pyodide types
declare global {
  interface Window {
    loadPyodide: (options?: { 
      indexURL?: string; 
      stdout?: (text: string) => void;
      stderr?: (text: string) => void;
    }) => Promise<PyodideInterface>;
  }
}

interface PyodideInterface {
  runPython: (code: string) => any;
  runPythonAsync: (code: string) => Promise<any>;
  loadPackage: (packages: string | string[]) => Promise<void>;
  globals: {
    get: (name: string) => any;
    set: (name: string, value: any) => void;
  };
  FS: {
    writeFile: (path: string, data: string | ArrayBuffer) => void;
    readFile: (path: string, options?: { encoding: string }) => string | ArrayBuffer;
  };
}

export class PythonRunner extends BaseRunner {
  private pyodide: PyodideInterface | null = null;
  private isInitializing: boolean = false;

  constructor() {
    super('python');
  }

  async execute(code: string, files?: FileMap): Promise<ExecutionResult> {
    const startTime = Date.now();
    
    try {
      this.isRunning = true;
      
      // Initialize Pyodide if not already done
      if (!this.pyodide && !this.isInitializing) {
        await this.initializePyodide();
      }
      
      // Wait for initialization to complete if in progress
      while (this.isInitializing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      if (!this.pyodide) {
        throw new Error('Failed to initialize Python environment');
      }

      // Set up files in Pyodide filesystem
      if (files) {
        this.setupFiles(files);
      }

      // Capture output
      const logs: ConsoleLog[] = [];
      let output = '';
      
      // Enhanced Python security setup with module blocking and error handling
      const pythonSetup = `
import sys
import io
from contextlib import redirect_stdout, redirect_stderr

# Fix Pyodide's excepthook to prevent virtual filesystem errors
def _safe_excepthook(exc_type, exc_value, exc_traceback):
    try:
        # Try to use the default excepthook
        sys.__excepthook__(exc_type, exc_value, exc_traceback)
    except (NotADirectoryError, FileNotFoundError, OSError):
        # If file system access fails, just print the exception
        try:
            import traceback
            traceback.print_exception(exc_type, exc_value, exc_traceback, limit=10)
        except:
            # Last resort: minimal error reporting
            print(f"Error: {exc_type.__name__}: {exc_value}")

# Replace sys.excepthook with our safe version
sys.excepthook = _safe_excepthook

# Block dangerous modules for security
_blocked_modules = [
    'os', 'subprocess', 'requests', 'urllib', 'urllib2', 'urllib3',
    'http', 'httplib', 'socket', 'socketserver', 'ftplib', 'poplib',
    'imaplib', 'nntplib', 'smtplib', 'telnetlib', 'webbrowser',
    'ctypes', '_ctypes', 'threading', '_thread', 'multiprocessing',
    'pickle', 'cPickle', '_pickle', 'shelve', 'marshal'
]

# Remove and block dangerous modules
for module_name in _blocked_modules:
    if module_name in sys.modules:
        del sys.modules[module_name]
    # Prevent future imports
    sys.modules[module_name] = None

# Override built-in dangerous functions (but preserve ones needed by Pyodide)
import builtins
_original_open = builtins.open
_original_input = builtins.input if hasattr(builtins, 'input') else None
_original_eval = builtins.eval
_original_exec = builtins.exec

def _blocked_function(name):
    def _wrapper(*args, **kwargs):
        raise SecurityError(f"Function '{name}' is blocked for security reasons")
    return _wrapper

def _restricted_eval(source, globals=None, locals=None):
    # Block eval with user-provided code but allow internal usage
    if isinstance(source, str) and any(danger in source.lower() for danger in ['import', 'open', 'exec', '__']):
        raise SecurityError("eval() with potentially dangerous code is blocked")
    return _original_eval(source, globals, locals)

def _restricted_exec(source, globals=None, locals=None):
    # Block exec with dangerous imports but allow basic usage
    if isinstance(source, str) and any(danger in source.lower() for danger in ['import os', 'import subprocess', '__import__']):
        raise SecurityError("exec() with dangerous imports is blocked")
    return _original_exec(source, globals, locals)

class SecurityError(Exception):
    pass

# Apply restricted functions (but don't completely block compile, eval, exec as Pyodide needs them)
builtins.open = _blocked_function('open')
builtins.input = _blocked_function('input')
builtins.eval = _restricted_eval
builtins.exec = _restricted_exec
# Note: We don't block compile as Pyodide needs it internally
# Note: We don't block __import__ as it breaks Pyodide's module system

# Set up output capture
_stdout_capture = io.StringIO()
_stderr_capture = io.StringIO()

def _get_output():
    stdout_content = _stdout_capture.getvalue()
    stderr_content = _stderr_capture.getvalue()
    return stdout_content, stderr_content

def _clear_output():
    global _stdout_capture, _stderr_capture
    _stdout_capture = io.StringIO()
    _stderr_capture = io.StringIO()
`;

      // Run setup code
      this.pyodide.runPython(pythonSetup);
      
      // Execute user code with output capture
      const executionCode = `
with redirect_stdout(_stdout_capture), redirect_stderr(_stderr_capture):
    try:
${code.split('\n').map(line => `        ${line}`).join('\n')}
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
`;

      await this.pyodide.runPythonAsync(executionCode);
      
      // Get captured output
      const getOutputCode = `
stdout_content, stderr_content = _get_output()
(stdout_content, stderr_content)
`;
      
      const [stdout, stderr] = this.pyodide.runPython(getOutputCode);
      
      // Process output
      if (stdout) {
        output = stdout;
        logs.push({
          type: 'log',
          content: stdout,
          timestamp: Date.now()
        });
      }
      
      if (stderr) {
        logs.push({
          type: 'error',
          content: stderr,
          timestamp: Date.now()
        });
      }

      const executionTime = Date.now() - startTime;
      
      // If there's error output, consider it a failure
      const success = !stderr || !stderr.includes('Error:');
      
      // Apply output and log limits for security
      const limitedOutput = this.limitOutput(output);
      const limitedLogs = this.limitLogs(logs);
      
      return {
        success,
        output: limitedOutput,
        error: stderr && stderr.includes('Error:') ? this.limitOutput(stderr) : undefined,
        executionTime,
        logs: limitedLogs
      };
      
    } catch (error) {
      return {
        success: false,
        output: '',
        error: this.formatError(error instanceof Error ? error : new Error(String(error))),
        executionTime: Date.now() - startTime,
        logs: []
      };
    } finally {
      this.isRunning = false;
    }
  }

  stop(): void {
    super.stop();
    // Note: Pyodide doesn't have a direct way to interrupt running code
    // We rely on the timeout mechanism in the base class
  }

  isSupported(): boolean {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return false;
    }
    
    // Pyodide can be loaded dynamically, so we don't need to check for loadPyodide
    // Just check for basic browser capabilities needed for Pyodide
    try {
      // Check for WebAssembly support (required by Pyodide)
      if (typeof WebAssembly === 'undefined') {
        return false;
      }
      
      // Check for basic APIs that Pyodide needs
      return typeof fetch !== 'undefined' && 
             typeof Promise !== 'undefined' && 
             typeof ArrayBuffer !== 'undefined';
             
    } catch (error) {
      return false;
    }
  }

  private async initializePyodide(): Promise<void> {
    if (this.pyodide || this.isInitializing) {
      return;
    }

    this.isInitializing = true;
    
    try {
      // Load Pyodide script if not already loaded
      if (!window.loadPyodide) {
        await this.loadPyodideScript();
      }

      // Temporarily suppress all console output during Pyodide initialization
      const originalConsole = {
        log: console.log,
        info: console.info,
        warn: console.warn,
        error: console.error
      };
      
      // Replace console methods with silent versions
      console.log = () => {};
      console.info = () => {};
      console.warn = () => {};
      console.error = () => {};

      try {
        // Initialize Pyodide silently
        this.pyodide = await window.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
          stdout: () => {
            // Filter out common Pyodide internal warnings - no console logging
          },
          stderr: () => {
            // Filter out common Pyodide internal warnings - no console logging
          }
        });

        // Load common packages silently
        await this.pyodide.loadPackage(['numpy', 'pandas', 'matplotlib']);
        
      } finally {
        // Restore original console methods
        console.log = originalConsole.log;
        console.info = originalConsole.info;
        console.warn = originalConsole.warn;
        console.error = originalConsole.error;
      }
      
    } catch (error) {
      this.pyodide = null;
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  private async loadPyodideScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Pyodide script'));
      document.head.appendChild(script);
    });
  }

  private limitOutput(output: string): string {
    if (output.length > this.config.maxOutputSize) {
      return output.substring(0, this.config.maxOutputSize) + 
             `\n\n... (Output truncated - exceeded ${this.config.maxOutputSize} characters limit)`;
    }
    return output;
  }

  private limitLogs(logs: ConsoleLog[]): ConsoleLog[] {
    if (logs.length > this.config.maxConsoleEntries) {
      const truncatedLogs = logs.slice(0, this.config.maxConsoleEntries);
      truncatedLogs.push({
        type: 'warn',
        content: `... (${logs.length - this.config.maxConsoleEntries} more entries truncated)`,
        timestamp: Date.now()
      });
      return truncatedLogs;
    }
    return logs;
  }

  private setupFiles(files: FileMap): void {
    if (!this.pyodide) return;

    Object.entries(files).forEach(([fileName, content]) => {
      if (fileName.endsWith('.py')) {
        try {
          this.pyodide!.FS.writeFile(fileName, content);
        } catch (error) {
          // Silently ignore file write failures
        }
      }
    });
  }
}