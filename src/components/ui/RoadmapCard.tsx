import React, { useState } from 'react';
import { Heart, Calendar, BookOpen } from 'lucide-react';
import { RoadmapItem } from '../../types/learningPath';
import { Card } from '@/components/ui/card';
import { useVoting } from '../../context/VotingContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface RoadmapCardProps {
  item: RoadmapItem;
  className?: string;
}

const RoadmapCard: React.FC<RoadmapCardProps> = ({ item, className = '' }) => {
  const {
    id,
    title,
    description,
    icon,
    iconColor,
    difficulty,
    topicCount,
    type,
    plannedReleaseDate,
    priority,
    status,
    votingCount,
    gradient,
    developmentProgress
  } = item;

  const { isAuthenticated } = useAuth();
  const { isItemVoted, toggleVote } = useVoting();
  const { toast } = useToast();
  const [currentVoteCount, setCurrentVoteCount] = useState(votingCount);
  const [isVoting, setIsVoting] = useState(false);

  const isVoted = isItemVoted(id);
  

  const handleVoteClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent event bubbling to parent elements
    event.preventDefault();
    event.stopPropagation();
    

    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to vote for roadmap items.",
        variant: "destructive",
        className: "bg-red-900 border-red-700 text-white",
      });
      return;
    }

    if (isVoting) return; // Prevent double clicks

    try {
      setIsVoting(true);
      const newCount = await toggleVote(id, currentVoteCount);
      setCurrentVoteCount(newCount);
      
      toast({
        title: isVoted ? "Vote Removed" : "Vote Cast",
        description: isVoted ? "Your vote has been removed." : "Thank you for your vote!",
        className: "bg-green-900 border-green-700 text-white",
      });
    } catch (error) {
      toast({
        title: "Vote Failed",
        description: error instanceof Error ? error.message : "Failed to update vote. Please try again.",
        variant: "destructive",
        className: "bg-red-900 border-red-700 text-white",
      });
    } finally {
      setIsVoting(false);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'text-green-400 bg-green-400/10';
      case 'Intermediate': return 'text-yellow-400 bg-yellow-400/10';
      case 'Advanced': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-400 bg-red-400/10';
      case 'Medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'Low': return 'text-blue-400 bg-blue-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planned': return 'text-slate-400 bg-slate-400/10';
      case 'In Development': return 'text-blue-400 bg-blue-400/10';
      case 'Review': return 'text-orange-400 bg-orange-400/10';
      case 'Testing': return 'text-purple-400 bg-purple-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <Card className={`relative overflow-hidden bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all duration-300 h-full flex flex-col ${className}`}>
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 hover:opacity-10 transition-opacity duration-300`} />
      
      {/* Priority Badge */}
      {priority && (
      <div className="absolute top-4 right-4 z-10">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(priority)}`}>
          {priority}
        </span>
      </div>
      )}

      <div className="p-6 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4 pr-16">
          <div className={`text-4xl ${iconColor} flex-shrink-0`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-white mb-2">
              {title}
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 text-sm text-slate-400">
          {topicCount && (
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            {type === 'course' ? `${topicCount} Estimated topics` : `${topicCount} Estimated deliverables`}
          </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {plannedReleaseDate}
          </div>
          <div className="flex items-center gap-1">
            <Heart className={`w-4 h-4 ${isVoted ? 'text-red-400' : 'text-slate-400'}`} />
            {currentVoteCount}
          </div>
        </div>

        {/* Progress Bar (if in development) */}
        {status === 'In Development' && developmentProgress > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Development Progress</span>
              <span>{developmentProgress}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div 
                className={`h-2 rounded-full bg-gradient-to-r ${gradient} transition-all duration-300`}
                style={{ width: `${developmentProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Bottom section */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            {difficulty && (
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(difficulty)}`}>
                {difficulty}
              </span>
            )}
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
              {status}
            </span>
          </div>
          <button 
            onClick={handleVoteClick}
            disabled={isVoting}
            className={`flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer hover:scale-105 z-10 relative ${
              isVoted 
                ? 'text-red-400 hover:text-red-300' 
                : 'text-slate-400 hover:text-red-400'
            }`}
            title={isAuthenticated ? (isVoted ? 'Remove vote' : 'Vote for this item') : 'Login to vote'}
            type="button"
          >
            <Heart className={`w-4 h-4 transition-all ${isVoted ? 'fill-current scale-110' : 'hover:scale-110'}`} />
            <span className="text-xs font-medium">
              {isVoting ? '...' : isVoted ? 'Voted' : 'Vote'}
            </span>
          </button>
        </div>
      </div>
    </Card>
  );
};

export default RoadmapCard;
