import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, BookOpen, Trophy } from 'lucide-react';
import CoursesGrid from '../components/course/CoursesGrid';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Course } from '../types/learningPath';
import { useBackendData } from '../contexts/BackendDataContext';

const LearningPathDetailPage: React.FC = () => {
  const { pathId } = useParams<{ pathId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useBackendData();

  const learningPath = data?.learningPaths.find(path => path.id === pathId);
  const pathCourses = learningPath?.courses?.map(courseId => data?.courses[courseId]).filter(Boolean) || [];

  const handleCourseSelect = (course: Course) => {
    navigate(`/course/${course.id}`);
  };

  const handleBackClick = () => {
    navigate('/learning-paths');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !learningPath) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Learning Path Not Found</h2>
          <p className="text-muted-foreground">The requested learning path could not be found.</p>
        </div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'text-green-400';
      case 'intermediate':
        return 'text-yellow-400';
      case 'advanced':
        return 'text-red-400';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <button 
          onClick={handleBackClick}
          className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Learning Paths</span>
        </button>

        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="text-4xl">{learningPath.icon}</div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">{learningPath.title}</h1>
              <p className="text-xl text-muted-foreground">{learningPath.category}</p>
            </div>
          </div>

          <p className="text-lg text-muted-foreground mb-6">
            {learningPath.description}
          </p>

          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{learningPath.estimatedHours}h</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span>{pathCourses.length} courses</span>
            </div>
            <div className={`flex items-center space-x-2 ${getDifficultyColor(learningPath.difficulty)}`}>
              <Trophy className="h-4 w-4" />
              <span>{learningPath.difficulty}</span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">Courses in this Learning Path</h2>
          <CoursesGrid courses={pathCourses} onCourseSelect={handleCourseSelect} />
        </div>
      </div>
    </div>
  );
};

export default LearningPathDetailPage;
