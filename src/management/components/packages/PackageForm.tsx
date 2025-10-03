import React, { useState, useEffect } from 'react';
import { Save, X, Package as PackageIcon, DollarSign, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { packageManagementService } from '../../services/packageManagementService';
import { 
  CreatePackageData, 
  UpdatePackageData, 
  Package, 
  PackageType,
  PACKAGE_TYPE_OPTIONS 
} from '../../types/package';
import FeaturesEditor from './FeaturesEditor';

interface PackageFormData {
  name: string;
  description: string;
  package_type: PackageType;
  coin_amount: number;
  price_usd: number;
  features: string[];
  auto_sync: boolean;
}

interface PackageFormProps {
  package?: Package; // Optional for edit mode
  onSubmit: (data: CreatePackageData | UpdatePackageData) => Promise<boolean>;
  onCancel: () => void;
  isLoading?: boolean;
  className?: string;
}

const PackageForm: React.FC<PackageFormProps> = ({
  package: existingPackage,
  onSubmit,
  onCancel,
  isLoading = false,
  className,
}) => {
  const isEditMode = !!existingPackage;
  
  const [formData, setFormData] = useState<PackageFormData>({
    name: existingPackage?.name || '',
    description: existingPackage?.description || '',
    package_type: existingPackage?.package_type || 'one_time',
    coin_amount: existingPackage?.coin_amount || 100,
    price_usd: existingPackage?.price_usd || 9.99,
    features: existingPackage?.features || [],
    auto_sync: true,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(!isEditMode);

  // Track changes for edit mode
  useEffect(() => {
    if (isEditMode && existingPackage) {
      const changed = (
        formData.name !== existingPackage.name ||
        formData.description !== existingPackage.description ||
        formData.coin_amount !== existingPackage.coin_amount ||
        formData.price_usd !== existingPackage.price_usd ||
        JSON.stringify(formData.features) !== JSON.stringify(existingPackage.features)
      );
      setHasChanges(changed);
    }
  }, [formData, existingPackage, isEditMode]);

  const handleInputChange = (field: keyof PackageFormData, value: string | number | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFeaturesChange = (features: string[]) => {
    handleInputChange('features', features);
  };

  const validateForm = (): boolean => {
    const validationErrors = packageManagementService.validatePackageData(formData);
    const errorMap: Record<string, string> = {};
    
    // Convert validation errors to field-specific errors
    validationErrors.forEach(error => {
      if (error.includes('name')) {
        errorMap.name = error;
      } else if (error.includes('description') || error.includes('Description')) {
        errorMap.description = error;
      } else if (error.includes('coin') || error.includes('Coin')) {
        errorMap.coin_amount = error;
      } else if (error.includes('price') || error.includes('Price')) {
        errorMap.price_usd = error;
      } else if (error.includes('feature') || error.includes('Feature')) {
        errorMap.features = error;
      }
    });

    // Additional validation
    if (!formData.name.trim()) {
      errorMap.name = 'Package name is required';
    }
    if (!formData.description.trim()) {
      errorMap.description = 'Description is required';
    }
    if (formData.coin_amount <= 0) {
      errorMap.coin_amount = 'Coin amount must be greater than 0';
    }
    if (formData.price_usd <= 0) {
      errorMap.price_usd = 'Price must be greater than 0';
    }

    setErrors(errorMap);
    return Object.keys(errorMap).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = isEditMode
      ? {
          name: formData.name,
          description: formData.description,
          coin_amount: formData.coin_amount,
          price_usd: formData.price_usd,
          features: formData.features,
          auto_sync: formData.auto_sync,
        } as UpdatePackageData
      : formData as CreatePackageData;

    const success = await onSubmit(submitData);
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

  const getPackageTypeDescription = (type: PackageType): string => {
    switch (type) {
      case 'one_time':
        return 'Single purchase, permanent access to coins';
      case 'monthly_subscription':
        return 'Monthly recurring subscription with coin delivery';
      case 'yearly_subscription':
        return 'Annual subscription with best value pricing';
      default:
        return '';
    }
  };

  return (
    <Card className={cn('bg-slate-900/50 border-slate-700', className)}>
      <CardHeader>
        <CardTitle className="text-slate-200 flex items-center gap-2">
          <PackageIcon className="w-5 h-5" />
          {isEditMode ? `Edit Package: ${existingPackage?.name}` : 'Create New Package'}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Package Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">
                Package Name <span className="text-red-400">*</span>
              </Label>
              <div className="relative">
                <PackageIcon className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Starter Pack"
                  className="pl-10 bg-slate-800 border-slate-600 text-slate-200 placeholder:text-slate-500"
                  disabled={isLoading}
                  required
                />
              </div>
              {errors.name && (
                <p className="text-sm text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Package Type */}
            <div className="space-y-2">
              <Label htmlFor="package_type" className="text-slate-300">
                Package Type <span className="text-red-400">*</span>
              </Label>
              <Select
                value={formData.package_type}
                onValueChange={(value) => handleInputChange('package_type', value as PackageType)}
                disabled={isLoading || isEditMode} // Cannot change type in edit mode
              >
                <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-200">
                  <SelectValue placeholder="Select package type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {PACKAGE_TYPE_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-slate-200 hover:bg-slate-700 hover:text-white focus:bg-slate-700 focus:text-white"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isEditMode && (
                <p className="text-xs text-slate-500">
                  Package type cannot be changed after creation
                </p>
              )}
              {errors.package_type && (
                <p className="text-sm text-red-400">{errors.package_type}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-300">
              Description <span className="text-red-400">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Perfect for new learners getting started with premium content..."
              className="bg-slate-800 border-slate-600 text-slate-200 placeholder:text-slate-500 min-h-[100px]"
              disabled={isLoading}
              required
            />
            <p className="text-xs text-slate-500">
              {formData.description.length}/500 characters
            </p>
            {errors.description && (
              <p className="text-sm text-red-400">{errors.description}</p>
            )}
          </div>

          {/* Pricing Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Coin Amount */}
            <div className="space-y-2">
              <Label htmlFor="coin_amount" className="text-slate-300">
                Coin Amount <span className="text-red-400">*</span>
              </Label>
              <div className="relative">
                <Coins className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="coin_amount"
                  type="number"
                  min="1"
                  max="100000"
                  value={formData.coin_amount}
                  onChange={(e) => handleInputChange('coin_amount', parseInt(e.target.value) || 0)}
                  placeholder="100"
                  className="pl-10 bg-slate-800 border-slate-600 text-slate-200 placeholder:text-slate-500"
                  disabled={isLoading}
                  required
                />
              </div>
              <p className="text-xs text-slate-500">
                Between 1 and 100,000 coins
              </p>
              {errors.coin_amount && (
                <p className="text-sm text-red-400">{errors.coin_amount}</p>
              )}
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price_usd" className="text-slate-300">
                Price (USD) <span className="text-red-400">*</span>
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="price_usd"
                  type="number"
                  min="5.00"
                  max="10000"
                  step="0.01"
                  value={formData.price_usd}
                  onChange={(e) => handleInputChange('price_usd', parseFloat(e.target.value) || 0)}
                  placeholder="9.99"
                  className="pl-10 bg-slate-800 border-slate-600 text-slate-200 placeholder:text-slate-500"
                  disabled={isLoading}
                  required
                />
              </div>
              <p className="text-xs text-slate-500">
                Minimum $5.00, maximum $10,000
              </p>
              {errors.price_usd && (
                <p className="text-sm text-red-400">{errors.price_usd}</p>
              )}
            </div>
          </div>

          {/* Value Information */}
          {formData.coin_amount > 0 && formData.price_usd > 0 && (
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
              <h4 className="text-slate-300 font-medium mb-2">Package Value</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Price per Coin:</span>
                  <span className="text-slate-200 ml-2">
                    ${(formData.price_usd / formData.coin_amount).toFixed(4)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Total Value:</span>
                  <span className="text-slate-200 ml-2">
                    {packageManagementService.formatCurrency(formData.price_usd)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Package Features */}
          <FeaturesEditor
            features={formData.features}
            onChange={handleFeaturesChange}
            disabled={isLoading}
          />

          {/* Auto Sync Setting */}
          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-600">
            <div className="space-y-1">
              <Label htmlFor="auto_sync" className="text-slate-300">
                Auto-sync with Paddle
              </Label>
              <p className="text-xs text-slate-500">
                Automatically synchronize package with Paddle payment system
              </p>
            </div>
            <Switch
              id="auto_sync"
              checked={formData.auto_sync}
              onCheckedChange={(checked) => handleInputChange('auto_sync', checked)}
              disabled={isLoading}
            />
          </div>

          {/* Package Type Information */}
          {formData.package_type && (
            <Alert className="bg-slate-800/50 border-slate-600">
              <PackageIcon className="w-4 h-4" />
              <AlertDescription className="text-slate-300">
                <strong>{PACKAGE_TYPE_OPTIONS.find(opt => opt.value === formData.package_type)?.label}:</strong>
                <br />
                {getPackageTypeDescription(formData.package_type)}
              </AlertDescription>
            </Alert>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              disabled={isLoading}
              className="border border-slate-500 bg-slate-800 text-slate-200 hover:bg-slate-600 hover:text-white"
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
              {isLoading ? 'Saving...' : isEditMode ? 'Update Package' : 'Create Package'}
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

export default PackageForm;