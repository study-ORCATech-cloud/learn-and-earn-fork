import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  X, 
  List,
  GripVertical 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { validateFeatures } from '../../utils/packageFeatures';

interface FeaturesEditorProps {
  features: string[];
  onChange: (features: string[]) => void;
  className?: string;
  disabled?: boolean;
}

const FeaturesEditor: React.FC<FeaturesEditorProps> = ({
  features,
  onChange,
  className,
  disabled = false
}) => {
  const [currentFeatures, setCurrentFeatures] = useState<string[]>(
    features.length > 0 ? features : ['']
  );
  
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Update local state when props change (only on mount or when editing different package)
  useEffect(() => {
    setCurrentFeatures(features.length > 0 ? features : ['']);
  }, [features.join('|')]); // Use join to detect actual content changes
  
  const handleFeaturesUpdate = (newFeatures: string[]) => {
    setCurrentFeatures(newFeatures);
    
    // Validate and update parent
    const cleanFeatures = newFeatures.filter(f => f.trim().length > 0);
    const error = validateFeatures(cleanFeatures);
    setValidationError(error);
    
    if (!error) {
      onChange(cleanFeatures);
    }
  };
  
  const addFeature = () => {
    if (currentFeatures.length < 20) {
      const newFeatures = [...currentFeatures, ''];
      handleFeaturesUpdate(newFeatures);
    }
  };
  
  const updateFeature = (index: number, value: string) => {
    const updated = [...currentFeatures];
    updated[index] = value;
    handleFeaturesUpdate(updated);
  };
  
  const removeFeature = (index: number) => {
    if (currentFeatures.length > 1) {
      const updated = currentFeatures.filter((_, i) => i !== index);
      handleFeaturesUpdate(updated);
    } else {
      // Keep at least one empty input for adding features
      handleFeaturesUpdate(['']);
    }
  };
  
  return (
    <div className={cn('space-y-4', className)}>
      <Card className="bg-slate-900/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <List className="w-5 h-5" />
            Package Features
          </CardTitle>
          <p className="text-sm text-slate-400">
            Add features that describe what customers get with this package.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentFeatures.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-shrink-0 w-6 flex justify-center">
                <GripVertical className="w-4 h-4 text-slate-500" />
              </div>
              <Input
                value={feature}
                onChange={(e) => updateFeature(index, e.target.value)}
                placeholder="Enter package feature..."
                maxLength={200}
                disabled={disabled}
                className="bg-slate-800 border-slate-600 text-slate-200 placeholder-slate-500"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFeature(index)}
                disabled={disabled || (currentFeatures.length === 1 && feature.trim() === '')}
                className="border border-slate-500 bg-slate-800 text-slate-400 hover:bg-red-600 hover:text-white flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          
          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addFeature}
              disabled={disabled || currentFeatures.length >= 20}
              className="border border-slate-500 bg-slate-800 text-slate-200 hover:bg-slate-600 hover:text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Feature
            </Button>
            <p className="text-xs text-slate-500">
              {currentFeatures.filter(f => f.trim().length > 0).length} / 20 features
            </p>
          </div>
          
          {validationError && (
            <Alert className="bg-red-900/20 border-red-500/30">
              <AlertDescription className="text-red-400">
                {validationError}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FeaturesEditor;