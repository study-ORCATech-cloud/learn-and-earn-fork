
import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Star, TrendingUp } from 'lucide-react';
import { LearningPath } from '../../types/learningPath';
import { Card } from '@/components/ui/card';

interface LearningPathCardProps {
  learningPath: LearningPath;
  className?: string;
}

const LearningPathCard: React.FC<LearningPathCardProps> = ({ learningPath, className = '' }) => {
  const {
    id,
    title,
    description,
    icon,
    iconColor,
    gradient,
    isPopular,
    isNew
  } = learningPath;

  return (
    <Link to={`/learning-path/${id}`} className="block group h-full">
      <Card className={`relative overflow-hidden bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all duration-300 group-hover:transform group-hover:scale-[1.02] h-full flex flex-col ${className}`}>
        {/* Background Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
        
        {/* Badges - Desktop only */}
        <div className="hidden sm:flex absolute top-4 right-4 gap-2 z-10">
          {isPopular && (
            <span className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">
              <TrendingUp className="w-3 h-3" />
              Popular
            </span>
          )}
          {isNew && (
            <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
              <Star className="w-3 h-3" />
              New
            </span>
          )}
        </div>

        <div className="p-6 flex flex-col flex-1">
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className={`text-4xl ${iconColor} group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                {title}
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {description}
              </p>
            </div>
          </div>

          {/* Badges - Mobile only */}
          <div className="flex sm:hidden gap-2 mb-4">
            {isPopular && (
              <span className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                <TrendingUp className="w-3 h-3" />
                Popular
              </span>
            )}
            {isNew && (
              <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                <Star className="w-3 h-3" />
                New
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mb-4 text-sm text-slate-400">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {learningPath.estimatedHours} hours
            </div>
          </div>

          {/* Tags - pushed to bottom */}
          <div className="flex flex-wrap gap-2 mt-auto">
            {learningPath.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-slate-800 text-slate-400 rounded text-xs">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Hover Effect Border */}
        <div className={`absolute inset-0 border-2 border-transparent group-hover:border-gradient-to-r group-hover:${gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-lg pointer-events-none`} />
      </Card>
    </Link>
  );
};

export default LearningPathCard;
