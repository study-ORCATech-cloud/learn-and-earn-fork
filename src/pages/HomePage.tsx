
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import NewsSection from '../components/home/NewsSection';
import { useBackendData } from '../context/BackendDataContext';
import { BookOpen, TrendingUp, Target, Users, Award, Code, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HomePage = () => {
  const { data, isLoading } = useBackendData();

  const stats = [
    { label: 'Learning Paths', value: data.learningPaths.length.toString(), icon: BookOpen },
    { label: 'Individual Courses', value: Object.keys(data.courses).length.toString(), icon: Target },
    { label: 'Practice Projects', value: data.projects.length.toString(), icon: Code },
    { label: 'Industry Focus', value: '100%', icon: TrendingUp },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-300">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: Code,
      title: 'Hands-on Labs',
      description: 'Practice with real-world scenarios and interactive coding exercises'
    },
    {
      icon: Users,
      title: 'Expert-Led Content',
      description: 'Learn from industry professionals with years of experience'
    },
    {
      icon: Award,
      title: 'Structured Learning',
      description: 'Follow carefully designed paths from beginner to professional level'
    },
    {
      icon: Zap,
      title: 'Fast-Track Career',
      description: 'Accelerate your professional growth with focused, practical skills'
    }
  ];

  return (
    <>
      <Helmet>
        <title>LabDojo Learning Platform - Master Tech Skills</title>
        <meta name="description" content="Transform your career with LabDojo's comprehensive learning paths in DevOps, Python, Java, and Cloud Computing across Beginner, Intermediate, and Professional levels." />
        <meta name="keywords" content="tech learning, devops, python, java, cloud computing, programming courses, professional development" />
      </Helmet>

      <div className="min-h-screen bg-slate-950">
        <Header />
        
        {/* Hero Section */}
        <section className="relative py-12 md:py-20 px-4 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 to-purple-900/40" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
          
          <div className="container mx-auto text-center relative z-10">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Master Tech Skills
                </span>
                <br />
                <span className="text-white">Shape Your Future</span>
              </h1>
              
              <p className="text-lg md:text-xl lg:text-2xl text-slate-300 mb-6 md:mb-8 leading-relaxed px-4">
                Choose from structured learning paths for career development, individual courses for specific skills,
                or hands-on projects to practice what you've learned with real-world solutions.
              </p>
              
              <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 md:gap-4 mb-8 md:mb-12 px-4">
                <div className="px-3 md:px-4 py-1 md:py-2 bg-blue-900/30 border border-blue-600/30 text-blue-300 text-xs md:text-sm font-medium inline-block rounded-md">
                  🚀 Hands-on Labs
                </div>
                <div className="px-3 md:px-4 py-1 md:py-2 bg-purple-900/30 border border-purple-600/30 text-purple-300 text-xs md:text-sm font-medium inline-block rounded-md">
                  📊 Structured Learning
                </div>
                <div className="px-3 md:px-4 py-1 md:py-2 bg-cyan-900/30 border border-cyan-600/30 text-cyan-300 text-xs md:text-sm font-medium inline-block rounded-md">
                  🎯 Industry-Focused
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-8 md:py-12 px-4 bg-gradient-to-b from-purple-900/40 to-purple-900/25 border-slate-800">
          <div className="container mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {stats.map((stat, index) => {
                // Determine the route based on the stat label
                let route = '';
                if (stat.label === 'Learning Paths') route = '/learning-paths';
                else if (stat.label === 'Individual Courses') route = '/courses';
                else if (stat.label === 'Practice Projects') route = '/projects';

                // If there's a route, make it clickable
                if (route) {
                  return (
                    <Link key={index} to={route} className="text-center group cursor-pointer">
                      <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg mb-3 md:mb-4 group-hover:from-blue-600 group-hover:to-cyan-600 transition-all duration-300 transform group-hover:scale-110">
                        <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </div>
                      <div className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2 group-hover:text-blue-300 transition-colors">{stat.value}</div>
                      <div className="text-slate-400 text-sm md:text-base group-hover:text-slate-300 transition-colors">{stat.label}</div>
                    </Link>
                  );
                } else {
                  // For non-clickable stats (like Industry Focus), keep the original structure
                  return (
                    <div key={index} className="text-center">
                      <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg mb-3 md:mb-4">
                        <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </div>
                      <div className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">{stat.value}</div>
                      <div className="text-slate-400 text-sm md:text-base">{stat.label}</div>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        </section>

        {/* News Section */}
        <NewsSection />

        {/* Features Section */}
        <section className="py-12 md:py-20 px-4 bg-gradient-to-b from-blue-900/25 to-slate-900/40">
          <div className="container mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 md:mb-6">
                Why Choose LabDojo?
              </h2>
              <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto px-4">
                We provide comprehensive, industry-focused learning experiences designed to accelerate your tech career.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center p-4 md:p-6 rounded-lg bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors">
                  <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg mb-3 md:mb-4">
                    <feature.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-white mb-2 md:mb-3">{feature.title}</h3>
                  <p className="text-slate-400 text-sm md:text-base">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Learning Approach Section */}
        <section className="py-12 md:py-20 px-4 bg-gradient-to-b from-slate-900/40 to-purple-900/25">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6 md:mb-8">
                Three Ways to Learn
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                <div className="p-6 md:p-8 rounded-lg bg-blue-900/20 border border-blue-500/30">
                  <div className="text-3xl md:text-4xl mb-3 md:mb-4">🎯</div>
                  <h3 className="text-xl md:text-2xl font-semibold text-white mb-3 md:mb-4">Learning Paths</h3>
                  <p className="text-slate-300 mb-4 md:mb-6 text-sm md:text-base">
                    Structured journeys from beginner to professional level. Follow our carefully designed curriculum to master entire technology stacks.
                  </p>
                  <ul className="text-slate-300 text-left space-y-1 md:space-y-2 mb-4 md:mb-6 text-sm md:text-base">
                    <li>• Progressive skill building</li>
                    <li>• Career-focused outcomes</li>
                    <li>• Comprehensive coverage</li>
                  </ul>
                </div>
                <div className="p-6 md:p-8 rounded-lg bg-purple-900/20 border border-purple-500/30">
                  <div className="text-3xl md:text-4xl mb-3 md:mb-4">📚</div>
                  <h3 className="text-xl md:text-2xl font-semibold text-white mb-3 md:mb-4">Individual Courses</h3>
                  <p className="text-slate-300 mb-4 md:mb-6 text-sm md:text-base">
                    Target specific skills and technologies. Perfect for professionals looking to fill knowledge gaps or learn new tools quickly.
                  </p>
                  <ul className="text-slate-300 text-left space-y-1 md:space-y-2 mb-4 md:mb-6 text-sm md:text-base">
                    <li>• Focused learning objectives</li>
                    <li>• Flexible scheduling</li>
                    <li>• Immediate application</li>
                  </ul>
                </div>
                <div className="p-6 md:p-8 rounded-lg bg-cyan-900/20 border border-cyan-500/30">
                  <div className="text-3xl md:text-4xl mb-3 md:mb-4">🛠️</div>
                  <h3 className="text-xl md:text-2xl font-semibold text-white mb-3 md:mb-4">Practice Projects</h3>
                  <p className="text-slate-300 mb-4 md:mb-6 text-sm md:text-base">
                    Apply your knowledge with real-world projects. Build practical solutions and create a portfolio to showcase your skills.
                  </p>
                  <ul className="text-slate-300 text-left space-y-1 md:space-y-2 mb-4 md:mb-6 text-sm md:text-base">
                    <li>• Real-world scenarios</li>
                    <li>• Portfolio building</li>
                    <li>• Practical experience</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-20 px-4 bg-gradient-to-b from-purple-900/25 to-blue-900/30">
          <div className="container mx-auto text-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 md:mb-6">
              Ready to Start Learning?
            </h2>
            <p className="text-lg md:text-xl text-slate-300 mb-6 md:mb-8 max-w-2xl mx-auto px-4">
              Choose a structured learning path for career development, dive into individual courses for specific skills,
              or practice with hands-on projects. Your journey to professional mastery starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
              <Link to="/learning-paths">
                <Button className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105">
                  Explore Learning Paths
                </Button>
              </Link>
              <Link to="/courses">
                <Button className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105">
                  Browse Individual Courses
                </Button>
              </Link>
              <Link to="/projects">
                <Button className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105">
                  Explore Practice Projects
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage;
