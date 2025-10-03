
import React, { useState } from 'react';
import { Clock, Play, ExternalLink, Lock, Coins, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '../../context/AuthContext';
import { LoginModal } from '../auth/LoginModal';
import { Resource, Course } from '../../types/learningPath';

interface ResourceCardProps {
  resource: Resource;
  course: Course;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource, course }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLabStart = () => {
    if (resource.type === 'lab' || resource.type === 'article') {
      // Check authentication for labs and articles
      if (!isAuthenticated) {
        setShowLoginModal(true);
        return;
      }
      
      // Navigate to the appropriate viewer
      const courseId = course.id;
      const resourceId = resource.id;
      
      if (resource.type === 'lab' || resource.type === 'article') {
        navigate(`/course/${courseId}/${resource.type}/${resourceId}`);
      }
    } else {
      // For other resource types (video, etc.), open external link
      window.open(resource.url, '_blank', 'noopener,noreferrer');
    }
  };
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'Intermediate': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'Advanced': return 'text-red-400 bg-red-400/10 border-red-400/30';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lab': return '🧪';
      case 'article': return '📚';
      case 'video': return '🎥';
      case 'project': return '🛠️';
      case 'quiz': return '❓';
      default: return '📄';
    }
  };

  return (
    <Card className="p-6 bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors h-full flex flex-col overflow-hidden">
      <div className="flex items-start gap-4 flex-1">
        <div className="text-2xl">{getTypeIcon(resource.type)}</div>
        <div className="flex-1 flex flex-col h-full">
          <div className="mb-3">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-2">
                {resource.title}
              </h3>
              <p className="text-slate-300 mb-3">
                {resource.description}
              </p>
            </div>
            
            {/* Badges - Mobile: below content, Desktop: side by side */}
            <div className="flex flex-wrap gap-2 sm:justify-start justify-start">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(resource.difficulty)}`}>
                {resource.difficulty}
              </span>
              {resource.completed && (
                <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/20 hover:text-green-400 cursor-default">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4 text-sm text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {resource.duration}
            </span>
            <span>{resource.type}</span>
            {/* {resource.type === 'lab' && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center gap-1 text-amber-400">
                      <Coins className="w-4 h-4" />
                      Premium Available
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This lab may contain premium content that requires Dojo Coins</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )} */}
          </div>

          {resource.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4 max-w-full overflow-hidden">
              {resource.tags.map((tag, tagIndex) => (
                <span key={tagIndex} className="px-2 py-1 bg-slate-800 text-slate-400 rounded text-xs whitespace-nowrap">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Spacer to push button to bottom */}
          <div className="flex-1"></div>

          {/* Button section - always at bottom */}
          <div className="mt-4">
            {(resource.type === 'lab' || resource.type === 'article') && !isAuthenticated ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-block">
                      <Button 
                        onClick={handleLabStart}
                        className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 cursor-pointer"
                      >
                        <Lock className="w-4 h-4 mr-1" />
                        <Play className="w-4 h-4" />
                        Start {resource.type}
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-slate-800 border-slate-700">
                    <p className="text-slate-200">Please sign in to access this content</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <Button 
                onClick={handleLabStart}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              >
                <Play className="w-4 h-4" />
                Start {resource.type}
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </Card>
  );
};

export default ResourceCard;
