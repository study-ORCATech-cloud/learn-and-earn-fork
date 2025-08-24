import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, FileText, Folder, FolderOpen, Code, Eye, Save, RotateCcw, RefreshCcw, Download, Coins } from 'lucide-react';
import Header from '../components/layout/Header';
import MonacoEditor from '../components/ide/MonacoEditor';
import CodeRunner from '../components/ide/CodeRunner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { apiService } from '../services/apiService';
import { LabContent, LabFile } from '../types/lab';
import { PurchaseRequest } from '../types/orcaCoins';
import { useBackendData } from '../context/BackendDataContext';
import { useAuth } from '../context/AuthContext';
import { useOrcaWallet } from '../context/OrcaWalletContext';
import PurchaseConfirmationDialog from '../components/lab/PurchaseConfirmationDialog';
import { useToast } from '@/hooks/use-toast';

// Combine regular lab files with premium preview files (copied from LabViewerPage)
const combineLabFiles = (labContent: LabContent | null): LabFile[] => {
  if (!labContent?.content) return [];
  
  const regularFiles = labContent.content.lab_files || [];
  const previewFiles = labContent.content.premium_preview || [];
  
  // Mark preview files with a special indicator and unique paths
  const markedPreviewFiles = previewFiles.map((file, index) => ({
    ...file,
    path: `preview-${index}-${file.path}`, // Make path unique to prevent selection conflicts
    is_premium: true,
    access_granted: false,
    access_message: 'Premium preview - purchase for full access'
  }));
  
  return [...regularFiles, ...markedPreviewFiles];
};

const LabIDEPage: React.FC = () => {
  const { courseId, labId, articleId } = useParams<{ courseId: string; labId?: string; articleId?: string }>();
  const navigate = useNavigate();
  const { data } = useBackendData();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { 
    purchaseLabAccess, 
    isPurchasing, 
    purchaseError, 
    clearErrors,
    refreshBalance
  } = useOrcaWallet();
  const { toast } = useToast();
  
  // Determine content type and ID
  const contentType = labId ? 'lab' : 'article';
  const contentId = labId || articleId;
  
  // LocalStorage keys for this specific content
  const pendingChangesKey = `ide-pending-${courseId}-${contentType}-${contentId}`;
  const savedContentKey = `ide-saved-${courseId}-${contentType}-${contentId}`;
  const cachedContentKey = `lab-content-${courseId}-${contentType}-${contentId}`;
  const cacheTimestampKey = `lab-content-timestamp-${courseId}-${contentType}-${contentId}`;
  
  // State
  const [labContent, setLabContent] = useState<LabContent | null>(null);
  const [selectedFile, setSelectedFile] = useState<LabFile | null>(null);
  const [modifiedFiles, setModifiedFiles] = useState<Map<string, string>>(new Map());
  const [originalFiles, setOriginalFiles] = useState<Map<string, string>>(new Map());
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showReloadModal, setShowReloadModal] = useState(false);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);

  // Get course and content resource data (memoized to prevent infinite loops)
  const course = useMemo(() => data?.courses?.find(c => c.id === courseId), [data?.courses, courseId]);
  
  const contentResource = useMemo(() => {
    if (!course) return null;
    return course.resources?.find(r => r.id === contentId && r.type === contentType) ||
           course.resourceGroups?.flatMap(g => g.resources).find(r => r.id === contentId && r.type === contentType) ||
           null;
  }, [course, contentId, contentType]);
  
  const contentUrl = useMemo(() => contentResource?.url || '', [contentResource?.url]);

  // LocalStorage helper functions
  const savePendingChanges = (changes: Map<string, string>) => {
    try {
      const changesObject = Object.fromEntries(changes);
      localStorage.setItem(pendingChangesKey, JSON.stringify(changesObject));
    } catch (error) {
      console.warn('Failed to save pending changes:', error);
    }
  };

  const loadPendingChanges = (): Map<string, string> => {
    try {
      const stored = localStorage.getItem(pendingChangesKey);
      if (stored) {
        const changesObject = JSON.parse(stored);
        return new Map(Object.entries(changesObject) as [string, string][]);
      }
    } catch (error) {
      console.warn('Failed to load pending changes:', error);
    }
    return new Map();
  };

  const clearAllStorage = () => {
    try {
      localStorage.removeItem(pendingChangesKey);
      localStorage.removeItem(savedContentKey);
      localStorage.removeItem(cachedContentKey);
      localStorage.removeItem(cacheTimestampKey);
    } catch (error) {
      console.warn('Failed to clear IDE storage:', error);
    }
  };

  // Cache management functions
  const saveCachedContent = (content: LabContent) => {
    try {
      localStorage.setItem(cachedContentKey, JSON.stringify(content));
      localStorage.setItem(cacheTimestampKey, Date.now().toString());
    } catch (error) {
      console.warn('Failed to cache content:', error);
    }
  };

  const loadCachedContent = (): LabContent | null => {
    try {
      const cached = localStorage.getItem(cachedContentKey);
      const timestamp = localStorage.getItem(cacheTimestampKey);
      
      if (cached && timestamp) {
        const cacheAge = Date.now() - parseInt(timestamp);
        const maxCacheAge = 30 * 60 * 1000; // 30 minutes
        
        if (cacheAge < maxCacheAge) {
          return JSON.parse(cached);
        } else {
          // Cache expired, clean up
          localStorage.removeItem(cachedContentKey);
          localStorage.removeItem(cacheTimestampKey);
        }
      }
    } catch (error) {
      console.warn('Failed to load cached content:', error);
    }
    return null;
  };

  const clearCache = () => {
    try {
      localStorage.removeItem(cachedContentKey);
      localStorage.removeItem(cacheTimestampKey);
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  };

  const saveSingleFile = (filePath: string, content: string) => {
    try {
      const existing = localStorage.getItem(savedContentKey);
      const savedContent = existing ? JSON.parse(existing) : {};
      savedContent[filePath] = content;
      localStorage.setItem(savedContentKey, JSON.stringify(savedContent));
    } catch (error) {
      console.warn('Failed to save file:', error);
    }
  };

  const loadSavedContent = (): Map<string, string> => {
    try {
      const stored = localStorage.getItem(savedContentKey);
      if (stored) {
        const contentObject = JSON.parse(stored);
        return new Map(Object.entries(contentObject) as [string, string][]);
      }
    } catch (error) {
      console.warn('Failed to load saved content:', error);
    }
    return new Map();
  };

  // Recursively collect all files including nested ones
  const getAllFilesRecursively = (files: LabFile[]): LabFile[] => {
    const result: LabFile[] = [];
    
    files.forEach(file => {
      if (file.type === 'file') {
        result.push(file);
      } else if (file.type === 'directory' && file.children) {
        // Recursively get files from subdirectories
        result.push(...getAllFilesRecursively(file.children));
      }
    });
    
    return result;
  };

  // Count only files, not folders
  const countFiles = (files: LabFile[]): number => {
    let count = 0;
    files.forEach(file => {
      if (file.type === 'file') {
        count++;
      } else if (file.type === 'directory' && file.children) {
        count += countFiles(file.children);
      }
    });
    return count;
  };

  // Download all accessible content files as ZIP
  const downloadAccessibleFiles = async () => {
    if (!labContent) return;

    try {
      const allTopLevelFiles = combineLabFiles(labContent);
      const allFiles = getAllFilesRecursively(allTopLevelFiles);
      
      // Filter out preview files but include both free and premium actual content
      const downloadableFiles = allFiles.filter(file => 
        file.content && 
        file.access_granted !== false
      );

      if (downloadableFiles.length === 0) {
        toast({
          title: "No Files Available",
          description: "No downloadable files are available for this content.",
          variant: "destructive",
          className: "bg-orange-900 border-orange-700 text-white",
        });
        return;
      }

      // Dynamically import JSZip
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      // Add each file to the ZIP with proper folder structure
      downloadableFiles.forEach(file => {
        if (file.content) {
          // Use the full path to maintain folder structure
          const filePath = file.path || file.name;
          zip.file(filePath, file.content);
        }
      });

      // Generate and download the ZIP file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${contentResource?.title?.replace(/[^a-z0-9]/gi, '_') || contentType}-files.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: `Downloaded ${downloadableFiles.length} file${downloadableFiles.length > 1 ? 's' : ''} as ZIP.`,
        className: "bg-green-900 border-green-700 text-white",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Failed to create ZIP file. Please try again.",
        variant: "destructive",
        className: "bg-red-900 border-red-700 text-white",
      });
    }
  };

  const isPageRefresh = (): boolean => {
    try {
      // Use sessionStorage to track if we've been here before in this session
      const sessionKey = `ide-session-${courseId}-${contentType}-${contentId}`;
      const hasVisitedBefore = sessionStorage.getItem(sessionKey);
      
      if (hasVisitedBefore) {
        // We've been here before in this session, so this is navigation back
        return false;
      } else {
        // First visit in this session - check if user has any saved work
        const pendingChanges = localStorage.getItem(pendingChangesKey);
        const savedContent = localStorage.getItem(savedContentKey);
        
        const hasPending = pendingChanges && pendingChanges !== '{}';
        const hasSaved = savedContent && savedContent !== '{}';
        
        // Mark that we've visited this page
        sessionStorage.setItem(sessionKey, 'visited');
        
        // If user has saved work, likely they're returning after a session break
        // Only treat as refresh if they have no saved work at all
        return !(hasPending || hasSaved);
      }
      
    } catch (error) {
      console.warn('Navigation detection error:', error);
      return true; // Safe default - assume refresh
    }
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Fetch lab content and access info
  const fetchLabData = useCallback(async (forceRefresh = false) => {
    if (!contentUrl || !contentResource) {
      setError(`${contentType === 'lab' ? 'Lab' : 'Article'} not found or invalid ${contentType} configuration`);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Check for cached content first (unless force refresh)
      if (!forceRefresh) {
        const cachedContent = loadCachedContent();
        if (cachedContent) {
          setLabContent(cachedContent);
          
          // Store original content for all files
          const allFiles = combineLabFiles(cachedContent);
          const originalContent = new Map<string, string>();
          allFiles.forEach(file => {
            originalContent.set(file.path, file.content || '');
          });
          setOriginalFiles(originalContent);
          
          // Check if this is a page refresh or navigation
          const isRefresh = isPageRefresh();
          
          if (isRefresh) {
            // Page refresh - clear all storage and start fresh with cached content
            const pendingChangesKey = `ide-pending-${courseId}-${contentType}-${contentId}`;
            const savedContentKey = `ide-saved-${courseId}-${contentType}-${contentId}`;
            try {
              localStorage.removeItem(pendingChangesKey);
              localStorage.removeItem(savedContentKey);
            } catch (error) {
              console.warn('Failed to clear IDE storage:', error);
            }
          } else {
            // Navigation - restore user's work
            const pendingChanges = loadPendingChanges();
            const savedContent = loadSavedContent();
            
            // Set pending changes to show modification indicators
            if (pendingChanges.size > 0) {
              setModifiedFiles(pendingChanges);
            }
            
            // Apply content to files: saved content first, then pending changes
            allFiles.forEach(file => {
              // Apply saved content (from Save button clicks)
              const saved = savedContent.get(file.path);
              if (saved !== undefined) {
                file.content = saved;
              }
              
              // Apply pending changes (current unsaved edits) - overrides saved
              const pending = pendingChanges.get(file.path);
              if (pending !== undefined) {
                file.content = pending;
              }
            });
          }
          
          // Update the lab content with modified files so they persist in state
          const updatedContent = { ...cachedContent };
          if (updatedContent.content) {
            updatedContent.content.lab_files = allFiles.filter(f => !f.is_premium);
            updatedContent.content.premium_preview = allFiles.filter(f => f.is_premium);
          }
          setLabContent(updatedContent);
          
          // Auto-select the main file
          if (allFiles.length > 0) {
            // First, try to find common main files
            let mainFile = allFiles.find(f => {
              const fileName = f.name.toLowerCase();
              return fileName.includes('readme') || 
                     fileName.includes('instruction') ||
                     fileName.includes('index') ||
                     fileName.includes('main') ||
                     fileName === 'article.md' ||
                     fileName === 'content.md';
            });
            
            // If no main file found, select the first file
            if (!mainFile && allFiles.length > 0) {
              mainFile = allFiles[0];
            }
            
            if (mainFile) {
              setSelectedFile(mainFile);
            }
          }
          
          setIsLoading(false);
          return; // Exit early with cached content
        }
      }
      
      // Fetch from backend if no cache or force refresh
      const contentResponse = await apiService.getLabContent(contentUrl);
      
      if (contentResponse.success && contentResponse.data) {
        setLabContent(contentResponse.data);
        
        // Cache the fetched content
        saveCachedContent(contentResponse.data);
        
        // Store original content for all files
        const allFiles = combineLabFiles(contentResponse.data);
        const originalContent = new Map<string, string>();
        allFiles.forEach(file => {
          originalContent.set(file.path, file.content || '');
        });
        setOriginalFiles(originalContent);
        
        // Check if this is a page refresh or navigation
        const isRefresh = isPageRefresh();
        
        if (isRefresh) {
          // Page refresh - clear all storage and start fresh with backend content
          clearAllStorage();
        } else {
          // Navigation - restore user's work
          
          const pendingChanges = loadPendingChanges();
          const savedContent = loadSavedContent();
          
          // Set pending changes to show modification indicators
          if (pendingChanges.size > 0) {
            setModifiedFiles(pendingChanges);
          }
          
          // Apply content to files: saved content first, then pending changes
          allFiles.forEach(file => {
            // Apply saved content (from Save button clicks)
            const saved = savedContent.get(file.path);
            if (saved !== undefined) {
              file.content = saved;
            }
            
            // Apply pending changes (current unsaved edits) - overrides saved
            const pending = pendingChanges.get(file.path);
            if (pending !== undefined) {
              file.content = pending;
            }
          });
        }
        
        // Update the lab content with modified files so they persist in state
        if (contentResponse.data) {
          const updatedContent = { ...contentResponse.data };
          if (updatedContent.content) {
            updatedContent.content.lab_files = allFiles.filter(f => !f.is_premium);
            updatedContent.content.premium_preview = allFiles.filter(f => f.is_premium);
          }
          setLabContent(updatedContent);
        }
        
        // Auto-select the main file
        if (allFiles.length > 0) {
          // First, try to find common main files
          let mainFile = allFiles.find(f => {
            const fileName = f.name.toLowerCase();
            return fileName.includes('readme') || 
                   fileName.includes('instruction') ||
                   fileName.includes('index') ||
                   fileName.includes('main') ||
                   fileName === 'article.md' ||
                   fileName === 'content.md';
          });
          
          // If no main file found, select the first file
          if (!mainFile && allFiles.length > 0) {
            mainFile = allFiles[0];
          }
          
          if (mainFile) {
            setSelectedFile(mainFile);
          }
        }
      } else {
        setError('Failed to load content. Please ensure the backend API is running.');
      }
    } catch (error) {
      // Silent error handling to prevent error logging loops
      setError(`Failed to load ${contentType} content. Please try again later.`);
    } finally {
      setIsLoading(false);
    }
  }, [contentUrl, contentResource, contentType]);

  // Load data when component mounts
  useEffect(() => {
    if (!authLoading && isAuthenticated && contentUrl && contentResource) {
      try {
        fetchLabData();
      } catch (error) {
        // Prevent any error logging loops
        setError('Failed to initialize content loading.');
        setIsLoading(false);
      }
    }
  }, [fetchLabData, authLoading, isAuthenticated, contentUrl, contentResource]);

  // Note: We don't clean up sessionStorage navigation flag anymore
  // Instead, we use the presence of localStorage changes to detect navigation vs refresh

  // Toggle folder expand/collapse
  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  // Handle file selection
  const handleFileSelect = (file: LabFile) => {
    if (file.type === 'directory') {
      // Toggle folder expansion instead of selecting
      toggleFolder(file.path);
      return;
    }

    // Apply user's changes to the selected file (in case it doesn't have them)
    const pendingChanges = loadPendingChanges();
    const savedContent = loadSavedContent();
    
    const fileWithChanges = { ...file };
    
    // First apply saved content (from Save button)
    const saved = savedContent.get(file.path);
    if (saved !== undefined) {
      fileWithChanges.content = saved;
    }
    
    // Then apply pending changes (current unsaved edits) - overrides saved
    const pending = pendingChanges.get(file.path);
    if (pending !== undefined) {
      fileWithChanges.content = pending;
    }
    
    setSelectedFile(fileWithChanges);
  };

  // Handle content changes in editor
  const handleContentChange = (newContent: string) => {
    if (!selectedFile) return;
    
    // Check against the "baseline" content (saved content or original)
    const savedContent = loadSavedContent();
    const baseline = savedContent.get(selectedFile.path) || originalFiles.get(selectedFile.path) || '';
    
    // Update the modified files map (pending changes)
    const newModifiedFiles = new Map(modifiedFiles);
    if (newContent !== baseline) {
      newModifiedFiles.set(selectedFile.path, newContent);
    } else {
      newModifiedFiles.delete(selectedFile.path);
    }
    
    setModifiedFiles(newModifiedFiles);
    savePendingChanges(newModifiedFiles);

    // Update the selected file content
    setSelectedFile({
      ...selectedFile,
      content: newContent
    });
  };

  // Handle save current file
  const handleSaveFile = async () => {
    if (!selectedFile || !modifiedFiles.has(selectedFile.path)) return;
    
    try {
      setIsSaving(true);
      
      // Save the current content to persistent storage
      saveSingleFile(selectedFile.path, selectedFile.content || '');
      
      // Remove from pending changes (it's now saved)
      const newModifiedFiles = new Map(modifiedFiles);
      newModifiedFiles.delete(selectedFile.path);
      setModifiedFiles(newModifiedFiles);
      savePendingChanges(newModifiedFiles);
      
    } catch (error) {
      console.warn('Failed to save file:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle revert current file
  const handleRevertFile = () => {
    if (!selectedFile) return;
    
    // Revert to saved content (if exists) or original content
    const savedContent = loadSavedContent();
    const revertToContent = savedContent.get(selectedFile.path) || originalFiles.get(selectedFile.path) || '';
    
    // Update file content
    setSelectedFile({
      ...selectedFile,
      content: revertToContent
    });
    
    // Remove from pending changes
    const newModifiedFiles = new Map(modifiedFiles);
    newModifiedFiles.delete(selectedFile.path);
    setModifiedFiles(newModifiedFiles);
    savePendingChanges(newModifiedFiles);
  };

  // Handle reload fresh - clear all user changes and refetch from backend
  const handleReloadFresh = () => {
    setShowReloadModal(true);
  };

  const confirmReloadFresh = async () => {
    try {
      
      // Clear all user changes and cache
      clearAllStorage();
      setModifiedFiles(new Map());
      
      // Force refetch data
      setIsLoading(true);
      setError(null);
      setSelectedFile(null);
      
      // Refetch the lab content with force refresh
      await fetchLabData(true);
      
      setShowReloadModal(false);
      
    } catch (error) {
      console.warn('Failed to reload fresh content:', error);
      setError('Failed to reload content. Please try again.');
    }
  };

  // Helper function to check if file is premium preview (from LabViewerPage)
  const isPremiumPreviewFile = (file: LabFile): boolean => {
    return file.type === 'file' && 
           (file as any).is_premium === true && 
           file.access_granted === false &&
           file.access_message?.includes('Premium preview');
  };

  // Purchase handlers
  const handlePurchaseClick = () => {
    clearErrors();
    setShowPurchaseDialog(true);
  };

  const handlePurchaseConfirm = async () => {
    if (!labContent || !contentResource) return;

    const purchaseData: PurchaseRequest = {
      lab_url: contentUrl,
      lab_title: labContent.lab_info?.title || 'Lab',
      lab_description: contentResource?.description || '',
      lab_difficulty: labContent.lab_info?.difficulty || 'beginner',
      lab_category: labContent.lab_info?.category || 'programming',
      lab_tags: labContent.lab_info?.tags || []
    };

    try {
      const response = await purchaseLabAccess(purchaseData);
      
      if (response.success) {
        setShowPurchaseDialog(false);
        toast({
          title: "Purchase Successful!",
          description: `You now have premium access to ${labContent.lab_info?.title || 'this'} lab`,
          className: "bg-green-900 border-green-700 text-white",
        });
        
        // Clear cache and refetch lab content to get the updated premium files
        clearCache();
        await fetchLabData(true);
        
        // Refresh wallet balance to update the header
        await refreshBalance();
      } else {
        toast({
          title: "Purchase Failed",
          description: response.error || response.message || "Unable to purchase lab access",
          variant: "destructive",
          className: "bg-red-900 border-red-700 text-white",
        });
      }
    } catch (error) {
      toast({
        title: "Purchase Error",
        description: "An unexpected error occurred while processing your purchase",
        variant: "destructive",
        className: "bg-red-900 border-red-700 text-white",
      });
    }
  };

  // Check if there are premium files and user doesn't have access
  const hasPremiumFiles = labContent?.content?.premium_files_count > 0;
  const hasAccess = labContent?.access?.has_premium_access || false;
  const labCost = labContent?.access?.premium_cost;
  const showPurchaseButton = hasPremiumFiles && !hasAccess;

  // Proper file tree renderer with folder support (from LabViewerPage)
  const renderFileTree = (files: LabFile[], level = 0) => {
    return (
      <div className={`${level > 0 ? 'ml-4' : ''}`}>
        {files.map((file, index) => {
          const isPremium = isPremiumPreviewFile(file);
          
          return (
            <div key={`${file.path}-${index}`} className="mb-1">
              <button
                onClick={() => handleFileSelect(file)}
                className={`flex items-center gap-2 p-2 rounded-lg w-full text-left transition-colors relative ${
                  selectedFile?.path === file.path && file.type === 'file'
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-slate-700 text-slate-300'
                }`}
              >
                {file.type === 'directory' ? (
                  expandedFolders.has(file.path) ? (
                    <FolderOpen className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  ) : (
                    <Folder className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  )
                ) : (
                  <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                )}
                <span className="text-sm flex-1 truncate">{file.name}</span>
                
                {isPremium && (
                  <span className="text-xs bg-blue-600 text-white px-1 rounded flex-shrink-0">PREVIEW</span>
                )}
                
                {file.type === 'file' && modifiedFiles.has(file.path) && (
                  <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0" title="Modified" />
                )}
              </button>
              
              {file.type === 'directory' && file.children && expandedFolders.has(file.path) && (
                <div className="ml-4">
                  {renderFileTree(file.children, level + 1)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Loading state
  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-slate-300">Loading {contentType}...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">{contentType === 'lab' ? 'Lab' : 'Article'} Not Found</h1>
            <p className="text-slate-300 mb-4">{error}</p>
            <div className="space-x-4">
              <Button onClick={() => navigate(-1)} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
              <Button 
                onClick={() => navigate(`/course/${courseId}/${contentType}/${contentId}`)}
                variant="outline"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Mode
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${contentResource?.title || contentType} - IDE | ORCATech`}</title>
        <meta name="description" content={contentResource?.description || `${contentType} IDE viewer`} />
      </Helmet>

      <div className="min-h-screen bg-slate-950">
        <Header />

        {/* Page Header */}
        <div className="border-b border-slate-800 bg-slate-900/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => navigate(`/course/${courseId}`)}
                  className="inline-flex items-center text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to {course?.title || 'Course'}
                </button>
                
                <div className="h-6 w-px bg-slate-700" />
                
                <div className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-blue-400" />
                  <span className="text-white font-medium">{contentResource?.title || contentType}</span>
                  <span className="px-2 py-1 bg-blue-900/30 border border-blue-500/30 text-blue-300 text-xs rounded-full">
                    IDE Mode
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {showPurchaseButton && (
                  <Button
                    onClick={handlePurchaseClick}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                    size="sm"
                  >
                    <Coins className="w-4 h-4 mr-2" />
                    Purchase for {labCost} Coins
                  </Button>
                )}
                <Button
                  onClick={handleReloadFresh}
                  variant="outline"
                  size="sm"
                  className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-red-500 hover:text-red-400"
                  title="Reload fresh content from backend (removes all changes)"
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Reload Content
                </Button>
                <Button
                  onClick={() => navigate(`/course/${courseId}/${contentType}/${contentId}`)}
                  variant="outline"
                  size="sm"
                  className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Mode
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main IDE Layout */}
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 h-[calc(100vh-220px)]">
            {/* File Explorer */}
            <div className="lg:col-span-1">
              <Card className="p-4 bg-slate-900/50 border-slate-800 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                  <h3 className="text-lg font-semibold text-white">Files</h3>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-slate-400">
                      {countFiles(combineLabFiles(labContent))} files
                    </div>
                    <Button
                      onClick={downloadAccessibleFiles}
                      variant="outline"
                      size="sm"
                      className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                      title="Download all accessible files as ZIP"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
                  {labContent && renderFileTree(combineLabFiles(labContent))}
                </div>
              </Card>
            </div>

            {/* Monaco Editor */}
            <div className="lg:col-span-3">
              <Card className="p-4 bg-slate-900/50 border-slate-800 h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {selectedFile && (
                      <>
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="text-white">{selectedFile.name}</span>
                        {modifiedFiles.has(selectedFile.path) && (
                          <span className="text-yellow-400 text-sm">• Modified</span>
                        )}
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {selectedFile && modifiedFiles.has(selectedFile.path) && (
                      <>
                        <Button
                          onClick={handleSaveFile}
                          disabled={isSaving}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                        <Button
                          onClick={handleRevertFile}
                          disabled={isSaving}
                          size="sm"
                          variant="outline"
                          className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Revert
                        </Button>
                      </>
                    )}
                    <div className="text-xs text-slate-400">
                      {modifiedFiles.size > 0 && `${modifiedFiles.size} file(s) modified`}
                    </div>
                  </div>
                </div>
                
                <div className="h-full flex flex-col" style={{ maxHeight: 'calc(100vh - 320px)' }}>
                  <MonacoEditor
                    file={selectedFile}
                    onContentChange={handleContentChange}
                    readOnly={false}
                  />
                </div>
              </Card>
            </div>

            {/* Code Runner Panel */}
            <div className="lg:col-span-2">
              <CodeRunner
                selectedFile={selectedFile}
                allFiles={combineLabFiles(labContent)}
                className="h-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Reload Fresh Confirmation Modal */}
      <AlertDialog open={showReloadModal} onOpenChange={setShowReloadModal}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <RefreshCcw className="w-5 h-5 text-red-400" />
              Reload Fresh Content
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              <strong className="text-red-400">Warning:</strong> This action will permanently remove all your changes and reload fresh content from the backend.
            </AlertDialogDescription>
            <div className="space-y-3 mt-4">
              <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                <p className="text-sm text-slate-400 mb-2">What will be lost:</p>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• All unsaved changes (pending edits)</li>
                  <li>• All saved changes (from Save button)</li>
                  <li>• Any modifications made during this session</li>
                </ul>
              </div>
              <p className="text-sm text-slate-300">
                You will get the latest version from the backend. This action cannot be undone.
              </p>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmReloadFresh}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Reload Content
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Purchase Confirmation Dialog */}
      {labContent && (
        <PurchaseConfirmationDialog
          isOpen={showPurchaseDialog}
          onClose={() => setShowPurchaseDialog(false)}
          onConfirm={handlePurchaseConfirm}
          labData={{
            title: labContent.lab_info?.title || 'Lab',
            difficulty: labContent.lab_info?.difficulty || 'beginner',
            cost: labCost,
            description: contentResource?.description || '',
            premiumFilesCount: labContent.content?.premium_files_count
          }}
          isPurchasing={isPurchasing}
          purchaseError={purchaseError}
          onGetMoreCoins={() => navigate('/coins')}
        />
      )}
    </>
  );
};

export default LabIDEPage;