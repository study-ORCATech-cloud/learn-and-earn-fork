import { CodeRunner, SupportedLanguage } from '../../types/runner';
import { JavaScriptRunner } from './JavaScriptRunner';
import { PythonRunner } from './PythonRunner';

export class RunnerFactory {
  static createRunner(language: SupportedLanguage): CodeRunner {
    switch (language) {
      case 'javascript':
      case 'typescript':
        return new JavaScriptRunner();
      
      case 'python':
        return new PythonRunner();
      
      // Future runners will be added here
      // case 'html':
      //   return new WebRunner();
      
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
  }

  static getSupportedLanguages(): SupportedLanguage[] {
    return ['javascript', 'typescript', 'python'];
  }

  static isLanguageSupported(language: string): language is SupportedLanguage {
    return this.getSupportedLanguages().includes(language as SupportedLanguage);
  }

  static detectLanguageFromFile(fileName: string): SupportedLanguage | null {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    const languageMap: Record<string, SupportedLanguage> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      // Future mappings
      // 'html': 'html',
      // 'css': 'css',
    };
    
    return languageMap[extension || ''] || null;
  }
}