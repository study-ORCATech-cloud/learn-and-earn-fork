
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import Header from '../components/layout/Header';
import CourseCard from '../components/ui/CourseCard';
import { useBackendData } from '../context/BackendDataContext';
import { Input } from '@/components/ui/input';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const CoursesPage = () => {
  const location = useLocation();
  const { data, isLoading, error } = useBackendData();
  const [searchTerm, setSearchTerm] = useState('');
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    'software-development': false,
    'web-development': false,
    'cloud-computing': false,
    'devops-infrastructure': false,
    'expert-specializations': false
  });

  const filterCourses = (coursesToFilter: typeof data.courses) => {
    if (!searchTerm) return coursesToFilter;
    
    return coursesToFilter.filter(course =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Group courses by category
  const courseCategories = [
    {
      id: 'software-development',
      title: 'Software Development',
      description: 'Master programming languages and software development fundamentals',
      courses: Object.values(data.courses).filter(course => course.category === 'Programming' && course.level !== 'Expert'),
      icon: '💻'
    },
    {
      id: 'web-development',
      title: 'Web Development',
      description: 'Build modern web applications with React and frontend technologies',
      courses: Object.values(data.courses).filter(course => course.category === 'Web' && course.level !== 'Expert'),
      icon: '🌐'
    },
    {
      id: 'cloud-computing',
      title: 'Cloud Computing',
      description: 'Learn cloud platforms, services, and cloud-native architectures',
      courses: Object.values(data.courses).filter(course => course.category === 'Cloud' && course.level !== 'Expert'),
      icon: '☁️'
    },
    {
      id: 'devops-infrastructure',
      title: 'DevOps & Infrastructure',
      description: 'Master containerization, orchestration, CI/CD, and infrastructure automation',
      courses: Object.values(data.courses).filter(course => ['DevOps', 'Docker', 'Kubernetes', 'Git', 'SysAdmin', 'CI/CD', 'IaC'].includes(course.category) && course.level !== 'Expert'),
      icon: '🔧'
    },
    {
      id: 'expert-specializations',
      title: 'Expert Specializations',
      description: 'Advanced courses for specialized skills and deep expertise',
      courses: Object.values(data.courses).filter(course => course.level === 'Expert'),
      icon: '🎯'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-300">Loading courses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Courses - ORCATech Learning Platform</title>
        <meta name="description" content="Focus on specific technologies and skills with our comprehensive course catalog. From beginner fundamentals to expert-level specializations." />
        <link rel="canonical" href={`https://labdojo.io${location.pathname}`} />
      </Helmet>

      <div className="min-h-screen bg-slate-950">
        <Header />
        
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Courses
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
              Focus on specific technologies and skills with our comprehensive course catalog. 
              From beginner fundamentals to expert-level specializations.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Filter courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
              />
            </div>

            {error && (
              <div className="mt-4 text-red-400 text-sm">
                Backend connection failed - showing fallback data
              </div>
            )}
          </div>
        </section>

        {/* Course Categories */}
        <section className="py-12 px-4">
          <div className="container mx-auto space-y-12">
            {courseCategories.map((category) => {
              const filteredCourses = filterCourses(category.courses);
              
              // Hide empty categories when searching
              if (searchTerm && filteredCourses.length === 0) {
                return null;
              }

              return (
                <div key={category.id} className="bg-slate-900/30 rounded-lg p-8">
                  <Collapsible 
                    open={openSections[category.id]} 
                    onOpenChange={() => toggleSection(category.id)}
                  >
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between mb-6 group">
                        <div className="flex items-center gap-4">
                          <div className="text-3xl">{category.icon}</div>
                          <div className="text-left">
                            <h2 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
                              {category.title}
                            </h2>
                            <p className="text-slate-300 text-sm mt-1">
                              {category.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-sm">
                            {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
                          </span>
                          {openSections[category.id] ? (
                            <ChevronUp className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                          )}
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCourses.map((course) => (
                          <CourseCard key={course.id} course={course} />
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
};

export default CoursesPage;
