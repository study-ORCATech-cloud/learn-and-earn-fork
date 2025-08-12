// Responsive data view that switches between table and cards

import React, { useState, useEffect } from 'react';
import { Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import DataTable, { TableColumn, TableAction } from './DataTable';
import MobileCard from './MobileCard';

interface ResponsiveDataViewProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  loading?: boolean;
  error?: string;
  selectable?: boolean;
  selectedItems?: string[];
  onSelect?: (items: string[]) => void;
  onRowClick?: (item: T, index: number) => void;
  getItemKey: (item: T) => string;
  renderMobileCard?: (item: T, index: number) => React.ReactNode;
  className?: string;
  // Mobile card field mapping
  mobileFields?: (item: T) => Array<{
    key: string;
    label: string;
    value: React.ReactNode;
    secondary?: boolean;
    className?: string;
  }>;
  // Responsive breakpoint (default: 768px)
  breakpoint?: number;
  // Force view mode
  viewMode?: 'table' | 'cards' | 'auto';
}

const ResponsiveDataView = <T extends any>({
  data,
  columns,
  actions = [],
  loading = false,
  error,
  selectable = false,
  selectedItems = [],
  onSelect,
  onRowClick,
  getItemKey,
  renderMobileCard,
  className,
  mobileFields,
  breakpoint = 768,
  viewMode = 'auto',
}: ResponsiveDataViewProps<T>) => {
  const [isMobile, setIsMobile] = useState(false);
  const [manualViewMode, setManualViewMode] = useState<'table' | 'cards' | null>(null);

  useEffect(() => {
    if (viewMode === 'auto') {
      const checkScreenSize = () => {
        setIsMobile(window.innerWidth < breakpoint);
      };

      checkScreenSize();
      window.addEventListener('resize', checkScreenSize);
      return () => window.removeEventListener('resize', checkScreenSize);
    }
  }, [breakpoint, viewMode]);

  const shouldShowCards = () => {
    if (viewMode === 'cards') return true;
    if (viewMode === 'table') return false;
    if (manualViewMode === 'cards') return true;
    if (manualViewMode === 'table') return false;
    return isMobile;
  };

  const handleSelect = (itemKey: string, selected: boolean) => {
    if (!onSelect) return;
    
    const newSelection = selected
      ? [...selectedItems, itemKey]
      : selectedItems.filter(key => key !== itemKey);
    
    onSelect(newSelection);
  };

  const handleSelectAll = (selected: boolean) => {
    if (!onSelect) return;
    
    const newSelection = selected ? data.map(getItemKey) : [];
    onSelect(newSelection);
  };

  const showCards = shouldShowCards();

  return (
    <div className={cn('space-y-4', className)}>
      {/* View toggle - only show if auto mode and user can choose */}
      {viewMode === 'auto' && (
        <div className="flex justify-end">
          <div className="flex rounded-md border border-slate-600 bg-slate-800">
            <Button
              variant={!showCards || manualViewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setManualViewMode('table')}
              className="rounded-r-none border-0 bg-transparent hover:bg-slate-700"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={showCards || manualViewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setManualViewMode('cards')}
              className="rounded-l-none border-0 bg-transparent hover:bg-slate-700"
            >
              <Grid className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Content */}
      {showCards ? (
        // Card view
        <div className="space-y-3">
          {data.map((item, index) => {
            const itemKey = getItemKey(item);
            const isSelected = selectedItems.includes(itemKey);

            if (renderMobileCard) {
              return (
                <div key={itemKey}>
                  {renderMobileCard(item, index)}
                </div>
              );
            }

            if (mobileFields) {
              return (
                <MobileCard
                  key={itemKey}
                  data={item}
                  fields={mobileFields(item)}
                  actions={actions}
                  selectable={selectable}
                  selected={isSelected}
                  onSelect={(selected) => handleSelect(itemKey, selected)}
                  onClick={() => onRowClick?.(item, index)}
                />
              );
            }

            // Fallback: convert table columns to card fields
            const fields = columns
              .filter(col => col.key !== 'actions' && col.key !== 'selection')
              .map(col => ({
                key: col.key,
                label: col.label,
                value: col.render ? col.render(item, index) : (item as any)[col.key],
                secondary: false,
              }));

            return (
              <MobileCard
                key={itemKey}
                data={item}
                fields={fields}
                actions={actions}
                selectable={selectable}
                selected={isSelected}
                onSelect={(selected) => handleSelect(itemKey, selected)}
                onClick={() => onRowClick?.(item, index)}
              />
            );
          })}
        </div>
      ) : (
        // Table view
        <DataTable
          columns={columns}
          data={data}
          actions={actions}
          loading={loading}
          error={error}
          selectable={selectable}
          selectedItems={selectedItems}
          onSelect={onSelect}
          onSelectAll={handleSelectAll}
          onRowClick={onRowClick}
          responsive={true}
          stickyHeader={true}
        />
      )}
    </div>
  );
};

export default ResponsiveDataView;