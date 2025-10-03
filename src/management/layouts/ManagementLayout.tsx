// Management layout with sidebar and header

import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { 
  Menu, 
  X, 
  ChevronRight, 
  Home, 
  ArrowLeft,
  HelpCircle,
  Settings,
  Coins,
  BarChart3,
  Shield,
  Users,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';
import { useManagement } from '../context/ManagementContext';
import ManagementSidebar from './ManagementSidebar';
import HelpModal from '../components/common/HelpModal';

interface BreadcrumbSegment {
  label: string;
  path?: string;
  isCurrentPage?: boolean;
}

interface ManagementLayoutProps {
  children?: React.ReactNode;
}

const ManagementLayout: React.FC<ManagementLayoutProps> = ({ children }) => {
  const location = useLocation();
  const management = useManagement();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  const generateBreadcrumbs = (): BreadcrumbSegment[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbSegment[] = [
      { label: 'Home', path: '/' },
    ];

    if (pathSegments.length === 0) return breadcrumbs;

    // Add Management root
    if (pathSegments[0] === 'management') {
      breadcrumbs.push({ label: 'Management', path: '/management' });
      
      if (pathSegments.length === 1) {
        breadcrumbs[breadcrumbs.length - 1].isCurrentPage = true;
        return breadcrumbs;
      }

      // Handle specific management sections
      switch (pathSegments[1]) {
        case 'users':
          breadcrumbs.push({ label: 'Users', path: '/management/users' });
          if (pathSegments[2] === 'create') {
            breadcrumbs.push({ label: 'Create User', isCurrentPage: true });
          } else if (pathSegments[2]) {
            breadcrumbs.push({ label: 'User Details', isCurrentPage: true });
          } else {
            breadcrumbs[breadcrumbs.length - 1].isCurrentPage = true;
          }
          break;
          
        case 'roles':
          breadcrumbs.push({ label: 'Roles', path: '/management/roles', isCurrentPage: true });
          break;
          
        case 'analytics':
          breadcrumbs.push({ label: 'Analytics', path: '/management/analytics', isCurrentPage: true });
          break;
          
        case 'dojo-coins':
          breadcrumbs.push({ label: 'Dojo Coins', path: '/management/dojo-coins', isCurrentPage: true });
          break;
          
        case 'contact-messages':
          breadcrumbs.push({ label: 'Contact Messages', path: '/management/contact-messages', isCurrentPage: true });
          break;
          
        case 'system':
          breadcrumbs.push({ label: 'System', path: '/management/system' });
          if (pathSegments[2] === 'health') {
            breadcrumbs.push({ label: 'Health Status', isCurrentPage: true });
          } else if (pathSegments[2] === 'cache') {
            breadcrumbs.push({ label: 'Cache Management', isCurrentPage: true });
          } else if (pathSegments[2] === 'logout') {
            breadcrumbs.push({ label: 'Global Logout', isCurrentPage: true });
          } else {
            breadcrumbs[breadcrumbs.length - 1].isCurrentPage = true;
          }
          break;
          
        default:
          breadcrumbs.push({ label: 'Unknown', isCurrentPage: true });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();
  const currentPageTitle = breadcrumbs.find(b => b.isCurrentPage)?.label || 'Management';

  const getPageIcon = () => {
    const path = location.pathname;
    if (path === '/management/system') return <Settings className="w-6 h-6" />;
    if (path === '/management/dojo-coins') return <Coins className="w-6 h-6" />;
    if (path === '/management/analytics') return <BarChart3 className="w-6 h-6" />;
    if (path === '/management/roles') return <Shield className="w-6 h-6" />;
    if (path === '/management/users') return <Users className="w-6 h-6" />;
    if (path === '/management/contact-messages') return <MessageSquare className="w-6 h-6" />;
    return null;
  };

  const getPageDescription = () => {
    const path = location.pathname;
    const descriptions = {
      '/management': 'System administration and user management dashboard',
      '/management/users': 'Manage users, roles, and permissions',
      '/management/users/create': 'Create a new user account',
      '/management/roles': 'View and manage role hierarchy and permissions',
      '/management/analytics': 'Dojo Coins economy and platform analytics',
      '/management/dojo-coins': 'Dojo Coins transactions and management',
      '/management/contact-messages': 'Manage customer inquiries and support requests',
      '/management/system': 'System health monitoring and maintenance',
    };
    return descriptions[path] || 'Management system administration';
  };

  // Check if user has management access
  if (!management.canPerformOperation('view_all_users') && !management.canPerformOperation('manage_system')) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl text-slate-600">🔒</div>
          <h1 className="text-2xl font-bold text-slate-200">Access Restricted</h1>
          <p className="text-slate-400 max-w-md">
            You don't have permission to access the management system. 
            Contact your administrator if you need access.
          </p>
          <Link to="/">
            <Button variant="outline" className="bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to App
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <ManagementSidebar 
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full">
            <ManagementSidebar />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-slate-900 border-b border-slate-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden text-slate-400 hover:text-white"
              >
                <Menu className="w-5 h-5" />
              </Button>

              {/* Desktop Sidebar Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:flex text-slate-400 hover:text-white"
              >
                {sidebarCollapsed ? (
                  <Menu className="w-5 h-5" />
                ) : (
                  <X className="w-5 h-5" />
                )}
              </Button>

              {/* Breadcrumbs */}
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && (
                        <BreadcrumbSeparator>
                          <ChevronRight className="w-4 h-4" />
                        </BreadcrumbSeparator>
                      )}
                      <BreadcrumbItem>
                        {crumb.isCurrentPage ? (
                          <BreadcrumbPage className="text-slate-200">
                            {crumb.label}
                          </BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link 
                              to={crumb.path || '#'}
                              className="text-slate-400 hover:text-slate-200"
                            >
                              {crumb.label}
                            </Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-3">
              {/* Help */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setHelpModalOpen(true)}
                className="text-slate-400 hover:bg-slate-800 hover:text-slate-300"
              >
                <HelpCircle className="w-5 h-5 text-slate-400 hover:text-slate-300" />
              </Button>

              {/* Return to App */}
              <Link to="/">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white"
                >
                  <Home className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Return to App</span>
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Header */}
        <div className="bg-slate-900/50 border-b border-slate-700 px-6 py-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              {getPageIcon()}
              {currentPageTitle}
            </h1>
            <p className="text-slate-400 text-sm">{getPageDescription()}</p>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-6 py-6">
            {children || <Outlet />}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-slate-900 border-t border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <div className="flex items-center gap-4">
              <span>Management System v1.0.0</span>
              <span>•</span>
              <span>Learn & Earn Platform</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Role: {management.currentUserRole}</span>
              {management.currentUser && (
                <>
                  <span>•</span>
                  <span>{management.currentUser.name}</span>
                </>
              )}
            </div>
          </div>
        </footer>
      </div>

      {/* Help Modal */}
      <HelpModal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
        currentPath={location.pathname}
      />
    </div>
  );
};

export default ManagementLayout;