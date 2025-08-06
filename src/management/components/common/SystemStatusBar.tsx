// Reusable system status bar component

import React from 'react';
import { 
  Activity,
  Database, 
  Users,
  Shield,
  Settings,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '../../utils/formatters';

interface SystemStatusBarProps {
  // System health data
  health?: {
    status?: string;
    timestamp?: string;
    environment?: string;
    version?: string;
  } | null;
  
  // Cache statistics
  cacheStats?: {
    lab_cache?: {
      total_entries: number;
      total_available_entries: number;
    };
  } | null;
  
  // User statistics (optional)
  userStats?: {
    total: number;
    active: number;
    inactive: number;
    roles: Record<string, number>;
  } | null;
  
  // Loading states
  isLoading?: boolean;
  
  // Component configuration
  showUserStats?: boolean;
  showRoleDistribution?: boolean;
  showEnvironment?: boolean;
  showVersion?: boolean;
  className?: string;
}

const SystemStatusBar: React.FC<SystemStatusBarProps> = ({
  health,
  cacheStats,
  userStats,
  isLoading = false,
  showUserStats = false,
  showRoleDistribution = false,
  showEnvironment = false,
  showVersion = false,
  className,
}) => {
  const getHealthStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'error':
      case 'unhealthy':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  const getHealthStatusIcon = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'error':
      case 'unhealthy':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      default:
        return <Activity className="w-5 h-5 text-slate-400" />;
    }
  };

  const calculateCacheHitRate = () => {
    const labCache = cacheStats?.lab_cache;
    if (!labCache) return '0%';
    
    // Handle division by zero case
    if (labCache.total_entries === 0) {
      return labCache.total_available_entries > 0 ? 'Ready' : '0%';
    }
    
    const hitRate = (labCache.total_entries / labCache.total_available_entries) * 100;
    return `${hitRate.toFixed(1)}%`;
  };

  const cards = [
    // System Health (always shown)
    {
      key: 'health',
      title: 'System Health',
      value: isLoading 
        ? 'Loading...' 
        : (health?.status?.charAt(0).toUpperCase() + health?.status?.slice(1) || 'Unknown'),
      subtitle: health?.timestamp ? `Updated ${formatRelativeTime(health.timestamp)}` : undefined,
      icon: isLoading ? (
        <div className="w-5 h-5 bg-slate-600 rounded animate-pulse" />
      ) : (
        getHealthStatusIcon(health?.status)
      ),
      bgIcon: <Activity className="w-8 h-8 text-slate-600" />,
      valueColor: getHealthStatusColor(health?.status),
      customContent: null,
      show: true,
    },
    
    // Cache Hit Rate (always shown)
    {
      key: 'cache',
      title: 'Cache Hit Rate',
      value: isLoading ? '...' : calculateCacheHitRate(),
      subtitle: cacheStats?.lab_cache 
        ? `${cacheStats.lab_cache.total_available_entries.toLocaleString()} available / ${cacheStats.lab_cache.total_entries.toLocaleString()} total`
        : 'Cache performance',
      icon: null,
      bgIcon: <Database className="w-8 h-8 text-slate-600" />,
      valueColor: 'text-white',
      valueSize: 'text-2xl',
      customContent: null,
      show: true,
    },
    
    // Total Users (conditional)
    {
      key: 'users',
      title: 'Total Users',
      value: isLoading ? '...' : (userStats?.total.toLocaleString() || '0'),
      subtitle: userStats 
        ? `${userStats.active} active, ${userStats.inactive} inactive` 
        : undefined,
      icon: null,
      bgIcon: <Users className="w-8 h-8 text-slate-600" />,
      valueColor: 'text-white',
      valueSize: 'text-2xl',
      customContent: null,
      show: showUserStats && userStats,
    },
    
    // Environment (conditional)
    {
      key: 'environment',
      title: 'Environment',
      value: isLoading ? '...' : (health?.environment?.toUpperCase() || 'Unknown'),
      subtitle: 'Deployment environment',
      icon: null,
      bgIcon: (
        <div className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center',
          health?.environment === 'production' 
            ? 'bg-red-600/20' 
            : 'bg-blue-600/20'
        )}>
          <Settings className={cn(
            'w-5 h-5',
            health?.environment === 'production' 
              ? 'text-red-400' 
              : 'text-blue-400'
          )} />
        </div>
      ),
      valueColor: 'text-white',
      valueSize: 'text-lg',
      customContent: null,
      show: showEnvironment,
    },
    
    // Version (conditional)
    {
      key: 'version',
      title: 'Version',
      value: isLoading ? '...' : (health?.version || 'Unknown'),
      subtitle: 'Service version',
      icon: null,
      bgIcon: <Activity className="w-8 h-8 text-slate-600" />,
      valueColor: 'text-white',
      valueSize: 'text-lg font-mono',
      customContent: null,
      show: showVersion,
    },
    
    // Role Distribution (conditional)
    {
      key: 'roles',
      title: 'Role Distribution',
      value: null, // Custom content
      subtitle: null,
      icon: null,
      bgIcon: <Shield className="w-8 h-8 text-slate-600" />,
      valueColor: 'text-white',
      customContent: userStats?.roles ? (
        <div className="mt-2 space-y-1">
          {Object.entries(userStats.roles).slice(0, 2).map(([role, count]) => (
            <div key={role} className="flex items-center justify-between text-sm">
              <span className="text-slate-300 capitalize">{role}s</span>
              <span className="text-slate-400">{count}</span>
            </div>
          ))}
        </div>
      ) : null,
      show: showRoleDistribution && userStats?.roles,
    },
  ];

  const visibleCards = cards.filter(card => card.show);

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6', className)}>
      {visibleCards.map((card) => (
        <Card key={card.key} className="bg-slate-900/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">{card.title}</p>
                {card.customContent ? (
                  card.customContent
                ) : card.icon ? (
                  <div className="flex items-center gap-2 mt-1">
                    {card.icon}
                    <span className={cn('font-semibold', card.valueColor)}>
                      {card.value}
                    </span>
                  </div>
                ) : (
                  <p className={cn('font-bold mt-1', card.valueColor, card.valueSize || 'text-2xl')}>
                    {card.value}
                  </p>
                )}
                {card.subtitle && (
                  <p className="text-xs text-slate-500 mt-1">
                    {card.subtitle}
                  </p>
                )}
              </div>
              {card.bgIcon}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SystemStatusBar;