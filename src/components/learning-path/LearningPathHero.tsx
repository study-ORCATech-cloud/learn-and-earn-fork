import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LearningPath } from '../../types/learningPath';

interface LearningPathHeroProps {
  learningPath: LearningPath;
}

const LearningPathHero: React.FC<LearningPathHeroProps> = ({ learningPath }) => {
  return (
    <>
      <Link 
        to="/learning-paths" 
        className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Learning Paths
      </Link>

      <div className="flex items-start gap-6 mb-8">
        <div className={`text-6xl ${learningPath.iconColor} flex-shrink-0`}>
          {learningPath.icon}
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white mb-4">
            {learningPath.title}
          </h1>
          <p className="text-xl text-slate-300 leading-relaxed mb-6">
            {learningPath.longDescription}
          </p>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {learningPath.tags.map((tag, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default LearningPathHero;