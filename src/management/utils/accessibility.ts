// Accessibility utilities for management system

export const focusManagement = {
  // Focus trap for modals and dialogs
  trapFocus: (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    element.addEventListener('keydown', handleTab);
    firstElement?.focus();

    return () => {
      element.removeEventListener('keydown', handleTab);
    };
  },

  // Announce to screen readers
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    document.body.appendChild(announcer);

    // Small delay to ensure screen reader picks it up
    setTimeout(() => {
      announcer.textContent = message;
    }, 100);

    // Clean up after announcement
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 2000);
  },

  // Generate unique IDs for ARIA relationships
  generateId: (prefix: string = 'mgmt') => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // Focus first error in form
  focusFirstError: (formElement: HTMLElement) => {
    const firstError = formElement.querySelector('[aria-invalid="true"]') as HTMLElement;
    if (firstError) {
      firstError.focus();
      // Announce the error
      const errorMessage = firstError.getAttribute('aria-describedby');
      if (errorMessage) {
        const errorElement = document.getElementById(errorMessage);
        if (errorElement) {
          focusManagement.announce(`Error: ${errorElement.textContent}`, 'assertive');
        }
      }
    }
  },

  // Keyboard navigation helpers
  handleArrowNavigation: (
    event: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    onIndexChange: (index: number) => void
  ) => {
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
        newIndex = Math.min(currentIndex + 1, items.length - 1);
        break;
      case 'ArrowUp':
        newIndex = Math.max(currentIndex - 1, 0);
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = items.length - 1;
        break;
      default:
        return false;
    }

    if (newIndex !== currentIndex) {
      event.preventDefault();
      onIndexChange(newIndex);
      items[newIndex]?.focus();
      return true;
    }

    return false;
  },
};

// ARIA label generators
export const ariaLabels = {
  // User table labels
  userRow: (userName: string, userRole: string) => 
    `User ${userName}, role ${userRole}`,
  
  userAction: (action: string, userName: string) => 
    `${action} user ${userName}`,

  // Pagination labels
  pageButton: (page: number, current: boolean) => 
    current ? `Current page, page ${page}` : `Go to page ${page}`,

  previousPage: () => 'Go to previous page',
  nextPage: () => 'Go to next page',

  // Sorting labels
  sortButton: (column: string, direction?: 'asc' | 'desc') => {
    if (!direction) return `Sort by ${column}`;
    return `Sort by ${column}, currently ${direction === 'asc' ? 'ascending' : 'descending'}`;
  },

  // Selection labels
  selectRow: (itemName: string) => `Select ${itemName}`,
  selectAll: (selected: boolean) => 
    selected ? 'Deselect all items' : 'Select all items',

  // Status indicators
  userStatus: (isActive: boolean) => 
    isActive ? 'User is active' : 'User is inactive',

  systemHealth: (status: string) => 
    `System health status: ${status}`,

  // Form labels
  required: (fieldName: string) => `${fieldName} (required)`,
  optional: (fieldName: string) => `${fieldName} (optional)`,

  // Modal labels
  dialog: (title: string) => `${title} dialog`,
  closeDialog: () => 'Close dialog',

  // Bulk actions
  bulkAction: (action: string, count: number) => 
    `${action} ${count} selected item${count === 1 ? '' : 's'}`,
};

// Screen reader only text helper
export const srOnly = 'sr-only absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0';

// Focus visible utilities
export const focusVisible = {
  ring: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
  button: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800',
  input: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500',
};