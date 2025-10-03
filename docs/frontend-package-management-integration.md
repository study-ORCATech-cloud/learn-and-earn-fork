# Frontend Package Management Integration Guide

## Overview

This document provides comprehensive integration guidance for implementing package management features in the frontend dashboard, including the new **Package Features** functionality.

## Table of Contents

1. [API Endpoints](#api-endpoints)
2. [Package Features System](#package-features-system)
3. [Request/Response Examples](#requestresponse-examples)
4. [Frontend Component Guidelines](#frontend-component-guidelines)
5. [Validation Rules](#validation-rules)
6. [Error Handling](#error-handling)
7. [UI/UX Recommendations](#uiux-recommendations)

---

## API Endpoints

### Base URL
```
Production: https://api.labdojo.com
Development: http://localhost:5000
```

### Authentication
All admin endpoints require Bearer token authentication:
```javascript
headers: {
  'Authorization': `Bearer ${adminToken}`,
  'Content-Type': 'application/json'
}
```

### Core Package Management Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/v1/admin/packages` | Create new package |
| `GET` | `/v1/admin/packages` | List packages with filters |
| `GET` | `/v1/admin/packages/{id}` | Get package details |
| `PUT` | `/v1/admin/packages/{id}` | Update package |
| `DELETE` | `/v1/admin/packages/{id}` | Deactivate package |
| `POST` | `/v1/admin/packages/{id}/sync` | Retry Paddle sync |

---

## Package Features System

### Overview
The package features system allows customization of package benefits and automatically enriches custom features with type-specific defaults.

### Feature Enrichment Logic

**Input Features:**
```javascript
["Custom premium support", "Early access"]
```

**Auto-Enriched Output (one_time):**
```javascript
[
  "100 Dojo Coins",           // Always first (auto-added based on coin_amount)
  "Custom premium support",   // User's custom feature preserved
  "Early access",            // User's custom feature preserved  
  "No expiration",           // Auto-added for one_time packages
  "Instant coin delivery",   // Auto-added for one_time packages
  "Access to premium labs"   // Auto-added for one_time packages
]
```

### Package Type Defaults

#### One-Time Packages
```javascript
[
  "{coin_amount} Dojo Coins",
  "No expiration", 
  "Instant coin delivery",
  "Access to premium labs"
]
```

#### Monthly Subscriptions
```javascript
[
  "{coin_amount} Dojo Coins monthly",
  "Automatic renewal",
  "Cancel anytime", 
  "Best for regular users",
  "Access to premium labs"
]
```

#### Yearly Subscriptions
```javascript
[
  "{coin_amount} Dojo Coins annually",
  "Best value option",
  "Automatic renewal",
  "Cancel anytime", 
  "Access to premium labs"
]
```

---

## Request/Response Examples

### Create Package

**Request:**
```javascript
POST /v1/admin/packages

{
  "name": "Pro Pack",
  "description": "Professional package for advanced users",
  "package_type": "one_time",
  "coin_amount": 200,
  "price_usd": 19.99,
  "features": [
    "Priority support",
    "Advanced analytics access",
    "Custom integrations"
  ],
  "auto_sync": true
}
```

**Response:**
```javascript
{
  "success": true,
  "message": "Package created successfully",
  "package": {
    "id": "pkg_123456789",
    "name": "Pro Pack",
    "description": "Professional package for advanced users",
    "package_type": "one_time",
    "coin_amount": 200,
    "price_usd": 19.99,
    "features": [
      "200 Dojo Coins",
      "Priority support", 
      "Advanced analytics access",
      "Custom integrations",
      "No expiration",
      "Instant coin delivery",
      "Access to premium labs"
    ],
    "is_active": true,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  },
  "paddle_sync": {
    "status": "success",
    "product_id": "pro_abc123",
    "price_id": "pri_def456"
  }
}
```

### Update Package

**Request:**
```javascript
PUT /v1/admin/packages/pkg_123456789

{
  "name": "Pro Pack - Enhanced",
  "price_usd": 24.99,
  "features": [
    "Premium support",
    "Advanced analytics access", 
    "Custom integrations",
    "1-on-1 mentoring sessions"
  ]
}
```

### List Packages

**Request:**
```javascript
GET /v1/admin/packages?include_inactive=false&limit=20&offset=0&package_type=one_time
```

**Response:**
```javascript
{
  "success": true,
  "packages": [
    {
      "id": "pkg_123456789",
      "name": "Pro Pack",
      "package_type": "one_time",
      "coin_amount": 200,
      "price_usd": 19.99,
      "features": ["200 Dojo Coins", "Priority support", "..."],
      "is_active": true,
      "stats": {
        "total_purchases": 45,
        "total_revenue": 899.55,
        "active_subscriptions": 0
      }
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 20,
    "offset": 0,
    "has_next": false,
    "has_prev": false
  }
}
```

---

## Frontend Component Guidelines

### Package Form Component

```javascript
const PackageForm = ({ package = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: package?.name || '',
    description: package?.description || '',
    package_type: package?.package_type || 'one_time',
    coin_amount: package?.coin_amount || 50,
    price_usd: package?.price_usd || 5.99,
    features: package?.features || [],
    auto_sync: true
  });

  return (
    <form onSubmit={handleSubmit}>
      {/* Basic Fields */}
      <input name="name" value={formData.name} required />
      <textarea name="description" value={formData.description} />
      
      <select name="package_type" value={formData.package_type}>
        <option value="one_time">One-Time Purchase</option>
        <option value="monthly_subscription">Monthly Subscription</option>
        <option value="yearly_subscription">Yearly Subscription</option>
      </select>
      
      <input type="number" name="coin_amount" min="1" max="100000" />
      <input type="number" name="price_usd" min="5.00" step="0.01" />
      
      {/* Features Component */}
      <FeaturesEditor 
        features={formData.features}
        onChange={setFeatures}
        packageType={formData.package_type}
        coinAmount={formData.coin_amount}
      />
      
      <button type="submit">
        {package ? 'Update Package' : 'Create Package'}
      </button>
    </form>
  );
};
```

### Features Editor Component

```javascript
const FeaturesEditor = ({ features, onChange, packageType, coinAmount }) => {
  const [customFeatures, setCustomFeatures] = useState(features || []);
  
  // Show preview of what features will look like after enrichment
  const previewFeatures = useMemo(() => {
    return getEnrichedFeatures(customFeatures, coinAmount, packageType);
  }, [customFeatures, coinAmount, packageType]);

  const addFeature = () => {
    if (customFeatures.length < 20) {
      setCustomFeatures([...customFeatures, '']);
    }
  };

  const updateFeature = (index, value) => {
    const updated = [...customFeatures];
    updated[index] = value;
    setCustomFeatures(updated);
    onChange(updated);
  };

  const removeFeature = (index) => {
    const updated = customFeatures.filter((_, i) => i !== index);
    setCustomFeatures(updated);
    onChange(updated);
  };

  return (
    <div className="features-editor">
      <h3>Package Features</h3>
      
      {/* Custom Features Input */}
      <div className="custom-features">
        <h4>Custom Features</h4>
        {customFeatures.map((feature, index) => (
          <div key={index} className="feature-input">
            <input
              value={feature}
              onChange={(e) => updateFeature(index, e.target.value)}
              placeholder="Enter custom feature"
              maxLength={200}
            />
            <button onClick={() => removeFeature(index)}>Remove</button>
          </div>
        ))}
        
        <button onClick={addFeature} disabled={customFeatures.length >= 20}>
          Add Custom Feature
        </button>
      </div>
      
      {/* Preview of Final Features */}
      <div className="features-preview">
        <h4>Final Features (Preview)</h4>
        <ul>
          {previewFeatures.map((feature, index) => (
            <li key={index} className={index < customFeatures.length ? 'custom' : 'auto'}>
              {feature}
              {index < customFeatures.length && <span className="badge">Custom</span>}
              {index >= customFeatures.length && <span className="badge">Auto</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
```

### Helper Function for Feature Preview

```javascript
const getEnrichedFeatures = (customFeatures, coinAmount, packageType) => {
  const features = [...customFeatures];
  
  // Add coin amount at the beginning if not present
  const coinFeature = packageType === 'monthly_subscription' 
    ? `${coinAmount} Dojo Coins monthly`
    : packageType === 'yearly_subscription'
    ? `${coinAmount} Dojo Coins annually` 
    : `${coinAmount} Dojo Coins`;
    
  if (!features.includes(coinFeature)) {
    features.unshift(coinFeature);
  }
  
  // Add package type specific defaults
  const defaults = getDefaultFeatures(packageType);
  defaults.forEach(defaultFeature => {
    if (!features.includes(defaultFeature)) {
      features.push(defaultFeature);
    }
  });
  
  return features;
};

const getDefaultFeatures = (packageType) => {
  switch (packageType) {
    case 'one_time':
      return ["No expiration", "Instant coin delivery", "Access to premium labs"];
    case 'monthly_subscription':
      return ["Automatic renewal", "Cancel anytime", "Best for regular users", "Access to premium labs"];
    case 'yearly_subscription':
      return ["Best value option", "Automatic renewal", "Cancel anytime", "Access to premium labs"];
    default:
      return ["Access to premium labs"];
  }
};
```

---

## Validation Rules

### Client-Side Validation

```javascript
const validatePackage = (packageData) => {
  const errors = {};
  
  // Basic validation
  if (!packageData.name || packageData.name.length > 255) {
    errors.name = 'Name is required and must be less than 255 characters';
  }
  
  if (!packageData.package_type || !['one_time', 'monthly_subscription', 'yearly_subscription'].includes(packageData.package_type)) {
    errors.package_type = 'Valid package type is required';
  }
  
  if (!packageData.coin_amount || packageData.coin_amount < 1 || packageData.coin_amount > 100000) {
    errors.coin_amount = 'Coin amount must be between 1 and 100,000';
  }
  
  if (!packageData.price_usd || packageData.price_usd < 5.00) {
    errors.price_usd = 'Price must be at least $5.00';
  }
  
  // Features validation
  if (packageData.features) {
    if (packageData.features.length > 20) {
      errors.features = 'Maximum 20 features allowed';
    }
    
    packageData.features.forEach((feature, index) => {
      if (typeof feature !== 'string') {
        errors.features = 'All features must be text';
      }
      if (feature.trim().length === 0) {
        errors.features = 'Features cannot be empty';
      }
      if (feature.length > 200) {
        errors.features = 'Each feature must be less than 200 characters';
      }
    });
  }
  
  return errors;
};
```

---

## Error Handling

### API Error Responses

```javascript
// Validation Error (400)
{
  "success": false,
  "error": "validation_error", 
  "message": "Package name already exists: Pro Pack"
}

// Not Found Error (404)
{
  "success": false,
  "error": "not_found",
  "message": "Package not found: pkg_invalid"
}

// Internal Error (500)
{
  "success": false,
  "error": "internal_error",
  "message": "Failed to create package"
}
```

### Frontend Error Handling

```javascript
const handlePackageOperation = async (packageData) => {
  try {
    setLoading(true);
    
    const response = await fetch('/v1/admin/packages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(packageData)
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    setSuccess('Package created successfully!');
    onPackageCreated(result.package);
    
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

---

## UI/UX Recommendations

### Package Features Display

```jsx
const PackageCard = ({ package }) => (
  <div className="package-card">
    <h3>{package.name}</h3>
    <p className="price">${package.price_usd}</p>
    
    <div className="features-list">
      {package.features.map((feature, index) => (
        <div key={index} className="feature-item">
          <CheckIcon className="check-icon" />
          <span>{feature}</span>
        </div>
      ))}
    </div>
    
    <div className="package-actions">
      <button onClick={() => editPackage(package.id)}>Edit</button>
      <button onClick={() => duplicatePackage(package)}>Duplicate</button>
    </div>
  </div>
);
```

### Best Practices

1. **Real-time Preview**: Show feature enrichment preview as users type
2. **Smart Defaults**: Pre-populate common features based on package type
3. **Drag & Drop**: Allow reordering of custom features
4. **Bulk Operations**: Support bulk feature editing across packages
5. **Version History**: Track feature changes over time
6. **A/B Testing**: Support testing different feature sets

### Responsive Design

```css
.features-editor {
  display: grid;
  gap: 1rem;
}

@media (min-width: 768px) {
  .features-editor {
    grid-template-columns: 1fr 1fr;
  }
}

.feature-input {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.features-preview {
  border: 1px solid #e2e8f0;
  padding: 1rem;
  border-radius: 0.5rem;
}

.badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  margin-left: 0.5rem;
}

.badge.custom {
  background: #3b82f6;
  color: white;
}

.badge.auto {
  background: #6b7280;
  color: white;
}
```

---

## Testing Checklist

- [ ] Create package with custom features
- [ ] Create package without features (auto-generation)
- [ ] Update package features
- [ ] Validate feature limits (20 max, 200 chars each)
- [ ] Test different package types
- [ ] Verify feature enrichment logic
- [ ] Test Paddle sync integration
- [ ] Test error handling scenarios
- [ ] Verify responsive design
- [ ] Test with different user roles

---

## Support

For technical questions or issues with this integration:

1. Check the Postman collection: `locals/postman-collections/payment.json`
2. Review API logs for detailed error information
3. Test endpoints manually using the provided Postman examples

This documentation should provide everything needed to implement robust package management features in your frontend dashboard!