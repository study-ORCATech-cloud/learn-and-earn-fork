// Custom hook for lab navigation within a course

import { useMemo } from 'react';
import { useBackendData } from '../context/BackendDataContext';
import { Resource } from '../types/learningPath';

interface LabNavigationItem {
  id: string;
  title: string;
  type: 'lab' | 'article';
  url: string;
}

interface LabNavigation {
  previousLab: LabNavigationItem | null;
  nextLab: LabNavigationItem | null;
  currentIndex: number;
  totalLabs: number;
}

export const useLabNavigation = (
  courseId: string, 
  currentLabId?: string, 
  currentArticleId?: string
): LabNavigation => {
  const { data } = useBackendData();

  return useMemo(() => {
    // Find the course
    const course = data.courses[courseId];
    if (!course) {
      return {
        previousLab: null,
        nextLab: null,
        currentIndex: -1,
        totalLabs: 0
      };
    }

    // Collect all labs and articles from resources and resource groups
    const labResources: LabNavigationItem[] = [];

    // Add resources directly attached to the course
    if (course.resources) {
      Object.values(course.resources)
        .filter(resource => resource.type === 'lab' || resource.type === 'article')
        .forEach(resource => {
          labResources.push({
            id: resource.id,
            title: resource.title,
            type: resource.type as 'lab' | 'article',
            url: resource.url
          });
        });
    }

    // Find current lab/article index
    const currentId = currentLabId || currentArticleId;
    const currentIndex = labResources.findIndex(lab => lab.id === currentId);

    if (currentIndex === -1) {
      return {
        previousLab: null,
        nextLab: null,
        currentIndex: -1,
        totalLabs: labResources.length
      };
    }

    // Get previous and next labs
    const previousLab = currentIndex > 0 ? labResources[currentIndex - 1] : null;
    const nextLab = currentIndex < labResources.length - 1 ? labResources[currentIndex + 1] : null;

    return {
      previousLab,
      nextLab,
      currentIndex,
      totalLabs: labResources.length
    };
  }, [data.courses, courseId, currentLabId, currentArticleId]);
};