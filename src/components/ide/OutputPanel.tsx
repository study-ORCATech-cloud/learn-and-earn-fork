import React from 'react';
import { ExecutionResult } from '../../types/runner';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Activity } from 'lucide-react';

interface OutputPanelProps {
  result: ExecutionResult | null;
  isRunning: boolean;
}

const OutputPanel: React.FC<OutputPanelProps> = ({ result, isRunning }) => {
  if (isRunning) {
    return (
      <Card className="p-4 bg-slate-900/50 border-slate-800 h-full">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-slate-300">Running code...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card className="p-4 bg-slate-900/50 border-slate-800 h-full">
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-slate-400">
            <div className="text-4xl mb-4">▶️</div>
            <p className="text-lg">Ready to run code</p>
            <p className="text-sm mt-2">Click the Run button to execute your code</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-slate-900/50 border-slate-800 h-full flex flex-col">
      {/* Header with execution info */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          {result.success ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : (
            <XCircle className="w-5 h-5 text-red-400" />
          )}
          <span className="text-white font-medium">
            {result.success ? 'Execution Successful' : 'Execution Failed'}
          </span>
        </div>
        
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{result.executionTime}ms</span>
          </div>
          {result.memoryUsage && (
            <div className="flex items-center gap-1">
              <Activity className="w-4 h-4" />
              <span>{(result.memoryUsage / 1024 / 1024).toFixed(2)}MB</span>
            </div>
          )}
        </div>
      </div>

      {/* Output content */}
      <div 
        className="flex-1 overflow-y-auto min-h-0 pr-2 custom-scrollbar" 
        style={{ maxHeight: 'calc(100vh - 400px)' }}
      >
        {result.error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-300 font-medium">Error</span>
            </div>
            <pre className="text-sm text-red-200 whitespace-pre-wrap break-words">
              {result.error}
            </pre>
          </div>
        )}

        {result.output && (
          <div className="mb-4 p-3 bg-slate-900/50 border border-slate-700 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-slate-300 font-medium">Output</span>
            </div>
            <pre className="text-sm text-slate-300 whitespace-pre-wrap break-words">
              {result.output}
            </pre>
          </div>
        )}

        {result.logs && result.logs.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-slate-300 font-medium">Console Logs</span>
              <Badge variant="outline" className="text-xs text-slate-400 border-slate-600">
                {result.logs.length} entries
              </Badge>
            </div>
            {result.logs.map((log, index) => (
              <div
                key={index}
                className={`p-2 rounded text-sm font-mono ${
                  log.type === 'error'
                    ? 'bg-red-900/20 border border-red-500/30 text-red-300'
                    : log.type === 'warn'
                    ? 'bg-yellow-900/20 border border-yellow-500/30 text-yellow-300'
                    : log.type === 'info'
                    ? 'bg-blue-900/20 border border-blue-500/30 text-blue-300'
                    : 'bg-slate-800/50 border border-slate-600 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs text-slate-400 border-slate-600">
                    {log.type}
                  </Badge>
                  <span className="text-xs text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <pre className="whitespace-pre-wrap break-words">{log.content}</pre>
              </div>
            ))}
          </div>
        )}

        {!result.output && !result.error && (!result.logs || result.logs.length === 0) && (
          <div className="text-center text-slate-400 py-8">
            <p>No output generated</p>
            <p className="text-sm mt-1">Your code ran successfully but produced no output</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default OutputPanel;