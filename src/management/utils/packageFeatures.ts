/**
 * Validate features array
 */
export const validateFeatures = (features: string[]): string | null => {
  if (!Array.isArray(features)) {
    return 'Features must be an array';
  }
  
  if (features.length > 20) {
    return 'Maximum 20 features allowed';
  }
  
  for (let i = 0; i < features.length; i++) {
    const feature = features[i];
    
    if (typeof feature !== 'string') {
      return 'All features must be text';
    }
    
    if (feature.trim().length === 0) {
      return 'Features cannot be empty';
    }
    
    if (feature.length > 200) {
      return 'Each feature must be less than 200 characters';
    }
  }
  
  return null;
};