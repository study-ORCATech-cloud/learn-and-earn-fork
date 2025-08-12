// User Details Modal component for displaying comprehensive user information

import React from 'react';
import { User, Calendar, Shield, Globe, Clock, Mail, ExternalLink, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useRoles } from '../../hooks/useRoles';
import { formatDate, formatRelativeTime, formatRole, isUserActive } from '../../utils/formatters';
import type { ManagementUser } from '../../types/user';

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: ManagementUser | null;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const { roleHierarchy } = useRoles();

  if (!user) {
    return null;
  }

  const roleInfo = formatRole(user.role, roleHierarchy);
  const userIsActive = isUserActive(user);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={user.avatar_url} alt={user.name} />
                <AvatarFallback className="bg-slate-700 text-slate-200 text-lg">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl text-slate-100 mb-1">
                  {user.name}
                </DialogTitle>
                <DialogDescription className="text-slate-400 text-base">
                  {user.email}
                </DialogDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant="secondary"
                    className={cn(
                      'text-xs',
                      userIsActive
                        ? 'bg-green-900/30 text-green-400 border-green-500/30'
                        : 'bg-orange-900/30 text-orange-400 border-orange-500/30'
                    )}
                  >
                    {userIsActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={cn('text-xs', roleInfo.className)}
                  >
                    <span className="mr-1">{roleInfo.icon}</span>
                    {roleInfo.text}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Account Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
              <User className="w-5 h-5" />
              Account Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-slate-400">User ID</div>
                <div className="text-slate-200 font-mono text-sm bg-slate-800 p-2 rounded">
                  {user.id}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-slate-400">Provider</div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-200 capitalize">{user.provider}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-slate-700" />

          {/* Role & Permissions */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Role & Permissions
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-md border border-slate-600">
                <span className="text-2xl">{roleInfo.icon}</span>
                <div>
                  <div className="text-slate-200 font-medium">{roleInfo.text}</div>
                  <div className="text-sm text-slate-400">Current user role</div>
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-slate-700" />

          {/* Activity Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Activity Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-slate-400">Last Login</div>
                <div className="text-slate-200">
                  {user.last_login ? (
                    <div>
                      <div>{formatDate(user.last_login)}</div>
                      <div className="text-sm text-slate-500">
                        {formatRelativeTime(user.last_login)}
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-500">Never logged in</span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-slate-400">Account Created</div>
                <div className="text-slate-200">
                  {user.created_at ? (
                    <div>
                      <div>{formatDate(user.created_at)}</div>
                      <div className="text-sm text-slate-500">
                        {formatRelativeTime(user.created_at)}
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-500">Unknown</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          {user.email && (
            <>
              <Separator className="bg-slate-700" />
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Contact Information
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <a
                      href={`mailto:${user.email}`}
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      {user.email}
                    </a>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Additional Information */}
          {(user.updated_at) && (
            <>
              <Separator className="bg-slate-700" />
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Additional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.updated_at && (
                    <div className="space-y-2">
                      <div className="text-sm text-slate-400">Last Updated</div>
                      <div className="text-slate-200">
                        <div>{formatDate(user.updated_at)}</div>
                        <div className="text-sm text-slate-500">
                          {formatRelativeTime(user.updated_at)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-6 mt-6 border-t border-slate-700">
          <Button
            onClick={onClose}
            className="bg-slate-700 hover:bg-slate-600 text-slate-200"
          >
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsModal;