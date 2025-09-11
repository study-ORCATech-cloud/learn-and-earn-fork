import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import Header from '../components/layout/Header';
import ProjectCard from '../components/ui/ProjectCard';
import { useBackendData } from '../context/BackendDataContext';
import { Input } from '@/components/ui/input';
import { Search, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const ProjectsPage = () => {
  const location = useLocation();
  const { data, isLoading } = useBackendData();
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [sectionStates, setSectionStates] = useState({
    Python: true,
    Docker: true,
    Kubernetes: true,
    'CI/CD': true,
    IaC: true
  });

  // Group projects by category
  const projectsByCategory = data.projects.reduce((acc: any, project: any) => {
    const category = project.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(project);
    return acc;
  }, {});

  const toggleSection = (category: string) => {
    setSectionStates(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const filterProjects = (projects: any[]) => {
    return projects.filter(project => {
      const matchesSearch = !searchTerm || 
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesDifficulty = difficultyFilter === 'all' || 
        project.difficulty.toLowerCase() === difficultyFilter.toLowerCase();
      
      return matchesSearch && matchesDifficulty;
    });
  };

  const categories = Object.keys(projectsByCategory);
  const totalProjects = data.projects.length;
  const filteredTotalProjects = categories.reduce((acc, category) => {
    return acc + filterProjects(projectsByCategory[category] || []).length;
  }, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-300">Loading projects...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Projects & Exercises - LabDojo Learning Platform</title>
        <meta name="description" content="Practice your skills with real-world projects and exercises. Build solutions across Python, Docker, Kubernetes, CI/CD, and Infrastructure as Code." />
        <link rel="canonical" href={`https://labdojo.io${location.pathname}`} />
      </Helmet>

      <div className="min-h-screen bg-slate-950">
        <Header />
        
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Projects & Exercises
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
              Apply your knowledge with hands-on projects and exercises. Build real-world solutions 
              and practice what you've learned with our comprehensive project catalog.
            </p>
            
            {/* Search and Filter Bar */}
            <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
                />
              </div>
              
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-full sm:w-48 bg-slate-800 border-slate-700 text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results Summary */}
            <div className="mt-4 text-sm text-slate-400">
              Showing {filteredTotalProjects} of {totalProjects} projects
              {searchTerm && ` matching "${searchTerm}"`}
              {difficultyFilter !== 'all' && ` at ${difficultyFilter} level`}
            </div>
          </div>
        </section>

        {/* Project Categories */}
        {categories.map((category, index) => {
          const projects = projectsByCategory[category];
          const filteredProjects = filterProjects(projects);
          
          if (filteredProjects.length === 0) return null;

          return (
            <section 
              key={category} 
              className={`py-16 px-4 ${index % 2 === 1 ? 'bg-slate-900/30' : ''}`}
            >
              <div className="container mx-auto">
                <Collapsible 
                  open={sectionStates[category]} 
                  onOpenChange={() => toggleSection(category)}
                >
                  <CollapsibleTrigger className="w-full">
                    <div className="text-center mb-12 group">
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <h2 className="text-3xl font-bold text-white">{category} Projects</h2>
                        <Badge variant="outline" className="border-slate-600 text-slate-300">
                          {filteredProjects.length}
                        </Badge>
                        {sectionStates[category] ? (
                          <ChevronUp className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
                        ) : (
                          <ChevronDown className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
                        )}
                      </div>
                      <p className="text-slate-300 max-w-2xl mx-auto">
                        {category === 'Python' && 'Build applications and automate tasks with Python programming'}
                        {category === 'Docker' && 'Master containerization and container orchestration'}
                        {category === 'Kubernetes' && 'Deploy and manage applications on Kubernetes clusters'}
                        {category === 'CI/CD' && 'Automate software delivery with continuous integration and deployment'}
                        {category === 'IaC' && 'Provision and manage infrastructure using code'}
                      </p>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                      {filteredProjects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </section>
          );
        })}

        {/* No Results Message */}
        {filteredTotalProjects === 0 && (
          <section className="py-16 px-4">
            <div className="container mx-auto text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-white mb-3">No Projects Found</h3>
              <p className="text-slate-300 max-w-md mx-auto">
                No projects match your current filters. Try adjusting your search terms or difficulty level.
              </p>
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default ProjectsPage;
