
import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface CourseFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  difficultyFilter: string;
  onDifficultyChange: (value: string) => void;
  typeFilter: string;
  onTypeChange: (value: string) => void;
  onClearFilters: () => void;
  availableDifficulties: string[];
  availableTypes: string[];
  activeFiltersCount: number;
}

const CourseFilterBar: React.FC<CourseFilterBarProps> = ({
  searchTerm,
  onSearchChange,
  difficultyFilter,
  onDifficultyChange,
  typeFilter,
  onTypeChange,
  onClearFilters,
  availableDifficulties,
  availableTypes,
  activeFiltersCount
}) => {
  return (
    <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-800 mb-8">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Bar */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Difficulty Filter */}
        <div className="min-w-[160px]">
          <Select value={difficultyFilter} onValueChange={onDifficultyChange}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all" className="text-white hover:bg-slate-700">All Difficulties</SelectItem>
              {availableDifficulties.map((difficulty) => (
                <SelectItem key={difficulty} value={difficulty} className="text-white hover:bg-slate-700">
                  {difficulty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Type Filter */}
        <div className="min-w-[140px]">
          <Select value={typeFilter} onValueChange={onTypeChange}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all" className="text-white hover:bg-slate-700">All Types</SelectItem>
              {availableTypes.map((type) => (
                <SelectItem key={type} value={type} className="text-white hover:bg-slate-700">
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters Button */}
        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <X className="w-4 h-4 mr-2" />
            Clear
            <Badge className="ml-2 bg-blue-600 text-white">
              {activeFiltersCount}
            </Badge>
          </Button>
        )}
      </div>
    </div>
  );
};

export default CourseFilterBar;
