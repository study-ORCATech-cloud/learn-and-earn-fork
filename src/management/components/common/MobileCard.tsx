// Mobile-friendly card view for data display

import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { TableAction } from './DataTable';

interface MobileCardField {
  key: string;
  label: string;
  value: React.ReactNode;
  secondary?: boolean;
  className?: string;
}

interface MobileCardProps<T = any> {
  data: T;
  fields: MobileCardField[];
  actions?: TableAction<T>[];
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  onClick?: () => void;
  className?: string;
}

const MobileCard = <T extends any>({
  data,
  fields,
  actions = [],
  selectable = false,
  selected = false,
  onSelect,
  onClick,
  className,
}: MobileCardProps<T>) => {
  const primaryFields = fields.filter(f => !f.secondary);
  const secondaryFields = fields.filter(f => f.secondary);

  const handleSelect = (checked: boolean) => {
    onSelect?.(checked);
  };

  const availableActions = actions.filter(action => 
    !action.show || action.show(data)
  );

  return (
    <Card 
      className={cn(
        'bg-slate-900/50 border-slate-700 cursor-pointer hover:bg-slate-800/50 transition-colors',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          {/* Selection checkbox */}
          {selectable && (
            <div className="flex-shrink-0 mt-1">
              <Checkbox
                checked={selected}
                onCheckedChange={handleSelect}
                onClick={(e) => e.stopPropagation()}
                className="border-slate-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
            </div>
          )}

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Primary fields */}
            <div className="space-y-2">
              {primaryFields.map((field) => (
                <div key={field.key} className="flex flex-col sm:flex-row sm:items-center">
                  <span className="text-sm font-medium text-slate-400 sm:w-24 sm:flex-shrink-0">
                    {field.label}:
                  </span>
                  <div className={cn('text-sm text-slate-200 sm:flex-1', field.className)}>
                    {field.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Secondary fields */}
            {secondaryFields.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-700 space-y-1">
                {secondaryFields.map((field) => (
                  <div key={field.key} className="flex flex-col sm:flex-row sm:items-center">
                    <span className="text-xs font-medium text-slate-500 sm:w-24 sm:flex-shrink-0">
                      {field.label}:
                    </span>
                    <div className={cn('text-xs text-slate-400 sm:flex-1', field.className)}>
                      {field.value}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          {availableActions.length > 0 && (
            <div className="flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
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
                          action.onClick(data, 0); // Index not relevant for single card
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
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileCard;