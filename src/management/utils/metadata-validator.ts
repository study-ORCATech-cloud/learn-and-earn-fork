// Utility functions for validating backend metadata and providing clear error messages

import type { RoleHierarchy } from '../types/role';

export interface MetadataValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates that all required backend metadata is present and properly formatted
 */
export const validateRoleHierarchy = (roleHierarchy: RoleHierarchy | null | undefined): MetadataValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!roleHierarchy) {
    errors.push('Role hierarchy data is missing from backend /api/v1/roles endpoint');
    return { isValid: false, errors, warnings };
  }

  // Validate roles array
  if (!roleHierarchy.roles || roleHierarchy.roles.length === 0) {
    errors.push('No roles found in backend data');
  }

  // Validate role metadata
  if (!roleHierarchy.role_metadata) {
    errors.push('role_metadata is missing from backend response');
  } else {
    roleHierarchy.roles?.forEach(role => {
      const metadata = roleHierarchy.role_metadata![role.name];
      if (!metadata) {
        errors.push(`Missing metadata for role: ${role.name}`);
      } else {
        if (!metadata.display_name) warnings.push(`Missing display_name for role: ${role.name}`);
        if (!metadata.description) warnings.push(`Missing description for role: ${role.name}`);
        if (!metadata.icon) warnings.push(`Missing icon for role: ${role.name}`);
        if (!metadata.color) warnings.push(`Missing color for role: ${role.name}`);
      }
    });
  }

  // Validate permission metadata
  if (!roleHierarchy.permission_metadata) {
    errors.push('permission_metadata is missing from backend response');
  } else {
    // Check permissions from all roles
    const allPermissions = new Set<string>();
    roleHierarchy.roles?.forEach(role => {
      role.permissions?.forEach(permission => allPermissions.add(permission));
    });

    allPermissions.forEach(permission => {
      const metadata = roleHierarchy.permission_metadata![permission];
      if (!metadata) {
        errors.push(`Missing metadata for permission: ${permission}`);
      } else {
        if (!metadata.display_name) warnings.push(`Missing display_name for permission: ${permission}`);
        if (!metadata.description) warnings.push(`Missing description for permission: ${permission}`);
        if (!metadata.category) warnings.push(`Missing category for permission: ${permission}`);
      }
    });
  }

  // Validate category metadata
  if (!roleHierarchy.category_metadata) {
    errors.push('category_metadata is missing from backend response');
  }

  // Validate UI configuration
  if (!roleHierarchy.ui_configuration) {
    errors.push('ui_configuration is missing from backend response');
  } else {
    if (!roleHierarchy.ui_configuration.color_mapping) {
      errors.push('color_mapping is missing from ui_configuration');
    }
    if (!roleHierarchy.ui_configuration.icon_mapping) {
      errors.push('icon_mapping is missing from ui_configuration');
    }
    if (!roleHierarchy.ui_configuration.permission_categorization_rules) {
      warnings.push('permission_categorization_rules is missing from ui_configuration');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Logs validation results to console for debugging
 */
export const logValidationResults = (result: MetadataValidationResult, context: string = '') => {
  const prefix = context ? `[${context}] ` : '';
  
  if (!result.isValid) {
    console.error(`${prefix}Backend metadata validation failed:`);
    result.errors.forEach(error => console.error(`${prefix}❌ ${error}`));
  }

  if (result.warnings.length > 0) {
    console.warn(`${prefix}Backend metadata warnings:`);
    result.warnings.forEach(warning => console.warn(`${prefix}⚠️  ${warning}`));
  }

  if (result.isValid && result.warnings.length === 0) {
    console.log(`${prefix}✅ Backend metadata validation passed`);
  }
};

/**
 * Returns user-friendly error message for missing metadata
 */
export const getMetadataErrorMessage = (result: MetadataValidationResult): string => {
  if (result.isValid) return '';

  const errorCount = result.errors.length;
  const warningCount = result.warnings.length;

  let message = `Backend configuration incomplete (${errorCount} error${errorCount !== 1 ? 's' : ''}`;
  if (warningCount > 0) {
    message += `, ${warningCount} warning${warningCount !== 1 ? 's' : ''}`;
  }
  message += ')';

  return message;
};