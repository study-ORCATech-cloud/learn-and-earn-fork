
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Home, Search } from 'lucide-react';
import Header from '../components/layout/Header';

const NotFoundPage = () => {
  const location = useLocation();

  return (
    <>
      <Helmet>
        <title>Page Not Found - ORCATech Learning Platform</title>
        <meta name="description" content="The page you're looking for doesn't exist. Explore our learning paths instead." />
        <link rel="canonical" href={`https://labdojo.io${location.pathname}`} />
      </Helmet>

      <div className="min-h-screen bg-slate-950">
        <Header />
        
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
          <div className="text-center max-w-md">
            <div className="text-8xl mb-8">🤖</div>
            
            <h1 className="text-6xl font-bold text-white mb-4">404</h1>
            
            <h2 className="text-2xl font-semibold text-slate-300 mb-6">
              Page Not Found
            </h2>
            
            <p className="text-slate-400 mb-8 leading-relaxed">
              Oops! The page you're looking for doesn't exist. 
              It might have been moved, deleted, or you entered the wrong URL.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300"
              >
                <Home className="w-5 h-5" />
                Back to Home
              </Link>
              
              <Link
                to="/learning-paths"
                className="inline-flex items-center gap-2 px-6 py-3 border border-slate-600 text-slate-300 font-semibold rounded-lg hover:border-slate-500 hover:text-white transition-all duration-300"
              >
                <Search className="w-5 h-5" />
                Explore Learning Paths
              </Link>
            </div>
            
            <div className="mt-12 p-6 bg-slate-900/50 rounded-lg border border-slate-800">
              <h3 className="text-lg font-semibold text-white mb-3">Popular Learning Paths</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                <Link to="/learning-path/devops-engineer" className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm hover:bg-blue-500/30 transition-colors">
                  DevOps
                </Link>
                <Link to="/learning-path/python-developer" className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm hover:bg-green-500/30 transition-colors">
                  Python
                </Link>
                <Link to="/learning-path/fullstack-developer" className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm hover:bg-purple-500/30 transition-colors">
                  Web Dev
                </Link>
                <Link to="/learning-path/cloud-architect" className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm hover:bg-red-500/30 transition-colors">
                  Cloud
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;
