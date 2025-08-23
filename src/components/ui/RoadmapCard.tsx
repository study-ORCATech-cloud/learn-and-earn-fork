import React from 'react';
import { Clock, Heart, Calendar, TrendingUp, BookOpen } from 'lucide-react';
import { RoadmapItem } from '../../types/learningPath';
import { Card } from '@/components/ui/card';

interface RoadmapCardProps {
  item: RoadmapItem;
  className?: string;
}

const RoadmapCard: React.FC<RoadmapCardProps> = ({ item, className = '' }) => {
  const {
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
    <Card className={`relative overflow-hidden bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all duration-300 hover:transform hover:scale-[1.02] h-full flex flex-col ${className}`}>
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
            <Heart className="w-4 h-4" />
            {votingCount}
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
          <button className="flex items-center gap-1 text-slate-400 hover:text-red-400 transition-colors">
            <Heart className="w-4 h-4" />
            <span className="text-xs">Vote</span>
          </button>
        </div>
      </div>
    </Card>
  );
};

export default RoadmapCard;
