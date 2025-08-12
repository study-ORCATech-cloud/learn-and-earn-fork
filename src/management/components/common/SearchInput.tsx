// Search input component with debouncing

import React, { useState, useCallback, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SEARCH_CONFIG } from '../../utils/constants';

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onSearch: (query: string) => void;
  onClear?: () => void;
  debounceMs?: number;
  minLength?: number;
  isLoading?: boolean;
  className?: string;
  showClearButton?: boolean;
  disabled?: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Search...',
  value: controlledValue,
  onSearch,
  onClear,
  debounceMs = SEARCH_CONFIG.DEBOUNCE_DELAY,
  minLength = SEARCH_CONFIG.MIN_LENGTH,
  isLoading = false,
  className,
  showClearButton = true,
  disabled = false,
}) => {
  const [internalValue, setInternalValue] = useState(controlledValue || '');
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Update internal value when controlled value changes
  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue);
    }
  }, [controlledValue]);

  const debouncedSearch = useCallback((query: string) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      if (query.length >= minLength || query.length === 0) {
        onSearch(query);
      }
    }, debounceMs);

    setDebounceTimer(timer);
  }, [debounceMs, minLength, onSearch, debounceTimer]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    debouncedSearch(newValue);
  };

  const handleClear = () => {
    setInternalValue('');
    onSearch('');
    if (onClear) {
      onClear();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      if (internalValue.length >= minLength || internalValue.length === 0) {
        onSearch(internalValue);
      }
    }
    
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  const hasValue = internalValue.length > 0;
  const showSpinner = isLoading && hasValue;

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className={cn(
          'absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4',
          disabled ? 'text-slate-500' : 'text-slate-400'
        )} />
        
        <Input
          type="text"
          placeholder={placeholder}
          value={internalValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={cn(
            'pl-10 pr-10 bg-slate-900 border-slate-700 text-white placeholder-slate-400',
            'focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />

        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {showSpinner && (
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          )}
          
          {showClearButton && hasValue && !disabled && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 w-6 p-0 hover:bg-slate-700"
              title="Clear search"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Search hint */}
      {hasValue && internalValue.length < minLength && (
        <div className="absolute top-full left-0 mt-1 text-xs text-slate-500">
          Type at least {minLength} characters to search
        </div>
      )}
    </div>
  );
};

export default SearchInput;