
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import { Heart, Coffee, Users, Target, DollarSign, BookOpen } from 'lucide-react';

const SupportPage = () => {
  const donationOptions = [
    {
      name: 'PayPal',
      description: 'One-time or recurring donations',
      icon: DollarSign,
      url: 'https://paypal.me/ORCATechCloud',
      bgColor: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700'
    },
    {
      name: 'Patreon',
      // description: 'One-time or recurring donations',
      description: 'Coming soon',
      icon: Users,
      // url: 'https://patreon.com/ORCATechCloud',
      url: '',
      bgColor: 'from-orange-500 to-red-500',
      hoverColor: 'hover:from-orange-600 hover:to-red-600'
    },
    {
      name: 'Ko-fi',
      description: 'Buy us a coffee to fuel development',
      icon: Coffee,
      url: 'https://ko-fi.com/orcatechcloud',
      bgColor: 'from-cyan-500 to-blue-500',
      hoverColor: 'hover:from-cyan-600 hover:to-blue-600'
    }
  ];

  const impactAreas = [
    {
      icon: BookOpen,
      title: 'Learning Resources',
      description: 'Create comprehensive guides, tutorials, and documentation for new technologies'
    },
    {
      icon: Target,
      title: 'New Lab Development',
      description: 'Create hands-on labs and practical exercises for emerging technologies'
    },
    {
      icon: Users,
      title: 'Community Features',
      description: 'Build interactive features like progress tracking and community forums'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Support ORCATech - Help Us Keep Learning Accessible</title>
        <meta name="description" content="Support ORCATech's mission to provide accessible, high-quality tech education. Your donations help us maintain the platform and create new learning resources." />
      </Helmet>

      <div className="min-h-screen bg-slate-950">
        <Header />

        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                Support Our Mission
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Help us keep ORCATech accessible for everyone. Your support enables us to 
              maintain the platform, create new content, and keep core learning resources available to all.
            </p>
          </div>
        </section>

        {/* Impact Section */}
        <section className="py-16 px-4 bg-slate-900/30">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold text-white mb-8 text-center">Your Impact</h2>
              <p className="text-lg text-slate-300 text-center mb-12">
                Every donation helps us continue providing accessible tech education while maintaining our free core content and labs.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {impactAreas.map((area, index) => (
                  <div key={index} className="text-center p-6 bg-slate-900/50 rounded-lg border border-slate-800">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <area.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{area.title}</h3>
                    <p className="text-slate-300">{area.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Donation Options */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold text-white mb-12 text-center">Choose Your Way to Support</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {donationOptions.map((option, index) => (
                  <a
                    key={index}
                    {...(option.url && option.url.trim() !== '' && {
                      href: option.url,
                      target: "_blank",
                      rel: "noopener noreferrer"
                    })}
                    className={`block p-6 bg-gradient-to-r ${option.bgColor} rounded-lg ${option.hoverColor} transition-all duration-300 transform hover:scale-105`}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <option.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">{option.name}</h3>
                      <p className="text-white/80">{option.description}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Alternative Support */}
        <section className="py-16 px-4 bg-slate-900/30">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold text-white mb-8">Other Ways to Support</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 bg-slate-900/50 rounded-lg border border-slate-800">
                  <h3 className="text-2xl font-semibold text-white mb-4">Spread the Word</h3>
                  <p className="text-slate-300 mb-4">
                    Share ORCATech with friends, colleagues, and on social media. Help us reach more learners!
                  </p>
                  <div className="flex justify-center gap-4">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Share on LinkedIn
                    </button>
                    <button className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors">
                      Share on Twitter
                    </button>
                  </div>
                </div>
                
                <div className="p-6 bg-slate-900/50 rounded-lg border border-slate-800">
                  <h3 className="text-2xl font-semibold text-white mb-4">Contribute Content</h3>
                  <p className="text-slate-300 mb-4">
                    Help us create better learning materials by contributing to our content repository.
                  </p>
                  <Link 
                    to="/contact"
                    className="inline-block px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Thank You Section */}
        <section className="py-16 px-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">Thank You!</h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Your support makes it possible for us to continue providing high-quality tech education 
              to learners around the world. Core labs remain free, while premium content helps sustain our platform.
            </p>
            <div className="flex justify-center">
              <Link to="/">
                <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300">
                  Start Learning
                </button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default SupportPage;
