import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { Filter, Search, Calendar, TrendingUp, BookOpen, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import Header from '../components/layout/Header';
import RoadmapCard from '../components/ui/RoadmapCard';
import { useBackendData } from '../context/BackendDataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const RoadmapPage = () => {
  const location = useLocation();
  const { data, isLoading, error } = useBackendData();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [coursesExpanded, setCoursesExpanded] = useState(false);
  const [projectsExpanded, setProjectsExpanded] = useState(false);
  const [featuresExpanded, setFeaturesExpanded] = useState(false);

  const filteredCourses = data.roadmapItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    return matchesCategory && matchesSearch && matchesPriority && matchesStatus && item.type === 'course';
  });

  const filteredProjects = data.roadmapItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    return matchesCategory && matchesSearch && matchesPriority && matchesStatus && item.type === 'project';
  });

  const filteredFeatures = data.roadmapItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    return matchesCategory && matchesSearch && matchesPriority && matchesStatus && item.type === 'feature';
  });

  const totalEstimatedTopics = data.roadmapItems.reduce((sum, item) => sum + (item.type === 'course' ? item.topicCount : 0), 0) || 0;

  // Generate roadmap categories from data
  const roadmapCategories = data.roadmapItems.reduce((acc: any[], item) => {
    const existing = acc.find(cat => cat.id === item.category);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ id: item.category, name: item.category, count: 1 });
    }
    return acc;
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-300">Loading roadmap...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Roadmap - LabDojo Learning Platform</title>
        <meta name="description" content="Discover what's coming next to the LabDojo Learning Platform. Vote on upcoming courses and features, and see our development roadmap." />
        <link rel="canonical" href={`https://labdojo.io${location.pathname}`} />
      </Helmet>

      <div className="min-h-screen bg-slate-950">
        <Header />
        
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Development Roadmap
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
              Discover what's coming next to the LabDojo Learning Platform. See our planned courses and projects,
              and help us prioritize what matters most to you.
            </p>

            {error && (
              <div className="mb-4 text-red-400 text-sm">
                Backend connection failed - showing fallback data
              </div>
            )}
            
            {/* Stats */}
            <div className="flex justify-center gap-8 text-center">
              <div className="bg-slate-800/50 rounded-lg p-4 min-w-[120px]">
                <div className="text-2xl font-bold text-blue-400">{data.roadmapItems.filter(item => item.type === 'course').length || 0}</div>
                <div className="text-sm text-slate-400">Planned Courses</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 min-w-[120px]">
                <div className="text-2xl font-bold text-green-400">{data.roadmapItems.filter(item => item.type === 'project').length || 0}</div>
                <div className="text-sm text-slate-400">Planned Projects</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 min-w-[120px]">
                <div className="text-2xl font-bold text-orange-400">{data.roadmapItems.filter(item => item.type === 'feature').length || 0}</div>
                <div className="text-sm text-slate-400">Planned Features</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 min-w-[120px]">
                <div className="text-2xl font-bold text-purple-400">{totalEstimatedTopics}</div>
                <div className="text-sm text-slate-400">Total Estimated Topics</div>
              </div>
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="py-8 px-4 border-b border-slate-800">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Filter roadmap items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder-slate-400"
                />
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px] bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all" className="text-white hover:bg-slate-700">All Categories</SelectItem>
                  {roadmapCategories.map((category: any) => (
                    <SelectItem key={category.id} value={category.id} className="text-white hover:bg-slate-700">
                      {category.name} ({category.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Priority Filter */}
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[140px] bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all" className="text-white hover:bg-slate-700">All Priorities</SelectItem>
                  <SelectItem value="High" className="text-white hover:bg-slate-700">High</SelectItem>
                  <SelectItem value="Medium" className="text-white hover:bg-slate-700">Medium</SelectItem>
                  <SelectItem value="Low" className="text-white hover:bg-slate-700">Low</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all" className="text-white hover:bg-slate-700">All Status</SelectItem>
                  <SelectItem value="Planned" className="text-white hover:bg-slate-700">Planned</SelectItem>
                  <SelectItem value="In Development" className="text-white hover:bg-slate-700">In Development</SelectItem>
                  <SelectItem value="Review" className="text-white hover:bg-slate-700">Review</SelectItem>
                  <SelectItem value="Testing" className="text-white hover:bg-slate-700">Testing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Roadmap Items */}
        <section className="py-16 px-4">
          <div className="container mx-auto space-y-8">
            
            {/* Courses Section */}
            <Collapsible open={coursesExpanded} onOpenChange={setCoursesExpanded}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center justify-between w-full p-6 bg-slate-900/50 border border-slate-800 rounded-lg hover:bg-slate-800/50 text-left"
                >
                  <div className="flex items-center gap-4">
                    <BookOpen className="w-6 h-6 text-blue-400" />
                    <div>
                      <h2 className="text-2xl font-bold text-white">Planned Courses</h2>
                      <p className="text-slate-400 text-sm">
                        {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} planned for development
                      </p>
                    </div>
                  </div>
                  {coursesExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-6">
                {filteredCourses.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-slate-400 text-lg">No courses found matching your filters.</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCourses.map((item) => (
                      <RoadmapCard key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>

            {/* Projects Section */}
            <Collapsible open={projectsExpanded} onOpenChange={setProjectsExpanded}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center justify-between w-full p-6 bg-slate-900/50 border border-slate-800 rounded-lg hover:bg-slate-800/50 text-left"
                >
                  <div className="flex items-center gap-4">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                    <div>
                      <h2 className="text-2xl font-bold text-white">Planned Projects</h2>
                      <p className="text-slate-400 text-sm">
                        {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} planned for development
                      </p>
                    </div>
                  </div>
                  {projectsExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-6">
                {filteredProjects.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-slate-400 text-lg">No projects found matching your filters.</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProjects.map((project) => (
                      <RoadmapCard key={project.id} item={project} />
                    ))}
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>

            {/* Features Section */}
            <Collapsible open={featuresExpanded} onOpenChange={setFeaturesExpanded}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center justify-between w-full p-6 bg-slate-900/50 border border-slate-800 rounded-lg hover:bg-slate-800/50 text-left"
                >
                  <div className="flex items-center gap-4">
                    <Zap className="w-6 h-6 text-orange-400" />
                    <div>
                      <h2 className="text-2xl font-bold text-white">Planned Features</h2>
                      <p className="text-slate-400 text-sm">
                        {filteredFeatures.length} feature{filteredFeatures.length !== 1 ? 's' : ''} planned for development
                      </p>
                    </div>
                  </div>
                  {featuresExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-6">
                {filteredFeatures.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-slate-400 text-lg">No features found matching your filters.</div>
                    <div className="text-slate-500 text-sm mt-2">
                      Check back soon - we're constantly adding new features to enhance your learning experience!
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredFeatures.map((feature) => (
                      <RoadmapCard key={feature.id} item={feature} />
                    ))}
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>

          </div>
        </section>
      </div>
    </>
  );
};

export default RoadmapPage;
