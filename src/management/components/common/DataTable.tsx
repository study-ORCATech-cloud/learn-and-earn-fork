// Generic data table component for management interface

import React, { useState } from 'react';
import { ChevronUp, ChevronDown, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import LoadingSpinner from './LoadingSpinner';

export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  className?: string;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

export interface TableAction<T = any> {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (row: T, index: number) => void;
  className?: string;
  disabled?: (row: T) => boolean;
  variant?: 'default' | 'destructive' | 'secondary';
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface DataTableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  isLoading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  className?: string;
  
  // Selection
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  getRowId?: (row: T) => string;
  
  // Sorting
  sortConfig?: SortConfig | null;
  onSort?: (key: string) => void;
  
  // Row styling
  getRowClassName?: (row: T, index: number) => string;
  onRowClick?: (row: T, index: number) => void;
  
  // Responsive
  responsive?: boolean;
  stickyHeader?: boolean;
}

const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  actions = [],
  isLoading = false,
  error = null,
  emptyMessage = 'No data available',
  className,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  getRowId = (row) => row.id,
  sortConfig,
  onSort,
  getRowClassName,
  onRowClick,
  responsive = true,
  stickyHeader = true,
}: DataTableProps<T>) => {
  const [expandedActions, setExpandedActions] = useState<string | null>(null);

  const isAllSelected = selectable && data.length > 0 && selectedIds.length === data.length;
  const isPartialSelection = selectable && selectedIds.length > 0 && selectedIds.length < data.length;

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    
    if (checked) {
      const allIds = data.map(getRowId);
      onSelectionChange(allIds);
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (rowId: string, checked: boolean) => {
    if (!onSelectionChange) return;
    
    if (checked) {
      onSelectionChange([...selectedIds, rowId]);
    } else {
      onSelectionChange(selectedIds.filter(id => id !== rowId));
    }
  };

  const handleSort = (columnKey: string) => {
    if (!onSort) return;
    onSort(columnKey);
  };

  const getSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return null;
    }
    
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4" />
      : <ChevronDown className="w-4 h-4" />;
  };

  const renderCell = (column: TableColumn<T>, row: T, index: number) => {
    const value = row[column.key];
    
    if (column.render) {
      return column.render(value, row, index);
    }
    
    return value?.toString() || '';
  };

  const renderActions = (row: T, index: number) => {
    if (actions.length === 0) return null;

    const rowId = getRowId(row);
    const availableActions = actions.filter(action => 
      !action.disabled || !action.disabled(row)
    );

    if (availableActions.length === 0) {
      return (
        <TableCell className="w-12">
          <div className="w-8 h-8" /> {/* Placeholder to maintain layout */}
        </TableCell>
      );
    }

    if (availableActions.length === 1) {
      const action = availableActions[0];
      return (
        <TableCell className="w-12">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              action.onClick(row, index);
            }}
            className={cn(
              'h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700',
              action.className
            )}
            title={action.label}
          >
            {action.icon}
          </Button>
        </TableCell>
      );
    }

    return (
      <TableCell className="w-12">
        <DropdownMenu
          open={expandedActions === rowId}
          onOpenChange={(open) => setExpandedActions(open ? rowId : null)}
        >
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="bg-slate-800 border-slate-600 min-w-[150px]"
          >
            {availableActions.map((action, actionIndex) => (
              <React.Fragment key={action.key}>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick(row, index);
                    setExpandedActions(null);
                  }}
                  className={cn(
                    'text-slate-200 focus:bg-slate-700 focus:text-white cursor-pointer',
                    action.variant === 'destructive' && 'text-red-400 focus:bg-red-600',
                    action.className
                  )}
                >
                  {action.icon && <span className="mr-2">{action.icon}</span>}
                  {action.label}
                </DropdownMenuItem>
                {actionIndex < availableActions.length - 1 && (
                  <DropdownMenuSeparator className="bg-slate-600" />
                )}
              </React.Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    );
  };

  if (error) {
    return (
      <Card className={cn('p-6 bg-slate-900/50 border-slate-700', className)}>
        <div className="text-center text-red-400">
          Error: {error}
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('bg-slate-900/50 border-slate-700', className)}>
      <div className={cn(
        'overflow-x-auto',
        responsive && 'max-w-full'
      )}>
        <Table>
          <TableHeader className={cn(stickyHeader && 'sticky top-0 bg-slate-900/90 backdrop-blur-sm z-10')}>
            <TableRow className="border-slate-700 hover:bg-slate-800/50">
              {/* Selection header */}
              {selectable && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    ref={(ref) => {
                      if (ref) {
                        ref.indeterminate = isPartialSelection;
                      }
                    }}
                    onCheckedChange={handleSelectAll}
                    className="border-slate-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                </TableHead>
              )}

              {/* Column headers */}
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  style={{ width: column.width }}
                  className={cn(
                    'text-slate-300 font-medium',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.sortable && 'cursor-pointer hover:text-white',
                    column.className
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.label}</span>
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </TableHead>
              ))}

              {/* Actions header */}
              {actions.length > 0 && (
                <TableHead className="w-12 text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
                  className="h-32"
                >
                  <div className="flex items-center justify-center">
                    <LoadingSpinner text="Loading..." />
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
                  className="h-32 text-center text-slate-400"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => {
                const rowId = getRowId(row);
                const isSelected = selectedIds.includes(rowId);
                
                return (
                  <TableRow
                    key={rowId}
                    className={cn(
                      'border-slate-700 hover:bg-slate-800/30 transition-colors',
                      onRowClick && 'cursor-pointer',
                      isSelected && 'bg-blue-900/20',
                      getRowClassName?.(row, index)
                    )}
                    onClick={() => onRowClick?.(row, index)}
                  >
                    {/* Selection cell */}
                    {selectable && (
                      <TableCell className="w-12">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => 
                            handleSelectRow(rowId, checked as boolean)
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="border-slate-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                      </TableCell>
                    )}

                    {/* Data cells */}
                    {columns.map((column) => (
                      <TableCell
                        key={column.key}
                        className={cn(
                          'text-slate-200',
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right',
                          column.className
                        )}
                      >
                        {renderCell(column, row, index)}
                      </TableCell>
                    ))}

                    {/* Actions cell */}
                    {renderActions(row, index)}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default DataTable;