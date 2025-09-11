
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import Header from '../components/layout/Header';
import LearningPathCard from '../components/ui/LearningPathCard';
import { useBackendData } from '../context/BackendDataContext';

const LearningPathsPage = () => {
  const location = useLocation();
  const { data, isLoading, error } = useBackendData();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-300">Loading learning paths...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-red-400 mb-2">Failed to load learning paths</p>
            <p className="text-slate-400 text-sm">Using fallback data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Learning Paths - LabDojo Learning Platform</title>
        <meta name="description" content="Structured career development paths that combine multiple courses to help you master complete skill sets. Perfect for achieving specific career goals." />
        <link rel="canonical" href={`https://learn-and-earn.online${location.pathname}`} />
      </Helmet>

      <div className="min-h-screen bg-slate-950">
        <Header />
        
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Career Learning Paths
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Structured career development paths that combine multiple courses to help you master a complete skill set. 
              Perfect for achieving specific career goals and professional certifications.
            </p>
          </div>
        </section>

        {/* Learning Paths Grid */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {data.learningPaths.map((path) => (
                <LearningPathCard key={path.id} learningPath={path} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default LearningPathsPage;
