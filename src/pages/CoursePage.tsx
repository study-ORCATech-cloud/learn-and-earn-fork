
import React from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/layout/Header';
import CourseHero from '../components/course/CourseHero';
import CoursePrerequisites from '../components/course/CoursePrerequisites';
import ResourcesSection from '../components/course/ResourcesSection';
import { useBackendData } from '../context/BackendDataContext';

const CoursePage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const location = useLocation();
  const { data, isLoading } = useBackendData();
  
  const course = data.courses[courseId];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-300">Loading course...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Course Not Found</h1>
          <Link to="/courses" className="text-blue-400 hover:text-blue-300">
            ← Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{course.title} - ORCATech Learning Platform</title>
        <meta name="description" content={course.longDescription} />
        <meta name="keywords" content={course.tags.join(', ')} />
        <link rel="canonical" href={`https://learn-and-earn.online${location.pathname}`} />
      </Helmet>

      <div className="min-h-screen bg-slate-950">
        <Header />

        {/* Breadcrumb */}
        <div className="border-b border-slate-800">
          <div className="container mx-auto px-4 py-4">
            <Link 
              to="/courses" 
              className="inline-flex items-center text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Courses
            </Link>
          </div>
        </div>

        <CourseHero course={course} />
        <CoursePrerequisites prerequisites={course.prerequisites} />
        <ResourcesSection course={course} />
      </div>
    </>
  );
};

export default CoursePage;
