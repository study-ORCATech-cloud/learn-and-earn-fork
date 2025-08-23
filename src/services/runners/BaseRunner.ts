import { CodeRunner, ExecutionResult, FileMap, RunnerConfig } from '../../types/runner';

export abstract class BaseRunner implements CodeRunner {
  public readonly language: string;
  protected config: RunnerConfig;
  protected isRunning = false;

  constructor(language: string, config?: Partial<RunnerConfig>) {
    this.language = language;
    this.config = {
      timeout: 5000, // Reduced to 5 seconds for security
      memoryLimit: 10 * 1024 * 1024, // Reduced to 10MB for security
      maxOutputSize: 100000, // 100KB max output
      maxConsoleEntries: 1000, // Max 1000 console log entries
      allowedAPIs: ['console', 'Math', 'Date', 'JSON', 'Array', 'Object', 'String', 'Number'],
      blockedAPIs: [
        'fetch', 'XMLHttpRequest', 'WebSocket', 'localStorage', 'sessionStorage', 'indexedDB',
        'navigator', 'location', 'history', 'document', 'window', 'parent', 'top', 'frames',
        'eval', 'Function', 'setTimeout', 'setInterval', 'setImmediate', 'importScripts'
      ],
      ...config
    };
  }

  abstract execute(code: string, files?: FileMap): Promise<ExecutionResult>;

  stop(): void {
    this.isRunning = false;
  }

  isSupported(): boolean {
    // Basic browser compatibility check
    return typeof Worker !== 'undefined' && typeof Blob !== 'undefined';
  }

  protected createSecureContext(code: string): string {
    // Create a secure execution context by wrapping code
    const blockedAPIsCode = this.config.blockedAPIs
      .map(api => `delete ${api};`)
      .join('\n');

    return `
      // Block dangerous APIs
      ${blockedAPIsCode}
      
      // Capture console output
      const logs = [];
      const originalConsole = console;
      console = {
        log: (...args) => { 
          logs.push({ type: 'log', content: args.map(String).join(' '), timestamp: Date.now() }); 
          // Don't log to browser console - only capture for output panel
        },
        error: (...args) => { 
          logs.push({ type: 'error', content: args.map(String).join(' '), timestamp: Date.now() }); 
          // Don't log to browser console - only capture for output panel
        },
        warn: (...args) => { 
          logs.push({ type: 'warn', content: args.map(String).join(' '), timestamp: Date.now() }); 
          // Don't log to browser console - only capture for output panel
        },
        info: (...args) => { 
          logs.push({ type: 'info', content: args.map(String).join(' '), timestamp: Date.now() }); 
          // Don't log to browser console - only capture for output panel
        }
      };

      // Execute user code
      try {
        ${code}
      } catch (error) {
        logs.push({ 
          type: 'error', 
          content: error.message, 
          timestamp: Date.now() 
        });
        throw error;
      }

      // Return logs for processing
      self.postMessage({ logs });
    `;
  }

  protected formatError(error: Error): string {
    if (error.stack) {
      // Clean up stack trace to remove internal runner code
      const lines = error.stack.split('\n');
      const userCodeLines = lines.filter(line => 
        !line.includes('BaseRunner') && 
        !line.includes('eval') && 
        !line.includes('Worker')
      );
      return userCodeLines.join('\n');
    }
    return error.message;
  }
}