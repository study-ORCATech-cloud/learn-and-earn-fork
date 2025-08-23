import React, { useState, useCallback } from 'react';
import { Play, Square, Settings, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OutputPanel from './OutputPanel';
import { RunnerFactory } from '../../services/runners/RunnerFactory';
import { ExecutionResult } from '../../types/runner';
import { LabFile } from '../../types/lab';
import { useToast } from '@/hooks/use-toast';

interface CodeRunnerProps {
  selectedFile: LabFile | null;
  allFiles: LabFile[];
  className?: string;
}

const CodeRunner: React.FC<CodeRunnerProps> = ({
  selectedFile,
  allFiles,
  className = ''
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [activeTab, setActiveTab] = useState('output');
  const { toast } = useToast();

  // Detect language from selected file
  const detectedLanguage = selectedFile 
    ? RunnerFactory.detectLanguageFromFile(selectedFile.name)
    : null;

  
  // Check if runner is actually supported
  const checkSupport = () => {
    if (!detectedLanguage) {
      return false;
    }
    
    if (RunnerFactory.isLanguageSupported(detectedLanguage)) {
      try {
        const runner = RunnerFactory.createRunner(detectedLanguage);
        return runner.isSupported();
      } catch (error) {
        return false;
      }
    }
    return false;
  };
  
  const actuallySupported = checkSupport();

  // Create file map for multi-file execution
  const createFileMap = useCallback(() => {
    const fileMap: { [key: string]: string } = {};
    allFiles.forEach(file => {
      if (file.content && file.type === 'file') {
        fileMap[file.name] = file.content;
      }
    });
    return fileMap;
  }, [allFiles]);

  // Execute code
  const handleRunCode = useCallback(async () => {
    if (!selectedFile || !selectedFile.content || !detectedLanguage) {
      toast({
        title: "Cannot Run Code",
        description: "Please select a supported file with content to run.",
        variant: "destructive",
        className: "bg-red-900 border-red-700 text-white",
      });
      return;
    }

    setIsRunning(true);
    setActiveTab('output'); // Switch to output tab when running
    
    try {
      const runner = RunnerFactory.createRunner(detectedLanguage);
      
      if (!runner.isSupported()) {
        throw new Error('Code execution is not supported in this browser');
      }

      const fileMap = createFileMap();
      const result = await runner.execute(selectedFile.content, fileMap);
      
      setExecutionResult(result);
      
      if (result.success) {
        toast({
          title: "Code Executed Successfully",
          description: `Completed in ${result.executionTime}ms`,
          className: "bg-green-900 border-green-700 text-white",
        });
      } else {
        toast({
          title: "Execution Failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive",
          className: "bg-red-900 border-red-700 text-white",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setExecutionResult({
        success: false,
        output: '',
        error: errorMessage,
        executionTime: 0,
        logs: []
      });
      
      toast({
        title: "Execution Error",
        description: errorMessage,
        variant: "destructive",
        className: "bg-red-900 border-red-700 text-white",
      });
    } finally {
      setIsRunning(false);
    }
  }, [selectedFile, detectedLanguage, createFileMap, toast]);

  // Stop execution
  const handleStopExecution = useCallback(() => {
    setIsRunning(false);
    // Note: Individual runners handle their own cleanup in the stop() method
  }, []);

  // Clear output
  const handleClearOutput = useCallback(() => {
    setExecutionResult(null);
    setActiveTab('output');
  }, []);

  return (
    <Card className={`p-4 bg-slate-900/50 border-slate-800 h-full flex flex-col ${className}`}>
      {/* Header with controls */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleRunCode} 
            disabled={isRunning || !actuallySupported}
            className="bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700"
          >
            {isRunning ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Code
              </>
            )}
          </Button>
          
          {isRunning && (
            <Button 
              onClick={handleStopExecution} 
              variant="outline"
              className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {detectedLanguage ? (
            <Badge 
              variant="outline" 
              className={actuallySupported ? "text-green-400 border-green-500/50 bg-green-900/20" : "text-yellow-400 border-yellow-500/50 bg-yellow-900/20"}
            >
              {detectedLanguage}
              {!actuallySupported && " (not supported)"}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-slate-400 border-slate-600 bg-slate-800/50">
              No file selected
            </Badge>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-900 border-slate-700">
              <DropdownMenuItem 
                onClick={handleClearOutput}
                className="text-slate-300 hover:bg-slate-700 hover:text-white focus:bg-slate-700 focus:text-white"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Output
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Output area */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="bg-slate-900/80 border-b border-slate-700 flex-shrink-0">
            <TabsTrigger value="output" className="text-slate-400 data-[state=active]:text-white data-[state=active]:bg-slate-800 hover:text-slate-200">
              Output
            </TabsTrigger>
            {/* Future tabs for console, preview, errors */}
          </TabsList>
          
          <TabsContent value="output" className="flex-1 mt-0 p-0">
            <OutputPanel result={executionResult} isRunning={isRunning} />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Info message for unsupported files */}
      {selectedFile && !actuallySupported && (
        <div className="p-3 bg-yellow-900/20 border-t border-yellow-500/30 text-yellow-200 text-sm flex-shrink-0">
          <strong>Note:</strong> {detectedLanguage ? 
            `${detectedLanguage} execution is not supported in this browser.` : 
            'This file type is not supported for execution.'
          } Currently supported: {RunnerFactory.getSupportedLanguages().join(', ')}
          <br />
          <small>Browser requirements: Web Workers and Blob support required.</small>
        </div>
      )}
    </Card>
  );
};

export default CodeRunner;