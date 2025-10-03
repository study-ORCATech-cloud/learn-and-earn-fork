import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, FileText, Folder, FolderOpen, Download, AlertCircle, Lock, Coins, Eye, Code, CheckCircle } from 'lucide-react';
import Header from '../components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiService } from '../services/apiService';
import { LabContent, LabFile } from '../types/lab';
import { PurchaseRequest } from '../types/dojoCoins';
import { useBackendData } from '../context/BackendDataContext';
import { useAuth } from '../context/AuthContext';
import { useDojoWallet } from '../context/DojoWalletContext';
import PurchaseConfirmationDialog from '../components/lab/PurchaseConfirmationDialog';
import LabUnderConstruction from '../components/lab/LabUnderConstruction';
import { useToast } from '@/hooks/use-toast';
import { errorLoggingService } from '../services/errorLoggingService';
import MarkdownRenderer from '../components/ui/markdown-renderer';
import LabNavigationButtons from '../components/lab/LabNavigationButtons';

// Helper function to determine file type and rendering method
const getFileType = (fileName: string): 'markdown' | 'code' | 'text' => {
  const extension = fileName.toLowerCase().split('.').pop();
  
  switch (extension) {
    case 'md':
    case 'markdown':
      return 'markdown';
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
    case 'py':
    case 'html':
    case 'css':
    case 'json':
    case 'xml':
    case 'yaml':
    case 'yml':
    case 'sql':
    case 'sh':
    case 'bash':
      return 'code';
    default:
      return 'text';
  }
};

// Combine regular lab files with premium preview files
const combineLabFiles = (labContent: LabContent | null): LabFile[] => {
  if (!labContent?.content) return [];
  
  const regularFiles = labContent.content.lab_files || [];
  const previewFiles = labContent.content.premium_preview || [];
  
  // Mark preview files with a special indicator and unique paths
  const markedPreviewFiles = previewFiles.map((file, index) => ({
    ...file,
    path: `preview-${index}-${file.path}`, // Make path unique to prevent selection conflicts
    is_premium: true,
    access_granted: false, // Preview files are not fully accessible
    access_message: 'Premium preview - purchase for full access'
  }));
  
  return [...regularFiles, ...markedPreviewFiles];
};

const LabViewerPage: React.FC = () => {
  const { courseId, labId, articleId, projectId } = useParams<{ courseId?: string; labId?: string; articleId?: string; projectId?: string }>();
  
  // Helper function to render file content based on type
  const renderFileContent = (file: LabFile, isPreview: boolean = false) => {
    const fileType = getFileType(file.name);
    const content = file.content || (isPreview ? 'Preview content not available' : 'File content not available');
    
    if (fileType === 'markdown') {
      return (
        <div className={`bg-slate-950 rounded-lg p-6 ${isPreview ? 'border border-blue-500/30' : ''}`}>
          <MarkdownRenderer content={content} />
        </div>
      );
    }
    
    // Default rendering for code and text files
    return (
      <div className={`bg-slate-950 rounded-lg p-4 overflow-x-auto ${isPreview ? 'border border-blue-500/30' : ''}`}>
        <pre className="text-sm text-slate-300 whitespace-pre-wrap">
          {content}
        </pre>
      </div>
    );
  };
  
  // Determine content type and ID
  const contentType = labId ? 'lab' : projectId ? 'project' : 'article';
  const contentId = labId || articleId || projectId;
  const { data, refetch } = useBackendData();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { 
    purchaseLabAccess, 
    isPurchasing, 
    purchaseError, 
    clearErrors,
    refreshBalance
  } = useDojoWallet();
  const { toast } = useToast();
  
  // Find the course and lab resource OR project
  const course = courseId ? data.courses[courseId] : undefined;
  const project = projectId ? data.projects?.find((p: any) => p.id === projectId) : undefined;
  
  const contentResource = course?.resources ? Object.values(course.resources).find(r => r.id === contentId && r.type === contentType) : undefined;
  
  const contentUrl = contentResource?.url || project?.url || '';
  const navigate = useNavigate();
  const [labContent, setLabContent] = useState<LabContent | null>(null);
  
  // Cache keys for this specific content
  const cacheKey = projectId ? `project-${projectId}` : `${courseId}-${contentType}-${contentId}`;
  const cachedContentKey = `lab-content-${cacheKey}`;
  const cacheTimestampKey = `lab-content-timestamp-${cacheKey}`;
  const [selectedFile, setSelectedFile] = useState<LabFile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUnderConstruction, setIsUnderConstruction] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Check if already completed in backend data
  const isAlreadyCompleted = contentResource?.completed || project?.completed
  
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

  // Check authentication and redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      if (courseId) {
        navigate(`/course/${courseId}`, { replace: true });
      } else if (projectId) {
        navigate(`/projects`, { replace: true });
      }
    }
  }, [isAuthenticated, authLoading, courseId, projectId, navigate]);

  // Fetch lab content and access info
  const fetchLabData = async (forceRefresh = false) => {
    if (!contentUrl || (!contentResource && !project)) {
      const typeName = contentType === 'lab' ? 'Lab' : contentType === 'project' ? 'Project' : 'Article';
      setError(`${typeName} not found or invalid ${contentType} configuration`);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setIsUnderConstruction(false);
      
      // Check for cached content first (unless force refresh)
      if (!forceRefresh) {
        const cachedContent = loadCachedContent();
        if (cachedContent) {
          setLabContent(cachedContent);
          
          // Auto-select the main instruction file if it exists
          const allFiles = combineLabFiles(cachedContent);
          if (allFiles.length > 0) {
            if (allFiles.length === 1) {
              setSelectedFile(allFiles[0]);
            } else {
              const mainFile = allFiles.find(f => 
                f.name.toLowerCase().includes('readme') || 
                f.name.toLowerCase().includes('instruction')
              );
              if (mainFile) {
                setSelectedFile(mainFile);
              }
            }
          }
          
          setIsLoading(false);
          return; // Exit early with cached content
        }
      }
      
      // Fetch from backend if no cache or force refresh
      const contentResponse = projectId ? 
        await apiService.getLabContent(contentUrl, { type: 'project' }) :
        await apiService.getLabContent(contentUrl);
      
      if (contentResponse.success && contentResponse.data) {
        setLabContent(contentResponse.data);
        
        // Cache the fetched content
        saveCachedContent(contentResponse.data);
        
        // Auto-select the main instruction file if it exists
        const allFiles = combineLabFiles(contentResponse.data);
        if (allFiles.length > 0) {
          if (allFiles.length === 1) {
            setSelectedFile(allFiles[0]);
          } else {
            const mainFile = allFiles.find(f => 
              f.name.toLowerCase().includes('readme') || 
              f.name.toLowerCase().includes('instruction')
            );
            if (mainFile) {
              setSelectedFile(mainFile);
            }
          }
        }
      } else {
        // Check if it's a 403 error (lab under construction)
        if (contentResponse.statusCode === 403 || contentResponse.error === 'LAB_UNDER_CONSTRUCTION') {
          setIsUnderConstruction(true);
          return;
        }
        
        const errorMsg = contentResponse.error || 'Failed to load lab content';
        setError(errorMsg);
        
        // Log API response error to backend
        const apiError = new Error(`Lab content API error: ${errorMsg}`);
        errorLoggingService.logError(apiError, undefined, {
          action: 'fetch_lab_content_api_error',
          metadata: {
            lab_url: contentUrl,
            course_id: courseId,
            lab_id: contentId,
            api_response: contentResponse,
            timestamp: new Date().toISOString()
          }
        }).catch(logErr => {
          console.warn('Failed to log API error to backend:', logErr);
        });
      }
    } catch (err) {
      console.error('Failed to load lab content:', err);
      
      // Log error to backend
      const errorToLog = err instanceof Error ? err : new Error(typeof err === 'string' ? err : 'Failed to load lab content');
      errorLoggingService.logError(errorToLog, undefined, {
        action: 'fetch_lab_content',
        metadata: {
          lab_url: contentUrl,
          course_id: courseId,
          lab_id: contentId,
          timestamp: new Date().toISOString()
        }
      }).catch(logErr => {
        console.warn('Failed to log error to backend:', logErr);
      });
      
      setError('Failed to load lab content. Please ensure the backend API is running.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchLabData();
    }
  }, [contentUrl, contentResource, project, authLoading, isAuthenticated]);

  // Early return for non-authenticated users (after all hooks)
  if (!authLoading && !isAuthenticated) {
    return null;
  }

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

  const handleFileSelect = (file: LabFile) => {
    if (file.type === 'file') {
      setSelectedFile(file);
      
      // Check if this is a preview file that requires purchase
      const isPreviewFile = file.is_premium && !file.access_granted && file.access_message?.includes('Premium preview');
      if (isPreviewFile) {
        // Show purchase modal for preview files
        handlePurchaseClick();
      }
    } else {
      toggleFolder(file.path);
    }
  };

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
          className: "bg-slate-800 border-slate-700 text-white",
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

  const handleCompleteClick = async () => {
    if (!contentUrl) return;

    try {
      setIsCompleting(true);

      const resourceTypeName = contentType === 'lab' ? 'Lab' : contentType === 'project' ? 'Project' : 'Article';
      const baseUrl = import.meta.env.VITE_BACKEND_BASE_PATH || 'http://localhost:5000';
      const url = projectId ? 
        `${baseUrl}/api/v1/labs/complete?type=project` : 
        `${baseUrl}/api/v1/labs/complete`;
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include', // Use cookie-based auth like other API calls
        headers: {
          'X-Lab-Url': contentUrl,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setIsCompleted(true);  
        toast({
          title: `${resourceTypeName} Completed!`,
          description: `You have successfully completed this ${contentType}`,
          className: "bg-green-900 border-green-700 text-white",
        });
        // Refresh backend data to reflect the completion
        refetch();
      } else {
        const errorData = await response.json();
        toast({
          title: "Completion Failed",
          description: errorData.message || `Unable to mark ${resourceTypeName} as completed`,
          variant: "destructive",
          className: "bg-red-900 border-red-700 text-white",
        });
      }
    } catch (error) {
      console.error('Error completing lab:', error);
      const resourceTypeName = contentType === 'lab' ? 'lab' : contentType === 'project' ? 'project' : 'article';
      toast({
        title: "Completion Error",
        description: `An unexpected error occurred while marking the ${resourceTypeName} as completed`,
        variant: "destructive",
        className: "bg-red-900 border-red-700 text-white",
      });
    } finally {
      setIsCompleting(false);
    }
  };

  // Check if file is premium based on API response
  const isPremiumFile = (file: LabFile) => {
    return file.is_premium;
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

  const renderFileTree = (files: LabFile[], level = 0) => {

    return (
      <div className={`${level > 0 ? 'ml-4' : ''}`}>
        {files.map((file, index) => {
          const isPremium = file.type === 'file' && isPremiumFile(file);
          const hasFileAccess = file.access_granted;
          
          return (
            <div key={`${file.path}-${index}`} className="mb-1">
              <button
                onClick={() => handleFileSelect(file)}
                className={`flex items-center gap-2 p-2 rounded-lg w-full text-left transition-colors relative ${
                  selectedFile?.path === file.path
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-slate-700 text-slate-300'
                }`}
              >
                {file.type === 'directory' ? (
                  expandedFolders.has(file.path) ? (
                    <FolderOpen className="w-4 h-4 text-blue-400" />
                  ) : (
                    <Folder className="w-4 h-4 text-blue-400" />
                  )
                ) : (
                  <FileText className="w-4 h-4 text-slate-400" />
                )}
                <span className="text-sm flex-1">{file.name}</span>
                
                {isPremium && !hasFileAccess && (
                  <>
                    {file.access_message?.includes('Premium preview') ? (
                      <span className="text-xs bg-blue-600 text-white px-1 rounded">PREVIEW</span>
                    ) : (
                      <Lock className="w-3 h-3 text-amber-400" />
                    )}
                  </>
                )}
                
                {file.type === 'file' && (
                  <span className="text-xs text-slate-500">
                    {(file.size / 1024).toFixed(1)}KB
                  </span>
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

  const getLanguageFromExtension = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'ts': 'typescript',
      'jsx': 'javascript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'sh': 'bash',
      'yaml': 'yaml',
      'yml': 'yaml',
      'json': 'json',
      'xml': 'xml',
      'html': 'html',
      'css': 'css',
      'md': 'markdown',
      'sql': 'sql',
      'dockerfile': 'dockerfile'
    };
    return languageMap[ext || ''] || 'text';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-900/30 border-green-500/30 text-green-300';
      case 'intermediate': return 'bg-blue-900/30 border-blue-500/30 text-blue-300';
      case 'professional': return 'bg-purple-900/30 border-purple-500/30 text-purple-300';
      case 'expert': return 'bg-red-900/30 border-red-500/30 text-red-300';
      default: return 'bg-gray-900/30 border-gray-500/30 text-gray-300';
    }
  };

  // Show loading while checking authentication or loading lab content
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-300">Loading lab content...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show lab under construction page for 403 errors
  if (isUnderConstruction) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header />
        <LabUnderConstruction
          courseName={course?.title}
          courseId={courseId}
          labName={contentResource?.title}
        />
      </div>
    );
  }

  if (error || !labContent) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">{contentType === 'lab' ? 'Lab' : 'Article'} Not Found</h1>
            <p className="text-slate-300 mb-4">{error || `The requested ${contentType} could not be loaded.`}</p>
            <Button onClick={() => navigate(-1)} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const hasPremiumFiles = labContent?.content?.premium_files_count > 0;
  const hasAccess = labContent?.access?.has_premium_access || false;
  const labCost = labContent?.access?.premium_cost;

  return (
    <>
      <Helmet>
        <title>{labContent?.lab_info?.title || 'Lab Viewer'}</title>
        <meta name="description" content={contentResource?.description || `${contentType} content viewer`} />
      </Helmet>

      <div className="min-h-screen bg-slate-950">
        <Header />
        
        {/* Header */}
        <div className="border-b border-slate-800">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => {
                  if (projectId) {
                    navigate('/projects');
                  } else {
                    navigate(`/course/${courseId}`);
                  }
                }}
                className="inline-flex items-center text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {projectId ? 'Back to Projects' : `Back to ${course?.title || 'Course'}`}
              </button>
              
              <div className="flex items-center gap-4">
                {/* File info and premium status */}
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {getAllFilesRecursively(combineLabFiles(labContent)).length} files
                  </div>
                  {hasPremiumFiles && (
                    hasAccess ? (
                      <div className="flex items-center gap-2 text-green-300">
                        <span>✓</span>
                        <span>Premium content unlocked</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Lock className="w-4 h-4 text-amber-400" />
                        <span>Premium content available</span>
                      </div>
                    )
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      if (projectId) {
                        navigate(`/project/${projectId}/ide`);
                      } else {
                        navigate(`/course/${courseId}/${contentType}/${contentId}/ide`);
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-blue-500 hover:text-blue-400"
                    title="Switch to IDE mode for editing"
                  >
                    <Code className="w-4 h-4 mr-2" />
                    Edit Mode
                  </Button>
                  
                  <Button
                    onClick={handleCompleteClick}
                    disabled={isCompleting || isCompleted || isAlreadyCompleted}
                    size="sm"
                    className={`${
                      isCompleted || isAlreadyCompleted
                        ? 'bg-green-600 border-green-500 text-white cursor-default' 
                        : 'bg-green-700 hover:bg-green-600 border-green-600 text-white hover:border-green-500'
                    }`}
                    title={isCompleted || isAlreadyCompleted ? `${contentType === 'lab' ? 'Lab' : contentType === 'project' ? 'Project' : 'Article'} completed` : `Mark ${contentType} as completed`}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {isCompleting ? 'Completing...' : (isCompleted || isAlreadyCompleted) ? 'Completed' : 'Complete'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lab Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Lab Info */}
          <div className="mb-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
              {projectId ? (
                <>
                  <span>Projects</span>
                  <span>›</span>
                  <span>{project?.title || 'Project'}</span>
                </>
              ) : (
                <>
                  <span>{course?.title}</span>
                  <span>›</span>
                  <span>{contentResource?.title || contentType}</span>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-3xl font-bold text-white">
                {labContent?.lab_info?.title || project?.title || 'Lab'}
              </h1>
              {(labContent?.lab_info?.difficulty || project?.difficulty) && (
                <Badge className={getDifficultyColor(labContent?.lab_info?.difficulty || project?.difficulty?.toLowerCase() || 'beginner')}>
                  {(labContent?.lab_info?.difficulty || project?.difficulty || 'beginner').charAt(0).toUpperCase() + (labContent?.lab_info?.difficulty || project?.difficulty || 'beginner').slice(1)}
                </Badge>
              )}
            </div>
            
            <p className="text-slate-300 text-lg mb-4">
              {contentResource?.description || (project as any)?.description || `${contentType} description not available`}
            </p>
            
            {/* Premium Access Section */}
            {hasPremiumFiles && !hasAccess && (
              <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-500/30 rounded-lg p-6 mb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="w-5 h-5 text-amber-400" />
                      <h3 className="text-lg font-semibold text-amber-300">Premium Content Available</h3>
                    </div>
                    <p className="text-amber-200 mb-3">
                      This lab contains premium files, unlock them to get the complete learning experience.
                    </p>
                    <div className="flex items-center gap-4 text-sm text-amber-300">
                      {(() => {
                        return labContent.content.premium_preview.map((file, index) => (
                          <span key={index}>✓ {file.name}</span>
                        ));
                      })()}
                    </div>
                  </div>
                  <div className="ml-6 text-center">
                    <div className="flex items-center gap-1 text-amber-400 text-xl font-bold mb-2">
                      <Coins className="w-6 h-6" />
                      <span>{labCost}</span>
                    </div>
                    <Button
                      onClick={handlePurchaseClick}
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      <Coins className="w-4 h-4 mr-2" />
                      Purchase for {labCost} Coins
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Success message for premium access */}
            {hasPremiumFiles && hasAccess && (
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-green-300">
                  <span>✓</span>
                  <span>You have premium access to all content in this lab!</span>
                </div>
              </div>
            )}
            
          </div>

          {/* Lab Navigation */}
          {courseId && (
            <div className="mb-4">
              <LabNavigationButtons
                courseId={courseId}
                currentLabId={labId}
                currentArticleId={articleId}
                currentMode="view"
              />
            </div>
          )}

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* File Tree */}
            <div className="lg:col-span-1">
              <Card className="p-4 bg-slate-900/50 border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Lab Files</h3>  
                <Button onClick={downloadAccessibleFiles}
                  variant="outline"
                  size="sm"
                  className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {(() => {
                    const allFiles = combineLabFiles(labContent);
                    return allFiles.length > 0 ? 
                      renderFileTree(allFiles) : 
                      <p className="text-slate-400 text-sm">No files available</p>;
                  })()}
                </div>
              </Card>
            </div>

            {/* File Content */}
            <div className="lg:col-span-3">
              <Card className="p-6 bg-slate-900/50 border-slate-800">
                {selectedFile ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-white">{selectedFile.name}</h3>
                        {isPremiumFile(selectedFile) && !selectedFile.access_granted && (
                          <Badge className="bg-amber-900/30 border-amber-500/30 text-amber-300">
                            <Lock className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <span>{getLanguageFromExtension(selectedFile.name)}</span>
                        <span>•</span>
                        <span>{(selectedFile.size / 1024).toFixed(1)}KB</span>
                      </div>
                    </div>
                    
                    {isPremiumFile(selectedFile) && !selectedFile.access_granted ? (
                      <div className="bg-slate-950 rounded-lg p-6">
                        {selectedFile.access_message?.includes('Premium preview') ? (
                          // This is a preview file - show content with preview indicator
                          <div>
                            <div className="flex items-center gap-2 mb-4 justify-center">
                              <Eye className="w-5 h-5 text-blue-400" />
                              <h3 className="text-lg font-semibold text-blue-400">Premium Preview</h3>
                            </div>
                            <p className="text-slate-300 mb-4 text-center">
                              This is a preview of premium content. Purchase access to unlock the complete version.
                            </p>
                            {renderFileContent(selectedFile, true)}
                          </div>
                        ) : (
                          // This is a locked premium file - show lock icon
                          <div className="text-center">
                            <Lock className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-white mb-2">Premium Content</h3>
                            <p className="text-slate-300 mb-4">
                              This file contains premium content. Purchase access to view the complete file.
                            </p>
                          </div>
                        )}
                        <Button
                          onClick={handlePurchaseClick}
                          className="bg-amber-600 hover:bg-amber-700 text-white"
                        >
                          <Coins className="w-4 h-4 mr-2" />
                          Purchase for {labCost} Coins
                        </Button>
                      </div>
                    ) : (
                      <div>
                        {renderFileContent(selectedFile)}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Select a file to view</h3>
                    <p className="text-slate-400">Choose a file from the file tree to view its contents</p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Confirmation Dialog */}
      {labContent && (
        <PurchaseConfirmationDialog
          isOpen={showPurchaseDialog}
          onClose={() => setShowPurchaseDialog(false)}
          onConfirm={handlePurchaseConfirm}
          labData={{
            title: labContent.lab_info?.title || (project as any)?.title || 'Lab',
            difficulty: labContent.lab_info?.difficulty || (project as any)?.difficulty?.toLowerCase() || 'beginner',
            cost: labCost,
            description: contentResource?.description || (project as any)?.description || '',
            premiumFilesCount: labContent.content?.premium_files_count
          }}
          isPurchasing={isPurchasing}
          purchaseError={purchaseError}
          onGetMoreCoins={() => navigate('/packages')}
        />
      )}
    </>
  );
};

export default LabViewerPage;