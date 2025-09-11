
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProgress } from '../types/learningPath';

interface UserProgressContextType {
  progress: UserProgress;
  toggleFavorite: (resourceId: string) => void;
  markComplete: (resourceId: string) => void;
  updateProgress: (updates: Partial<UserProgress>) => void;
  getCompletionRate: (pathId: string) => number;
}

const UserProgressContext = createContext<UserProgressContextType | undefined>(undefined);

export const useUserProgress = () => {
  const context = useContext(UserProgressContext);
  if (!context) {
    throw new Error('useUserProgress must be used within UserProgressProvider');
  }
  return context;
};

export const UserProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<UserProgress>(() => {
    const stored = localStorage.getItem('labdojo-progress');
    return stored ? JSON.parse(stored) : {
      userId: 'guest',
      completedResources: [],
      favorites: [],
      lastAccessed: new Date(),
      totalHours: 0,
      achievements: [],
      preferences: {
        theme: 'dark',
        difficulty: 'Beginner',
        interests: [],
        notifications: true
      }
    };
  });

  useEffect(() => {
    localStorage.setItem('labdojo-progress', JSON.stringify(progress));
  }, [progress]);

  const toggleFavorite = (resourceId: string) => {
    setProgress(prev => ({
      ...prev,
      favorites: prev.favorites.includes(resourceId)
        ? prev.favorites.filter(id => id !== resourceId)
        : [...prev.favorites, resourceId]
    }));
  };

  const markComplete = (resourceId: string) => {
    setProgress(prev => ({
      ...prev,
      completedResources: prev.completedResources.includes(resourceId)
        ? prev.completedResources
        : [...prev.completedResources, resourceId],
      lastAccessed: new Date()
    }));
  };

  const updateProgress = (updates: Partial<UserProgress>) => {
    setProgress(prev => ({ ...prev, ...updates }));
  };

  const getCompletionRate = (pathId: string) => {
    // This would calculate completion rate for a specific learning path
    return 0;
  };

  return (
    <UserProgressContext.Provider value={{
      progress,
      toggleFavorite,
      markComplete,
      updateProgress,
      getCompletionRate
    }}>
      {children}
    </UserProgressContext.Provider>
  );
};
