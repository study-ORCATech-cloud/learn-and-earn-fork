// Reusable lab navigation buttons component

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, FileText, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLabNavigation } from '../../hooks/useLabNavigation';

interface LabNavigationButtonsProps {
  courseId: string;
  currentLabId?: string;
  currentArticleId?: string;
  currentMode?: 'view' | 'ide'; // To maintain the current mode when navigating
  className?: string;
}

const LabNavigationButtons: React.FC<LabNavigationButtonsProps> = ({
  courseId,
  currentLabId,
  currentArticleId,
  currentMode = 'view',
  className = ''
}) => {
  const navigate = useNavigate();
  const { previousLab, nextLab, currentIndex, totalLabs } = useLabNavigation(
    courseId,
    currentLabId,
    currentArticleId
  );

  const navigateToLab = (lab: { id: string; type: 'lab' | 'article' }, mode: 'view' | 'ide' = 'view') => {
    const basePath = `/course/${courseId}/${lab.type}/${lab.id}`;
    const fullPath = mode === 'ide' ? `${basePath}/ide` : basePath;
    navigate(fullPath);
  };

  if (totalLabs <= 1) {
    // Don't show navigation if there's only one or no labs
    return null;
  }

  return (
    <div className={`bg-slate-900/30 rounded-lg p-3 border border-slate-700/50 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        {/* Previous Lab Button */}
        {previousLab ? (
          <Button
            onClick={() => navigateToLab(previousLab, currentMode)}
            variant="ghost"
            size="sm"
            className="flex-1 min-w-0 bg-transparent hover:bg-slate-700/50 text-slate-300 hover:text-white group py-1 px-2 h-auto"
          >
            <ChevronLeft className="w-3 h-3 mr-1 group-hover:translate-x-[-1px] transition-transform flex-shrink-0" />
            <div className="flex items-center gap-1 min-w-0 flex-1">
              {previousLab.type === 'lab' ? (
                <Code className="w-3 h-3 text-blue-400 flex-shrink-0" />
              ) : (
                <FileText className="w-3 h-3 text-green-400 flex-shrink-0" />
              )}
              <div className="text-left min-w-0">
                <div className="text-xs font-medium truncate">{previousLab.title}</div>
              </div>
            </div>
          </Button>
        ) : (
          <div className="flex-1 text-center">
            <div className="text-xs text-slate-500">•••</div>
          </div>
        )}

        {/* Current Position Indicator - Compact */}
        <div className="text-center px-2 flex-shrink-0">
          <div className="text-xs font-medium text-slate-300">
            {currentIndex + 1}/{totalLabs}
          </div>
          <div className="w-12 bg-slate-700 h-0.5 rounded-full mt-0.5">
            <div
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-0.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / totalLabs) * 100}%` }}
            />
          </div>
        </div>

        {/* Next Lab Button */}
        {nextLab ? (
          <Button
            onClick={() => navigateToLab(nextLab, currentMode)}
            variant="ghost"
            size="sm"
            className="flex-1 min-w-0 bg-transparent hover:bg-slate-700/50 text-slate-300 hover:text-white group py-1 px-2 h-auto"
          >
            <div className="flex items-center gap-1 min-w-0 flex-1">
              <div className="text-right min-w-0 flex-1">
                <div className="text-xs font-medium truncate">{nextLab.title}</div>
              </div>
              {nextLab.type === 'lab' ? (
                <Code className="w-3 h-3 text-blue-400 flex-shrink-0" />
              ) : (
                <FileText className="w-3 h-3 text-green-400 flex-shrink-0" />
              )}
            </div>
            <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-[1px] transition-transform flex-shrink-0" />
          </Button>
        ) : (
          <div className="flex-1 text-center">
            <div className="text-xs text-slate-500">•••</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabNavigationButtons;