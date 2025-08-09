// User form component for creating and editing users

import React, { useState, useEffect } from 'react';
import { Save, X, Upload, User, Mail, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useManagement } from '../../context/ManagementContext';
import { useRoles } from '../../hooks/useRoles';
import { validateCreateUserForm, validateUpdateUserForm } from '../../utils/validators';
import { formatRole } from '../../utils/formatters';
import type { ManagementUser } from '../../types/user';
import type { UserRole } from '../../types/role';

interface UserFormData {
  email: string;
  name: string;
  role: UserRole;
  avatar_url: string;
}

interface UserFormProps {
  user?: ManagementUser; // undefined for create, populated for edit
  onSubmit: (data: UserFormData) => Promise<boolean>;
  onCancel: () => void;
  isLoading?: boolean;
  className?: string;
}

const UserForm: React.FC<UserFormProps> = ({
  user,
  onSubmit,
  onCancel,
  isLoading = false,
  className,
}) => {
  const management = useManagement();
  const { manageableRoles: manageableRolesData, roleHierarchy, isLoading: isLoadingRoles } = useRoles();
  const manageableRoles = manageableRolesData?.detailed_roles || [];
  
  const isEditMode = !!user;
  const [formData, setFormData] = useState<UserFormData>({
    email: user?.email || '',
    name: user?.name || '',
    role: (user?.role || 'user') as UserRole,
    avatar_url: user?.avatar_url || '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Track changes for edit mode
  useEffect(() => {
    if (isEditMode && user) {
      const changed = (
        formData.name !== user.name ||
        formData.role !== user.role ||
        formData.avatar_url !== (user.avatar_url || '') ||
        (!isEditMode && formData.email !== user.email) // Email can only change in create mode
      );
      setHasChanges(changed);
    } else {
      // Create mode - check if any fields are filled
      const hasData = formData.email || formData.name || formData.role !== ('user' as UserRole) || formData.avatar_url;
      setHasChanges(!!hasData);
    }
  }, [formData, user, isEditMode]);

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    const newValue = field === 'role' ? value as UserRole : value;
    setFormData(prev => ({ ...prev, [field]: newValue }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validation = isEditMode 
      ? validateUpdateUserForm({
          name: formData.name,
          avatar_url: formData.avatar_url,
        })
      : validateCreateUserForm(formData, manageableRoles.map(r => r.name));
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Check if user can assign this role
    if (formData.role !== (user?.role || 'user')) {
      const canManageRole = management.canManageRole(formData.role as UserRole);
      if (!canManageRole) {
        setErrors({ role: 'You do not have permission to assign this role' });
        return;
      }
    }

    // Submit form
    const success = await onSubmit(formData);
    if (!success) {
      // Error handling is done by parent component
      return;
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to cancel?'
      );
      if (!confirmed) return;
    }
    onCancel();
  };


  const canChangeRole = isEditMode 
    ? management.canManageRole(user.role) 
    : management.canPerformOperation('create_user');

  return (
    <Card className={cn('bg-slate-900/50 border-slate-700', className)}>
      <CardHeader>
        <CardTitle className="text-slate-200 flex items-center gap-2">
          <User className="w-5 h-5" />
          {isEditMode ? `Edit User: ${user.name}` : 'Create New User'}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={formData.avatar_url} alt={formData.name || 'User'} />
              <AvatarFallback className="bg-slate-700 text-slate-200 text-xl">
                {formData.name ? formData.name.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-2">
              <Label htmlFor="avatar_url" className="text-slate-300">
                Avatar URL
              </Label>
              <div className="flex gap-2">
                <Input
                  id="avatar_url"
                  type="url"
                  value={formData.avatar_url}
                  onChange={(e) => handleInputChange('avatar_url', e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="bg-slate-800 border-slate-600 text-slate-200 placeholder:text-slate-500"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  disabled={isLoading}
                  title="Upload avatar (feature coming soon)"
                >
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
              {errors.avatar_url && (
                <p className="text-sm text-red-400">{errors.avatar_url}</p>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">
                Email <span className="text-red-400">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="user@example.com"
                  className="pl-10 bg-slate-800 border-slate-600 text-slate-200 placeholder:text-slate-500"
                  disabled={isLoading || isEditMode} // Email cannot be edited (SSO only)
                  required
                />
              </div>
              {isEditMode && (
                <p className="text-xs text-slate-500">
                  Email cannot be changed (managed by OAuth providers)
                </p>
              )}
              {errors.email && (
                <p className="text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">
                Full Name <span className="text-red-400">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="John Doe"
                  className="pl-10 bg-slate-800 border-slate-600 text-slate-200 placeholder:text-slate-500"
                  disabled={isLoading}
                  required
                />
              </div>
              {errors.name && (
                <p className="text-sm text-red-400">{errors.name}</p>
              )}
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role" className="text-slate-300">
              Role <span className="text-red-400">*</span>
            </Label>
            <div className="flex gap-4">
              <div className="flex-1">
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleInputChange('role', value)}
                  disabled={isLoading || !canChangeRole || isLoadingRoles}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-200">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-slate-400" />
                      <SelectValue placeholder="Select a role" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {manageableRoles.map((role) => {
                      const roleInfo = formatRole(role.name, roleHierarchy);
                      return (
                        <SelectItem
                          key={role.name}
                          value={role.name}
                          className="text-slate-200 focus:bg-slate-700 focus:text-white"
                        >
                          <div className="flex items-center gap-2">
                            <span>{roleInfo.icon}</span>
                            <span>{roleInfo.text}</span>
                            <span className="text-xs text-slate-500">
                              (Level {role.level})
                            </span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              {formData.role && (
                <div className="flex items-center">
                  {(() => {
                    const roleInfo = formatRole(formData.role as UserRole, roleHierarchy);
                    return (
                      <div className={cn('px-3 py-2 rounded-md border text-sm', roleInfo.className)}>
                        <span className="mr-1">{roleInfo.icon}</span>
                        {roleInfo.text}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
            
            {!canChangeRole && (
              <p className="text-xs text-slate-500">
                You do not have permission to change roles
              </p>
            )}
            
            {errors.role && (
              <p className="text-sm text-red-400">{errors.role}</p>
            )}
          </div>

          {/* Role Information */}
          {formData.role && manageableRoles.find(r => r.name === formData.role) && (
            <Alert className="bg-slate-800/50 border-slate-600">
              <Shield className="w-4 h-4" />
              <AlertDescription className="text-slate-300">
                <strong>{formData.role.charAt(0).toUpperCase() + formData.role.slice(1)} Role:</strong>
                <br />
                {(() => {
                  const role = manageableRoles.find(r => r.name === formData.role);
                  if (role?.permissions) {
                    return `Permissions: ${role.permissions.slice(0, 3).join(', ')}${role.permissions.length > 3 ? ` and ${role.permissions.length - 3} more` : ''}`;
                  }
                  return 'Loading permissions...';
                })()}
              </AlertDescription>
            </Alert>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            
            <Button
              type="submit"
              disabled={isLoading || !hasChanges || Object.keys(errors).length > 0}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : isEditMode ? 'Update User' : 'Create User'}
            </Button>
          </div>

          {/* Validation Summary */}
          {Object.keys(errors).length > 0 && (
            <Alert className="bg-red-900/20 border-red-500/30">
              <AlertDescription className="text-red-400">
                Please fix the validation errors above before submitting.
              </AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default UserForm;