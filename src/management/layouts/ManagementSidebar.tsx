// Management sidebar with role-based navigation

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  Settings, 
  ChevronRight,
  User,
  Activity,
  Database,
  LogOut,
  BarChart3,
  Coins,
  MessageSquare,
  Package
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useManagement } from '../context/ManagementContext';
import { useRoles } from '../hooks/useRoles';
import { formatRole } from '../utils/formatters';

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  requiredPermission?: string;
  badge?: string;
  description?: string;
  children?: NavigationItem[];
}

interface ManagementSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  className?: string;
}

const ManagementSidebar: React.FC<ManagementSidebarProps> = ({
  collapsed = false,
  onToggle,
  className,
}) => {
  const location = useLocation();
  const management = useManagement();
  const { roleHierarchy } = useRoles();

  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/management',
      icon: <LayoutDashboard className="w-5 h-5" />,
      description: 'Management overview and metrics',
    },
    {
      id: 'users',
      label: 'User Management',
      path: '/management/users',
      icon: <Users className="w-5 h-5" />,
      requiredPermission: 'view_all_users',
      description: 'Manage users, roles, and permissions',
    },
    {
      id: 'roles',
      label: 'Role Management',
      path: '/management/roles',
      icon: <Shield className="w-5 h-5" />,
      requiredPermission: 'view_all_users',
      description: 'Role hierarchy and permissions',
    },
    {
      id: 'contact-messages',
      label: 'Contact Messages',
      path: '/management/contact-messages',
      icon: <MessageSquare className="w-5 h-5" />,
      requiredPermission: 'manage_system',
      description: 'Manage customer inquiries and support requests',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      path: '/management/analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      requiredPermission: 'view_all_users',
      description: 'Dojo Coins economy and platform analytics'
    },
    {
      id: 'dojo-coins',
      label: 'Dojo Coins',
      path: '/management/dojo-coins',
      icon: <Coins className="w-5 h-5" />,
      requiredPermission: 'view_all_users',
      description: 'Dojo Coins transactions and management'
    },
    {
      id: 'packages',
      label: 'Packages',
      path: '/management/packages',
      icon: <Package className="w-5 h-5" />,
      requiredPermission: 'manage_system',
      description: 'Manage Dojo Coin packages and payment analytics'
    },
    {
      id: 'system',
      label: 'System',
      path: '/management/system',
      icon: <Settings className="w-5 h-5" />,
      requiredPermission: 'manage_system',
      description: 'System health and maintenance'
    },
  ];

  const filteredItems = navigationItems.filter(item => 
    !item.requiredPermission || management.canPerformOperation(item.requiredPermission)
  );

  const isActiveRoute = (path: string) => {
    if (path === '/management') {
      return location.pathname === '/management';
    }
    return location.pathname.startsWith(path);
  };

  const isParentActive = (item: NavigationItem) => {
    if (isActiveRoute(item.path)) return true;
    return item.children?.some(child => isActiveRoute(child.path)) || false;
  };

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const isActive = isActiveRoute(item.path);
    const isParentExpanded = isParentActive(item);
    const hasChildren = item.children && item.children.length > 0;
    const filteredChildren = item.children?.filter(child => 
      !child.requiredPermission || management.canPerformOperation(child.requiredPermission)
    );

    return (
      <div key={item.id} className="space-y-1">
        <NavLink
          to={item.path}
          className={({ isActive: linkActive }) => cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            level === 0 ? 'mx-2' : 'mx-4',
            linkActive
              ? 'bg-blue-600 text-white'
              : 'text-slate-300 hover:text-white hover:bg-slate-700',
            collapsed && level === 0 && 'justify-center px-2'
          )}
          end={item.path === '/management'}
          title={collapsed ? item.label : undefined}
        >
          <span className={cn('shrink-0', level > 0 && 'ml-2')}>
            {item.icon}
          </span>
          
          {!collapsed && (
            <>
              <span className="flex-1 truncate">{item.label}</span>
              
              {item.badge && (
                <Badge variant="secondary" className="bg-slate-600 text-slate-200 text-xs">
                  {item.badge}
                </Badge>
              )}
              
              {hasChildren && (
                <ChevronRight 
                  className={cn(
                    'w-4 h-4 transition-transform text-slate-400',
                    isParentExpanded && 'rotate-90'
                  )} 
                />
              )}
            </>
          )}
        </NavLink>

        {/* Children */}
        {hasChildren && !collapsed && isParentExpanded && (
          <div className="space-y-1">
            {filteredChildren?.map(child => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn(
      'flex flex-col bg-slate-900 border-r border-slate-700 transition-all duration-300',
      collapsed ? 'w-16' : 'w-64',
      className
    )}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        {!collapsed ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-400" />
              <h2 className="font-semibold text-white">Management</h2>
            </div>
            
            {/* Current User Role */}
            <div className="flex items-center gap-2 p-2 bg-slate-800 rounded-lg">
              <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">
                  {management.currentUser?.name || 'Admin User'}
                </p>
                <div className="flex items-center gap-1">
                  {(() => {
                    const roleInfo = formatRole(management.currentUserRole, roleHierarchy);
                    return (
                      <>
                        <span className="text-xs">{roleInfo.icon}</span>
                        <span className="text-xs text-slate-400">{roleInfo.text}</span>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-2 overflow-y-auto">
        {filteredItems.map(item => renderNavigationItem(item))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700">
        {!collapsed ? (
          <div className="space-y-3">
            <div className="text-xs text-slate-500">
              <div>Management Panel</div>
              <div>v1.0.0</div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Role Level</span>
              <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">
                {management.currentUserRole}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagementSidebar;