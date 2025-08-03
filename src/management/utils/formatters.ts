// Data formatting utilities for management interface

import { UserRole, ROLE_COLORS, ROLE_ICONS, PROVIDER_ICONS } from './constants';

/**
 * Format a date string to a readable format
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Invalid date';
  }
};

/**
 * Format a date to relative time (e.g., "2 days ago")
 */
export const formatRelativeTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'week', seconds: 604800 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 },
    ];

    for (const interval of intervals) {
      const count = Math.floor(diffInSeconds / interval.seconds);
      if (count > 0) {
        return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
      }
    }

    return 'Just now';
  } catch {
    return 'Unknown';
  }
};

/**
 * Format a role with appropriate styling classes
 */
export const formatRole = (role: UserRole): { text: string; className: string; icon: string } => {
  return {
    text: role.charAt(0).toUpperCase() + role.slice(1),
    className: ROLE_COLORS[role]?.full || ROLE_COLORS.user.full,
    icon: ROLE_ICONS[role] || ROLE_ICONS.user,
  };
};

/**
 * Format provider name with icon
 */
export const formatProvider = (provider: 'google' | 'github'): { text: string; icon: string } => {
  return {
    text: provider.charAt(0).toUpperCase() + provider.slice(1),
    icon: PROVIDER_ICONS[provider] || '🔗',
  };
};

/**
 * Format file size (bytes to human readable)
 */
export const formatFileSize = (sizeString: string): string => {
  // Handle string format like "2.5MB"
  if (typeof sizeString === 'string' && sizeString.match(/^\d+(\.\d+)?[KMGT]?B$/i)) {
    return sizeString;
  }
  
  // Convert bytes to readable format
  const bytes = parseInt(sizeString);
  if (isNaN(bytes)) return sizeString;
  
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

/**
 * Format cache hit rate as percentage
 */
export const formatHitRate = (hitRate: number): string => {
  return `${hitRate.toFixed(1)}%`;
};

/**
 * Format number with commas
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

/**
 * Format email for display (truncate if too long)
 */
export const formatEmail = (email: string, maxLength: number = 30): string => {
  if (email.length <= maxLength) return email;
  
  const [username, domain] = email.split('@');
  const truncatedUsername = username.length > 15 
    ? username.substring(0, 12) + '...'
    : username;
  
  return `${truncatedUsername}@${domain}`;
};

/**
 * Format user name for display
 */
export const formatUserName = (name: string, maxLength: number = 25): string => {
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength - 3) + '...';
};

/**
 * Format audit action for display
 */
export const formatAuditAction = (action: string): string => {
  const actionMap: Record<string, string> = {
    CREATE: 'Created',
    UPDATE: 'Updated',
    DELETE: 'Deleted',
    ROLE_CHANGE: 'Role Changed',
    ACTIVATE: 'Activated',
    DEACTIVATE: 'Deactivated',
  };
  
  return actionMap[action] || action;
};

/**
 * Format bulk operation results
 */
export const formatBulkResults = (successful: number, failed: number): string => {
  const total = successful + failed;
  if (failed === 0) {
    return `All ${total} operations completed successfully`;
  }
  if (successful === 0) {
    return `All ${total} operations failed`;
  }
  return `${successful} successful, ${failed} failed out of ${total} operations`;
};

/**
 * Format system health status
 */
export const formatHealthStatus = (status: string): { text: string; className: string; icon: string } => {
  const statusMap = {
    healthy: {
      text: 'Healthy',
      className: 'text-green-400 bg-green-400/10 border-green-400/30',
      icon: '✅',
    },
    degraded: {
      text: 'Degraded',
      className: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
      icon: '⚠️',
    },
    unhealthy: {
      text: 'Unhealthy',
      className: 'text-red-400 bg-red-400/10 border-red-400/30',
      icon: '❌',
    },
  };
  
  return statusMap[status as keyof typeof statusMap] || statusMap.unhealthy;
};

/**
 * Format alert type
 */
export const formatAlertType = (type: string): { text: string; className: string; icon: string } => {
  const typeMap = {
    info: {
      text: 'Info',
      className: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
      icon: 'ℹ️',
    },
    warning: {
      text: 'Warning',
      className: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
      icon: '⚠️',
    },
    error: {
      text: 'Error',
      className: 'text-red-400 bg-red-400/10 border-red-400/30',
      icon: '❌',
    },
  };
  
  return typeMap[type as keyof typeof typeMap] || typeMap.info;
};

/**
 * Format duration (seconds to human readable)
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
};

/**
 * Format memory usage percentage
 */
export const formatMemoryUsage = (used: string, total: string): number => {
  const usedBytes = parseFloat(used.replace(/[^\d.]/g, ''));
  const totalBytes = parseFloat(total.replace(/[^\d.]/g, ''));
  
  if (totalBytes === 0) return 0;
  return Math.round((usedBytes / totalBytes) * 100);
};