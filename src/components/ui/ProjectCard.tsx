
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Target, CheckSquare, Star, Sparkles } from 'lucide-react';
import { Project } from '../../types/project';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
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
    <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all duration-300 group h-full overflow-hidden">
      <CardHeader className="pb-4 relative">
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-3 h-3 rounded-full ${getCategoryColor(project.category)}`} />
            <Badge variant="outline" className="text-xs border-slate-700 text-slate-300">
              {project.category}
            </Badge>
          </div>
          
          {/* Mobile badges */}
          <div className="flex gap-1 sm:hidden">
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
          
          {/* Desktop badges */}
          <div className="hidden sm:flex gap-1 absolute top-4 right-4">
            {project.isPopular && (
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            )}
            {project.isNew && (
              <Sparkles className="w-4 h-4 text-blue-500" />
            )}
          </div>
        </div>
        
        <CardTitle className="text-white group-hover:text-blue-400 transition-colors text-lg leading-tight">
          {project.title}
        </CardTitle>
        <CardDescription className="text-slate-300 text-sm leading-relaxed">
          {project.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Difficulty and Duration */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Badge className={getDifficultyColor(project.difficulty)} variant="outline">
            {project.difficulty}
          </Badge>
          <div className="flex items-center text-slate-400">
            <Clock className="w-4 h-4 mr-1" />
            {project.estimatedHours}h
          </div>
        </div>

        {/* Key Info */}
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <Target className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <span className="text-slate-300">
              {project.objectives.length} learning objectives
            </span>
          </div>
          <div className="flex items-start gap-2">
            <CheckSquare className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            <span className="text-slate-300">
              {project.deliverables.length} deliverables
            </span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 max-w-full overflow-hidden">
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

        {/* Action Button */}
        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          onClick={() => {
            // TODO: Navigate to project detail page
            console.log('Navigate to project:', project.id);
          }}
        >
          Start Project
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
