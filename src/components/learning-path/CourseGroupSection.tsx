import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import CourseCard from '../ui/CourseCard';
import { Course } from '../../types/learningPath';

interface CourseGroup {
  title: string;
  description: string;
  courseIds: string[];
}

interface CourseGroupSectionProps {
  groups: CourseGroup[];
  courses: Course[];
  openSections: { [key: number]: boolean };
  onToggleSection: (index: number) => void;
  filterCourses: (courses: Course[]) => Course[];
}

const CourseGroupSection: React.FC<CourseGroupSectionProps> = ({
  groups,
  courses,
  openSections,
  onToggleSection,
  filterCourses
}) => {
  return (
    <div className="space-y-6">
      {groups.map((group, groupIndex) => {
        const groupCourses = group.courseIds.map(courseId => courses[courseId]).filter(Boolean);
        const filteredGroupCourses = filterCourses(groupCourses);
        const isOpen = openSections[groupIndex] || false;
        
        return (
          <div key={groupIndex} className="space-y-4">
            <Collapsible open={isOpen} onOpenChange={() => onToggleSection(groupIndex)}>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors text-left group">
                <div>
                  <h3 className="text-xl font-semibold text-white">{group.title}</h3>
                  <p className="text-slate-400 text-sm mt-1">{group.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-slate-400">
                    {filteredGroupCourses.length} of {groupCourses.length} courses
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                  )}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pt-4">
                {filteredGroupCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGroupCourses.map((course, courseIndex) => (
                      <div key={course.id} className="relative">
                        <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm z-10">
                          {courseIndex + 1}
                        </div>
                        <CourseCard course={course} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-400">No courses match the current filters.</p>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>
        );
      })}
    </div>
  );
};

export default CourseGroupSection;