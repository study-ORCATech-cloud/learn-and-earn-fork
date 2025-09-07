
import React from 'react';
import ResourceCard from './ResourceCard';
import CourseFilterBar from './CourseFilterBar';
import { useCourseFilters } from '../../hooks/useCourseFilters';
import { Course } from '../../types/learningPath';

interface ResourcesSectionProps {
  course: Course;
}

const ResourcesSection: React.FC<ResourcesSectionProps> = ({ course }) => {
  const {
    searchTerm,
    setSearchTerm,
    difficultyFilter,
    setDifficultyFilter,
    typeFilter,
    setTypeFilter,
    availableDifficulties,
    availableTypes,
    filterResources,
    activeFiltersCount,
    clearFilters
  } = useCourseFilters({
    resources: course.resources ? Object.values(course.resources) : []
  });

  // Filter resources
  const filteredResources = course.resources ? filterResources(Object.values(course.resources)) : [];

  const hasAnyResources = filteredResources.length > 0;

  return (
    <section className="py-12 px-4 bg-slate-900/30">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          Course Resources
        </h2>
        
        <CourseFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          difficultyFilter={difficultyFilter}
          onDifficultyChange={setDifficultyFilter}
          typeFilter={typeFilter}
          onTypeChange={setTypeFilter}
          onClearFilters={clearFilters}
          availableDifficulties={availableDifficulties}
          availableTypes={availableTypes}
          activeFiltersCount={activeFiltersCount}
        />

        {!hasAnyResources && (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">No resources match the current filters.</p>
          </div>
        )}

        {/* Direct Resources */}
        {filteredResources.length > 0 && (
          <div className="space-y-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} course={course} />
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default ResourcesSection;
