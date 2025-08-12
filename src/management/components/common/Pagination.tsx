// Pagination component for management interface

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  showTotalItems?: boolean;
  showPageSizeOptions?: boolean;
  pageSizeOptions?: number[];
  onPageSizeChange?: (pageSize: number) => void;
  isLoading?: boolean;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 50,
  onPageChange,
  showTotalItems = true,
  showPageSizeOptions = false,
  pageSizeOptions = [25, 50, 100],
  onPageSizeChange,
  isLoading = false,
  className,
}) => {
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  // Calculate visible page numbers
  const getVisiblePages = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > delta + 2) {
        pages.push('...');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - delta);
      const end = Math.min(totalPages - 1, currentPage + delta);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - delta - 1) {
        pages.push('...');
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage && !isLoading) {
      onPageChange(page);
    }
  };

  if (totalPages <= 1) {
    return showTotalItems && totalItems !== undefined ? (
      <div className={cn('flex items-center justify-center text-sm text-slate-400', className)}>
        {totalItems} {totalItems === 1 ? 'item' : 'items'}
      </div>
    ) : null;
  }

  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      {/* Total items info */}
      {showTotalItems && totalItems !== undefined && (
        <div className="text-sm text-slate-400">
          Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)} to{' '}
          {Math.min(currentPage * pageSize, totalItems)} of {totalItems} items
        </div>
      )}

      {/* Pagination controls */}
      <div className="flex items-center gap-1">
        {/* First page */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handlePageChange(1)}
          disabled={!hasPrevious || isLoading}
          className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50"
          title="First page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>

        {/* Previous page */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!hasPrevious || isLoading}
          className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50"
          title="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {visiblePages.map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-2 py-1 text-slate-400">
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            const isCurrentPage = pageNum === currentPage;

            return (
              <Button
                key={pageNum}
                variant={isCurrentPage ? "default" : "ghost"}
                size="sm"
                onClick={() => handlePageChange(pageNum)}
                disabled={isLoading}
                className={cn(
                  'h-8 w-8 p-0',
                  isCurrentPage
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700',
                  'disabled:opacity-50'
                )}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        {/* Next page */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!hasNext || isLoading}
          className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50"
          title="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        {/* Last page */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handlePageChange(totalPages)}
          disabled={!hasNext || isLoading}
          className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50"
          title="Last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Page size selector */}
      {showPageSizeOptions && onPageSizeChange && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Show:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            disabled={isLoading}
            className="bg-slate-800 border border-slate-600 text-white text-sm rounded px-2 py-1 focus:border-blue-500 focus:outline-none disabled:opacity-50"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="text-sm text-slate-400">per page</span>
        </div>
      )}
    </div>
  );
};

export default Pagination;