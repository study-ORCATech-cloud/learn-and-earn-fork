// Help modal component for management pages

import React from 'react';
import { HelpCircle, X, BookOpen, Users, BarChart3, Shield, Settings, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
}

interface HelpContent {
  icon: React.ReactNode;
  title: string;
  description: string;
  sections: {
    title: string;
    content: string;
  }[];
}

const getHelpContent = (path: string): HelpContent => {
  const helpContentMap: Record<string, HelpContent> = {
    '/management': {
      icon: <Settings className="w-6 h-6" />,
      title: 'Management Dashboard',
      description: 'Central hub for system administration and user management.',
      sections: [
        {
          title: 'Overview',
          content: 'The management dashboard provides administrators with tools to manage users, roles, system health, and platform analytics. Navigate using the sidebar to access different management areas.'
        },
        {
          title: 'Access Control',
          content: 'Your access to management features depends on your role. Higher-level roles can manage more system components and user accounts.'
        }
      ]
    },
    '/management/users': {
      icon: <Users className="w-6 h-6" />,
      title: 'User Management',
      description: 'Manage user accounts, roles, and permissions.',
      sections: [
        {
          title: 'User Overview',
          content: 'View all registered users, their status, and basic information. Use the overview tab to see user distribution and account statistics.'
        },
        {
          title: 'User Operations',
          content: 'Search, filter, and manage individual users. You can change user roles, activate/deactivate accounts, and view detailed user information.'
        },
        {
          title: 'Bulk Operations',
          content: 'Select multiple users to perform bulk operations like role changes, account activation, or deactivation. Access this through the bulk actions tab.'
        }
      ]
    },
    '/management/roles': {
      icon: <Shield className="w-6 h-6" />,
      title: 'Role Management',
      description: 'Understand and manage the role hierarchy and permissions.',
      sections: [
        {
          title: 'Role Hierarchy',
          content: 'View the system role hierarchy from highest to lowest level. Higher-level roles can manage lower-level roles but not vice versa.'
        },
        {
          title: 'Permissions Matrix',
          content: 'The permissions matrix shows exactly which permissions each role has. Green checkmarks indicate granted permissions, while gray X marks show denied permissions.'
        },
        {
          title: 'Role Assignment Rules',
          content: 'Users can only manage roles lower than their own level. The Owner role can only be assigned at deployment time, and users cannot change their own role.'
        }
      ]
    },
    '/management/analytics': {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Platform Analytics',
      description: 'Monitor platform metrics and Dojo Coins economy.',
      sections: [
        {
          title: 'Economy Overview',
          content: 'Track the Dojo Coins economy including total coins in circulation, transaction volumes, and coin distribution across users.'
        },
        {
          title: 'User Analytics',
          content: 'Monitor user wallet balances, spending patterns, and engagement with premium content. View top spenders and users with the highest balances.'
        },
        {
          title: 'Lab Performance',
          content: 'Analyze lab popularity, ratings, and purchase patterns. Identify which labs are most popular and generate the most revenue.'
        }
      ]
    },
    '/management/dojo-coins': {
      icon: <Coins className="w-6 h-6" />,
      title: 'Dojo Coins Management',
      description: 'Manage Dojo Coins transactions and administrative controls.',
      sections: [
        {
          title: 'Transaction Monitoring',
          content: 'View all Dojo Coins transactions including lab purchases, admin grants, welcome bonuses, and refunds. Filter by user, transaction type, or date range.'
        },
        {
          title: 'Admin Controls',
          content: 'Grant coins to users, process refunds, and monitor the overall health of the Dojo Coins economy. All administrative actions are logged for audit purposes.'
        },
        {
          title: 'User Filtering',
          content: 'Filter transactions by user email to view a specific user\'s transaction history. This helps with support requests and account investigations.'
        }
      ]
    },
    '/management/system': {
      icon: <Settings className="w-6 h-6" />,
      title: 'System Management',
      description: 'Monitor system health and perform maintenance operations.',
      sections: [
        {
          title: 'System Health',
          content: 'Monitor the overall health status of the platform including database connectivity, cache performance, and system resources.'
        },
        {
          title: 'Cache Management',
          content: 'View cache statistics and clear specific cache types. This helps improve performance and resolve data inconsistency issues.'
        },
        {
          title: 'Maintenance Operations',
          content: 'Perform system maintenance operations like global user logout, cache clearing, and system health checks. Use these tools carefully in production environments.'
        }
      ]
    }
  };

  return helpContentMap[path] || helpContentMap['/management'];
};

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, currentPath }) => {
  const helpContent = getHelpContent(currentPath);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-3">
            {helpContent.icon}
            {helpContent.title}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {helpContent.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {helpContent.sections.map((section, index) => (
            <Card key={index} className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-slate-200 text-lg flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 leading-relaxed">
                  {section.content}
                </p>
              </CardContent>
            </Card>
          ))}

          <Separator className="bg-slate-700" />

          <div className="bg-slate-800/30 rounded-lg p-4">
            <h4 className="text-slate-200 font-medium mb-2 flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Need More Help?
            </h4>
            <p className="text-slate-400 text-sm">
              If you need additional assistance or have specific questions about using the management system, 
              please contact your system administrator or refer to the platform documentation.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-700">
          <Button
            onClick={onClose}
            variant="outline"
            className="bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white"
          >
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HelpModal;