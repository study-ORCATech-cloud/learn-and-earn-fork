// Type definitions for the code runner system

export interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
  memoryUsage?: number;
  logs?: ConsoleLog[];
}

export interface ConsoleLog {
  type: 'log' | 'error' | 'warn' | 'info';
  content: string;
  timestamp: number;
}

export interface FileMap {
  [fileName: string]: string;
}

export interface CodeRunner {
  language: string;
  execute(code: string, files?: FileMap): Promise<ExecutionResult>;
  stop(): void;
  isSupported(): boolean;
}

export interface FormattedOutput {
  type: 'log' | 'error' | 'result' | 'plot';
  content: string | object;
  timestamp: number;
  level?: 'info' | 'warn' | 'error';
}

export type SupportedLanguage = 'javascript' | 'python' | 'html' | 'css' | 'typescript';

export interface RunnerConfig {
  timeout: number;
  memoryLimit: number;
  maxOutputSize: number;
  maxConsoleEntries: number;
  allowedAPIs: string[];
  blockedAPIs: string[];
}