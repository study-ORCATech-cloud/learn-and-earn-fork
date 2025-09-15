
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Target, CheckSquare, Star, Sparkles, CheckCircle } from 'lucide-react';
import { Project } from '../../types/project';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const navigate = useNavigate();
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Python': return 'bg-blue-500';
      case 'Docker': return 'bg-cyan-500';
      case 'Kubernetes': return 'bg-purple-500';
      case 'CI/CD': return 'bg-orange-500';
      case 'IaC': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="p-6 bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors h-full flex flex-col overflow-hidden">
      <div className="space-y-4 flex-1">
        {/* Header with icon and title */}
        <div className="flex items-start gap-3 relative">
          <div className="flex-shrink-0 mt-1">
            <span className="text-2xl">{project.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white text-lg leading-tight max-w-full overflow-hidden group-hover:text-blue-400 transition-colors">
              <span className="block break-words">{project.title}</span>
            </h3>
            <p className="text-slate-300 text-sm mt-2 leading-relaxed">
              {project.description}
            </p>
          </div>
          
          {/* Desktop popular/new badges */}
          <div className="hidden sm:flex gap-1 absolute top-0 right-0">
            {project.isPopular && (
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            )}
            {project.isNew && (
              <Sparkles className="w-4 h-4 text-blue-500" />
            )}
          </div>
        </div>

        {/* Meta information */}
        <div className="space-y-3">
          {/* Mobile popular/new/completed badges */}
          <div className="flex gap-1 sm:hidden">
            {project.completed && (
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            )}
            {project.isPopular && (
              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 text-xs">
                <Star className="w-3 h-3 mr-1 fill-current" />
                Popular
              </Badge>
            )}
            {project.isNew && (
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                New
              </Badge>
            )}
          </div>
          
          {/* Completed badge */}
          {project.completed && (
            <div className="flex">
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            </div>
          )}

          {/* Category, Difficulty and Duration badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs border-slate-700 text-slate-300">
              <div className={`w-2 h-2 rounded-full ${getCategoryColor(project.category)} mr-1`} />
              {project.topic}
            </Badge>
            <Badge className={getDifficultyColor(project.difficulty)} variant="outline">
              {project.difficulty}
            </Badge>
          </div>
          
          {/* Duration and key metrics */}
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{project.estimatedHours}h</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              <span>{project.objectives.length} objectives</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckSquare className="w-4 h-4" />
              <span>{project.deliverables.length} deliverables</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {project.tags.slice(0, 3).map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="text-xs bg-slate-800 text-slate-300 hover:bg-slate-700 whitespace-nowrap"
              >
                {tag}
              </Badge>
            ))}
            {project.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs bg-slate-800 text-slate-400 whitespace-nowrap">
                +{project.tags.length - 3}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Action button */}
      <div className="mt-4 pt-4 border-t border-slate-700">
        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => {
            navigate(`/project/${project.id}`);
          }}
        >
          Start Project
        </Button>
      </div>
    </Card>
  );
};

export default ProjectCard;
