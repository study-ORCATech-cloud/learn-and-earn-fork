// Form validation utilities for management interface

/**
 * Validate email format
 */
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true };
};

/**
 * Validate user name
 */
export const validateUserName = (name: string): { isValid: boolean; error?: string } => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Name is required' };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long' };
  }
  
  if (name.trim().length > 50) {
    return { isValid: false, error: 'Name must be less than 50 characters' };
  }
  
  // Check for invalid characters
  const nameRegex = /^[a-zA-Z\s\-'\.]+$/;
  if (!nameRegex.test(name.trim())) {
    return { isValid: false, error: 'Name can only contain letters, spaces, hyphens, apostrophes, and periods' };
  }
  
  return { isValid: true };
};

/**
 * Validate avatar URL
 */
export const validateAvatarUrl = (url: string): { isValid: boolean; error?: string } => {
  if (!url) {
    return { isValid: true }; // Avatar URL is optional
  }
  
  try {
    new URL(url);
  } catch {
    return { isValid: false, error: 'Please enter a valid URL' };
  }
  
  // Check if URL is for an image
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const hasImageExtension = imageExtensions.some(ext => 
    url.toLowerCase().includes(ext)
  );
  
  // Also allow common image hosting domains without extensions
  const imageHosts = ['gravatar.com', 'githubusercontent.com', 'googleusercontent.com'];
  const isImageHost = imageHosts.some(host => url.toLowerCase().includes(host));
  
  if (!hasImageExtension && !isImageHost) {
    return { isValid: false, error: 'URL should point to an image file' };
  }
  
  return { isValid: true };
};

/**
 * Validate role selection
 */
export const validateRole = (role: string, allowedRoles: string[]): { isValid: boolean; error?: string } => {
  if (!role) {
    return { isValid: false, error: 'Role is required' };
  }
  
  if (!allowedRoles.includes(role)) {
    return { isValid: false, error: 'Invalid role selection' };
  }
  
  return { isValid: true };
};

/**
 * Validate search query
 */
export const validateSearchQuery = (query: string): { isValid: boolean; error?: string } => {
  if (!query) {
    return { isValid: true }; // Empty search is valid
  }
  
  if (query.trim().length < 2) {
    return { isValid: false, error: 'Search query must be at least 2 characters long' };
  }
  
  if (query.trim().length > 100) {
    return { isValid: false, error: 'Search query must be less than 100 characters' };
  }
  
  return { isValid: true };
};

/**
 * Validate bulk operation reason
 */
export const validateReason = (reason: string, required: boolean = false): { isValid: boolean; error?: string } => {
  if (!reason && required) {
    return { isValid: false, error: 'Reason is required for this operation' };
  }
  
  if (reason && reason.trim().length > 500) {
    return { isValid: false, error: 'Reason must be less than 500 characters' };
  }
  
  return { isValid: true };
};

/**
 * Validate user selection for bulk operations
 */
export const validateUserSelection = (selectedUsers: string[]): { isValid: boolean; error?: string } => {
  if (selectedUsers.length === 0) {
    return { isValid: false, error: 'Please select at least one user' };
  }
  
  if (selectedUsers.length > 100) {
    return { isValid: false, error: 'Cannot perform bulk operation on more than 100 users at once' };
  }
  
  return { isValid: true };
};

/**
 * Validate pagination parameters
 */
export const validatePagination = (page: number, limit: number): { isValid: boolean; error?: string } => {
  if (page < 1) {
    return { isValid: false, error: 'Page number must be at least 1' };
  }
  
  if (limit < 1) {
    return { isValid: false, error: 'Limit must be at least 1' };
  }
  
  if (limit > 100) {
    return { isValid: false, error: 'Limit cannot exceed 100' };
  }
  
  return { isValid: true };
};

/**
 * Validate date range
 */
export const validateDateRange = (startDate?: string, endDate?: string): { isValid: boolean; error?: string } => {
  if (!startDate && !endDate) {
    return { isValid: true }; // No date filter is valid
  }
  
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { isValid: false, error: 'Invalid date format' };
    }
    
    if (start > end) {
      return { isValid: false, error: 'Start date must be before end date' };
    }
    
    // Check if date range is reasonable (not more than 1 year)
    const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff > 365) {
      return { isValid: false, error: 'Date range cannot exceed 1 year' };
    }
  }
  
  return { isValid: true };
};

/**
 * Validate form data for creating a user
 */
export const validateCreateUserForm = (formData: {
  email: string;
  name: string;
  role: string;
  avatar_url?: string;
}, allowedRoles: string[]): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error!;
  }
  
  const nameValidation = validateUserName(formData.name);
  if (!nameValidation.isValid) {
    errors.name = nameValidation.error!;
  }
  
  const roleValidation = validateRole(formData.role, allowedRoles);
  if (!roleValidation.isValid) {
    errors.role = roleValidation.error!;
  }
  
  if (formData.avatar_url) {
    const avatarValidation = validateAvatarUrl(formData.avatar_url);
    if (!avatarValidation.isValid) {
      errors.avatar_url = avatarValidation.error!;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate form data for updating a user
 */
export const validateUpdateUserForm = (formData: {
  name?: string;
  avatar_url?: string;
}): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  if (formData.name !== undefined) {
    const nameValidation = validateUserName(formData.name);
    if (!nameValidation.isValid) {
      errors.name = nameValidation.error!;
    }
  }
  
  if (formData.avatar_url !== undefined && formData.avatar_url !== '') {
    const avatarValidation = validateAvatarUrl(formData.avatar_url);
    if (!avatarValidation.isValid) {
      errors.avatar_url = avatarValidation.error!;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};