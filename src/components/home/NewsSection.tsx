import React from 'react';
import { Link } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, ExternalLink } from 'lucide-react';

interface NewsItem {
  title: string;
  description: string | React.ReactNode;
  date: string;
  link?: string;
  category: 'update' | 'new-course' | 'feature' | 'announcement';
}

const newsItems: NewsItem[] = [
  {
    title: 'Course Structure & Learning Paths Finalized',
    description: 'We\'ve completed the design of our comprehensive learning paths covering Beginner, Intermediate, and Professional levels across all major technology stacks.',
    date: '2025-06-05',
    category: 'feature'
  },
  {
    title: 'Join Our Early Community',
    description: (
      <>
        Connect with fellow learners and contribute to our growing community. Check out our{' '}
        <a 
          href="https://github.com/study-ORCATech-cloud" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 underline font-medium"
        >
          ORCATech Study
        </a>
        {' '}organization on GitHub for practice repositories and community discussions.
      </>
    ),
    date: '2025-06-20',
    category: 'update'
  },
  {
    title: 'Beta Testing Phase in Progress',
    description: 'We\'re currently in beta testing phase, fine-tuning our platform and course content based on early user feedback. Thank you to our beta testers for helping us create the best learning experience possible.',
    date: '2025-07-10',
    category: 'feature'
  },
  {
    title: 'Platform Going Live - August 2025',
    description: 'We\'re excited to announce that ORCATech Learning Platform will be going live in August 2025. Get ready for comprehensive hands-on learning experiences in DevOps, Cloud Computing, and Programming.',
    date: '2025-07-26',
    category: 'announcement'
  },
  {
    title: '🎉 ORCATech Learning Platform is Now Live!',
    description: 'We\'re thrilled to announce that the ORCATech Learning Platform is officially live! Start your Tech journey today with our comprehensive hands-on labs, interactive courses, and real-world projects. Welcome to the future of technical education!',
    date: '2025-08-21',
    category: 'announcement'
  },
  {
    title: '💻 New Feature: Built-in IDE for Labs',
    description: 'Experience seamless coding with our new integrated development environment! Edit code directly in your browser during lab exercises. Features include syntax highlighting, auto-completion, real-time error detection, and instant code execution. No more switching between multiple tools - everything you need is right here!',
    date: '2025-08-23',
    category: 'feature'
  },
  {
    title: '🗳️ Community Voting System Now Live!',
    description: 'Help shape the future of ORCATech! Our new community voting system lets you vote on upcoming features and roadmap items. Your voice matters - log in and vote for the features you want to see developed first. Real-time vote counts and user-friendly interface make participating easy and engaging!',
    date: '2025-08-24',
    category: 'feature'
  }
];

const getCategoryColor = (category: NewsItem['category']) => {
  switch (category) {
    case 'new-course':
      return 'bg-blue-900/30 border-blue-500/30 text-blue-300';
    case 'update':
      return 'bg-green-900/30 border-green-500/30 text-green-300';
    case 'feature':
      return 'bg-purple-900/30 border-purple-500/30 text-purple-300';
    case 'announcement':
      return 'bg-yellow-900/30 border-yellow-500/30 text-yellow-300';
    default:
      return 'bg-slate-900/30 border-slate-500/30 text-slate-300';
  }
};

const getCategoryLabel = (category: NewsItem['category']) => {
  switch (category) {
    case 'new-course':
      return 'New Course';
    case 'update':
      return 'Update';
    case 'feature':
      return 'Feature';
    case 'announcement':
      return 'Announcement';
    default:
      return 'News';
  }
};

const NewsSection = () => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <section className="py-12 md:py-16 px-4 bg-gradient-to-b from-purple-900/25 to-blue-900/25 border-slate-800">
      <div className="container mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 md:mb-6">
            Latest News & Updates
          </h2>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto px-4">
            Stay informed about new courses, platform updates, and exciting features to enhance your learning journey.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <ScrollArea className="h-80 md:h-96 rounded-lg border border-slate-700 bg-slate-900/50 p-4">
            <div className="space-y-4 pr-4">
              {newsItems.slice().reverse().map((item, index) => (
                <div
                  key={index}
                  className="p-4 md:p-6 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(item.date)}</span>
                    </div>
                    <div className={`px-2 py-1 rounded-md text-xs font-medium border ${getCategoryColor(item.category)}`}>
                      {getCategoryLabel(item.category)}
                    </div>
                  </div>
                  
                  <h3 className="text-lg md:text-xl font-semibold text-white mb-2 leading-tight">
                    {item.title}
                  </h3>
                  
                  <div className="text-slate-300 text-sm md:text-base mb-3 leading-relaxed">
                    {item.description}
                  </div>
                  
                  {item.link && (
                    <Link
                      to={item.link}
                      className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                    >
                      Learn more
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
