import { BaseRunner } from './BaseRunner';
import { ExecutionResult, FileMap, ConsoleLog } from '../../types/runner';

export class JavaScriptRunner extends BaseRunner {
  private worker: Worker | null = null;

  constructor() {
    super('javascript');
  }

  async execute(code: string, files?: FileMap): Promise<ExecutionResult> {
    const startTime = Date.now();
    
    return new Promise((resolve) => {
      try {
        this.isRunning = true;
        
        // Create a Web Worker for secure code execution
        const workerCode = this.createWorkerCode(code, files);
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(blob);
        
        this.worker = new Worker(workerUrl);
        
        // Set up timeout
        const timeout = setTimeout(() => {
          this.stop();
          resolve({
            success: false,
            output: '',
            error: 'Execution timeout - code took longer than 10 seconds',
            executionTime: Date.now() - startTime,
            logs: []
          });
        }, this.config.timeout);

        // Handle worker messages
        this.worker.onmessage = (event) => {
          clearTimeout(timeout);
          const { logs, error } = event.data;
          
          // Clean up
          this.worker?.terminate();
          URL.revokeObjectURL(workerUrl);
          this.isRunning = false;

          if (error) {
            resolve({
              success: false,
              output: '',
              error: this.formatError(new Error(error)),
              executionTime: Date.now() - startTime,
              logs: this.limitLogs(logs || [])
            });
          } else {
            const output = logs
              ?.filter((log: ConsoleLog) => log.type === 'log')
              .map((log: ConsoleLog) => log.content)
              .join('\n') || '';

            const limitedOutput = this.limitOutput(output);
            const limitedLogs = this.limitLogs(logs || []);

            resolve({
              success: true,
              output: limitedOutput,
              executionTime: Date.now() - startTime,
              logs: limitedLogs
            });
          }
        };

        // Handle worker errors
        this.worker.onerror = (error) => {
          clearTimeout(timeout);
          this.worker?.terminate();
          URL.revokeObjectURL(workerUrl);
          this.isRunning = false;

          resolve({
            success: false,
            output: '',
            error: `Worker error: ${error.message}`,
            executionTime: Date.now() - startTime,
            logs: []
          });
        };

      } catch (error) {
        this.isRunning = false;
        resolve({
          success: false,
          output: '',
          error: error instanceof Error ? error.message : 'Unknown error',
          executionTime: Date.now() - startTime,
          logs: []
        });
      }
    });
  }

  stop(): void {
    super.stop();
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }

  isSupported(): boolean {
    // Check for Web Workers and Blob support
    if (typeof Worker === 'undefined' || typeof Blob === 'undefined') {
      return false;
    }
    
    // Check if we can create a worker (some restrictive environments block this)
    try {
      const testWorker = new Worker(URL.createObjectURL(new Blob([''], { type: 'application/javascript' })));
      testWorker.terminate();
      return true;
    } catch (error) {
      return false;
    }
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

  private createWorkerCode(code: string, files?: FileMap): string {
    // Handle multiple files if provided
    let fileSetup = '';
    if (files) {
      Object.entries(files).forEach(([fileName, content]) => {
        if (fileName.endsWith('.js') && fileName !== 'main.js') {
          fileSetup += `// File: ${fileName}\n${content}\n\n`;
        }
      });
    }

    return `
      // Sandboxed JavaScript execution environment
      
      // Block dangerous APIs
      ${this.config.blockedAPIs.map(api => `delete ${api};`).join('\n')}
      
      // Capture console output
      const logs = [];
      const originalConsole = console;
      
      // Override console methods
      ['log', 'error', 'warn', 'info'].forEach(method => {
        console[method] = (...args) => {
          const content = args.map(arg => {
            if (typeof arg === 'object') {
              try {
                return JSON.stringify(arg, null, 2);
              } catch {
                return String(arg);
              }
            }
            return String(arg);
          }).join(' ');
          
          logs.push({ 
            type: method, 
            content, 
            timestamp: Date.now() 
          });
        };
      });

      try {
        // Set up additional files
        ${fileSetup}
        
        // Execute main code
        const result = (function() {
          ${code}
        })();
        
        // Send results back
        self.postMessage({ logs, result });
        
      } catch (error) {
        logs.push({ 
          type: 'error', 
          content: error.message + (error.stack ? '\\n' + error.stack : ''), 
          timestamp: Date.now() 
        });
        
        self.postMessage({ 
          logs, 
          error: error.message 
        });
      }
    `;
  }
}