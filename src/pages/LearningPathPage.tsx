import React, { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/layout/Header';
import CourseCard from '../components/ui/CourseCard';
import { useBackendData } from '../context/BackendDataContext';
import LearningPathHero from '../components/learning-path/LearningPathHero';
import LearningPathSidebar from '../components/learning-path/LearningPathSidebar';
import CourseGroupSection from '../components/learning-path/CourseGroupSection';
import LearningPathNotFound from '../components/learning-path/LearningPathNotFound';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const LearningPathPage = () => {
  const { pathId } = useParams<{ pathId: string }>();
  const location = useLocation();
  const { data, isLoading } = useBackendData();
  const [openSections, setOpenSections] = React.useState<{ [key: number]: boolean }>({});
  const [searchTerm, setSearchTerm] = useState('');

  const learningPath = data.learningPaths.find(path => path.id === pathId);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-300">Loading learning path...</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle case where learning path is not found
  if (!learningPath) {
    return <LearningPathNotFound />;
  }

  const pathCourses = learningPath.courseIds.map(courseId => data.courses[courseId]).filter(Boolean);

  // Simple filter function like courses page
  const filterCourses = (coursesToFilter: typeof data.courses) => {
    if (!searchTerm) return coursesToFilter;
    
    return coursesToFilter.filter(course =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const toggleSection = (index: number) => {
    setOpenSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <>
      <Helmet>
        <title>{learningPath.title} - LabDojo Learning Platform</title>
        <meta name="description" content={learningPath.longDescription} />
        <link rel="canonical" href={`https://labdojo.io${location.pathname}`} />
      </Helmet>

      <div className="min-h-screen bg-slate-950">
        <Header />

        {/* Hero Section with Grid */}
        <div className="py-12 px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <LearningPathHero learningPath={learningPath} />
              </div>

              {/* Sidebar */}
              <LearningPathSidebar 
                learningPath={learningPath} 
                totalCourses={pathCourses.length} 
              />
            </div>
          </div>
        </div>

        {/* Courses Section */}
        <section className="py-12 px-4 bg-slate-900/30">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8">Courses in this Path</h2>
            <p className="text-slate-300 mb-8">
              Complete these courses in order to master the {learningPath.title} path:
            </p>

            {/* Search Bar */}
            <div className="max-w-md mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Filter courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
                />
              </div>
            </div>
            
            {learningPath.courseGroups ? (
              // Render grouped courses with collapsible sections
              <CourseGroupSection 
                groups={learningPath.courseGroups}
                courses={data.courses}
                openSections={openSections}
                onToggleSection={toggleSection}
                filterCourses={filterCourses}
              />
            ) : (
              // Render flat courses (fallback for paths without groups)
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterCourses(pathCourses).map((course, index) => (
                  <div key={course.id} className="relative">
                    <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm z-10">
                      {index + 1}
                    </div>
                    <CourseCard course={course} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default LearningPathPage;
