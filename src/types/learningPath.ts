export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'article' | 'lab' | 'quiz' | 'project';
  url: string;
  tags: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  estimatedMinutes: number;
  isCompleted?: boolean;
  prerequisites?: string[];
  isExternal?: boolean;
  lastUpdated?: Date;
  isInteractive?: boolean;
}

export interface ResourceGroup {
  title: string;
  description: string;
  resources: Resource[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  level: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional';
  duration: string;
  icon: string;
  iconColor: string;
  color: string;
  gradient: string;
  category: string;
  isPopular?: boolean;
  isNew?: boolean;
  isUnderMaintenance?: boolean;
  estimatedHours: number;
  topics: string[];
  prerequisites: string[];
  tags: string[];
  resources?: Resource[];
  resourceGroups?: ResourceGroup[];
  lastUpdated: Date;
}

export interface CourseGroup {
  title: string;
  description: string;
  courseIds: string[];
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  icon: string;
  iconColor: string;
  gradient: string;
  category: string;
  estimatedHours: number;
  courseIds: string[];
  courseGroups?: CourseGroup[];
  tags: string[];
  isPopular?: boolean;
  isNew?: boolean;
  lastUpdated: Date;
}

export interface SearchFilters {
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  category?: string;
  tags?: string[];
  duration?: string;
}

export interface SearchItem {
  id: string;
  title: string;
  description: string;
  type: 'course' | 'path' | 'resource';
  url: string;
  tags: string[];
  category: string;
  difficulty: string;
}

export interface UserProgress {
  userId: string;
  completedResources: string[];
  favorites: string[];
  lastAccessed: Date;
  totalHours: number;
  achievements: string[];
  preferences: {
    theme: 'light' | 'dark';
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    interests: string[];
    notifications: boolean;
  };
}

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  category: string;
  type: 'course' | 'project' | 'feature';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  topicCount: number;
  plannedReleaseDate: string; // Quarter format: "Q1 2024"
  priority: 'High' | 'Medium' | 'Low';
  status: 'Planned' | 'In Development' | 'Review' | 'Testing';
  votingCount: number;
  tags: string[];
  prerequisites: string[];
  icon: string;
  iconColor: string;
  gradient: string;
  lastUpdated: Date;
  developmentProgress: number; // 0-100
}
