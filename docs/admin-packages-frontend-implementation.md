# Admin Packages Frontend Implementation Guide

This document provides comprehensive implementation guidance for integrating with the Admin Packages API endpoints. All endpoints require **Owner-level authentication** and are designed for administrative package management.

## Base Configuration

```javascript
const API_BASE_URL = 'http://localhost:5000'; // Development
// const API_BASE_URL = 'https://your-production-domain.com'; // Production

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${authToken}` // Owner JWT token required
};
```

## API Endpoints

### 1. Create Package

**Creates a new coin package with automatic Paddle synchronization.**

- **URL**: `POST /v1/admin/packages`
- **Authentication**: Owner role required
- **Description**: Creates a new coin package and optionally syncs it with Paddle payment system

#### Request Body
```json
{
  "name": "Starter Pack",
  "description": "Perfect for new learners getting started",
  "package_type": "one_time", // Required: "one_time", "monthly_subscription", "yearly_subscription"
  "coin_amount": 100, // Required: 1-100,000 coins
  "price_usd": 9.99, // Required: Minimum $5.00
  "auto_sync": true // Optional: Default true, syncs to Paddle
}
```

#### Response Body
```json
{
  "success": true,
  "message": "Package created successfully",
  "package": {
    "id": "pkg-uuid-here",
    "name": "Starter Pack",
    "description": "Perfect for new learners getting started",
    "package_type": "one_time",
    "coin_amount": 100,
    "price_usd": 9.99,
    "is_active": true,
    "paddle_product_id": "pro_abc123",
    "paddle_price_id": "pri_def456",
    "created_at": "2025-01-29T15:30:00Z",
    "updated_at": "2025-01-29T15:30:00Z"
  },
  "paddle_sync": {
    "status": "success",
    "product_id": "pro_abc123",
    "price_id": "pri_def456",
    "message": "Package synced to Paddle successfully"
  }
}
```

#### Error Response
```json
{
  "success": false,
  "error": "validation_error",
  "message": "Coin amount must be between 1 and 100,000"
}
```

#### Frontend Implementation
```javascript
async function createPackage(packageData) {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/admin/packages`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(packageData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Package created:', result.package);
      // Handle successful creation - update UI, show success message
      return result.package;
    } else {
      // Handle validation errors
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Failed to create package:', error);
    throw error;
  }
}

// Usage example
const newPackage = {
  name: "Pro Pack",
  description: "Advanced package for serious learners",
  package_type: "monthly_subscription",
  coin_amount: 500,
  price_usd: 29.99
};

createPackage(newPackage);
```

---

### 2. List Packages

**Retrieves all packages with filtering and pagination options.**

- **URL**: `GET /v1/admin/packages`
- **Authentication**: Owner role required
- **Description**: Lists packages with optional filtering, includes statistics

#### Query Parameters
- `include_inactive` (boolean): Include deactivated packages (default: false)
- `package_type` (string): Filter by "one_time", "monthly_subscription", "yearly_subscription"
- `limit` (integer): Results per page (default: 50, max: 100)
- `offset` (integer): Pagination offset (default: 0)

#### Request Example
```
GET /v1/admin/packages?include_inactive=true&package_type=one_time&limit=20&offset=0
```

#### Response Body
```json
{
  "success": true,
  "packages": [
    {
      "id": "pkg-uuid-1",
      "name": "Starter Pack",
      "description": "Perfect for new learners",
      "package_type": "one_time",
      "coin_amount": 100,
      "price_usd": 9.99,
      "is_active": true,
      "paddle_product_id": "pro_abc123",
      "paddle_price_id": "pri_def456",
      "created_at": "2025-01-29T15:30:00Z",
      "updated_at": "2025-01-29T15:30:00Z",
      "stats": {
        "total_purchases": 150,
        "total_revenue": 1498.50,
        "active_subscriptions": 0
      }
    },
    {
      "id": "pkg-uuid-2",
      "name": "Pro Monthly",
      "description": "Monthly subscription for regular learners",
      "package_type": "monthly_subscription",
      "coin_amount": 500,
      "price_usd": 29.99,
      "is_active": true,
      "paddle_product_id": "pro_xyz789",
      "paddle_price_id": "pri_abc123",
      "created_at": "2025-01-29T16:00:00Z",
      "updated_at": "2025-01-29T16:00:00Z",
      "stats": {
        "total_purchases": 75,
        "total_revenue": 2249.25,
        "active_subscriptions": 45
      }
    }
  ],
  "pagination": {
    "total": 2,
    "limit": 20,
    "offset": 0,
    "has_next": false,
    "has_prev": false
  }
}
```

#### Frontend Implementation
```javascript
async function listPackages(filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.includeInactive) queryParams.set('include_inactive', 'true');
    if (filters.packageType) queryParams.set('package_type', filters.packageType);
    if (filters.limit) queryParams.set('limit', filters.limit.toString());
    if (filters.offset) queryParams.set('offset', filters.offset.toString());
    
    const url = `${API_BASE_URL}/v1/admin/packages?${queryParams.toString()}`;
    const response = await fetch(url, { headers });
    
    const result = await response.json();
    
    if (result.success) {
      return {
        packages: result.packages,
        pagination: result.pagination
      };
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Failed to list packages:', error);
    throw error;
  }
}

// Usage examples
const allActivePackages = await listPackages();
const subscriptionPackages = await listPackages({ 
  packageType: 'monthly_subscription', 
  includeInactive: true 
});
```

---

### 3. Get Package Details

**Retrieves detailed information about a specific package.**

- **URL**: `GET /v1/admin/packages/{package_id}`
- **Authentication**: Owner role required
- **Description**: Gets comprehensive package details including statistics

#### Path Parameters
- `package_id` (string): UUID of the package

#### Request Example
```
GET /v1/admin/packages/pkg-uuid-here
```

#### Response Body
```json
{
  "success": true,
  "package": {
    "id": "pkg-uuid-here",
    "name": "Starter Pack",
    "description": "Perfect for new learners getting started",
    "package_type": "one_time",
    "coin_amount": 100,
    "price_usd": 9.99,
    "is_active": true,
    "paddle_product_id": "pro_abc123",
    "paddle_price_id": "pri_def456",
    "created_at": "2025-01-29T15:30:00Z",
    "updated_at": "2025-01-29T15:30:00Z",
    "stats": {
      "total_purchases": 150,
      "total_revenue": 1498.50,
      "active_subscriptions": 0,
      "avg_rating": 4.7,
      "recent_purchases": 12,
      "conversion_rate": 85.3
    }
  }
}
```

#### Error Response
```json
{
  "success": false,
  "error": "not_found",
  "message": "Package not found: pkg-invalid-uuid"
}
```

#### Frontend Implementation
```javascript
async function getPackageDetails(packageId) {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/admin/packages/${packageId}`, {
      headers
    });
    
    const result = await response.json();
    
    if (result.success) {
      return result.package;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Failed to get package details:', error);
    throw error;
  }
}

// Usage
const packageDetails = await getPackageDetails('pkg-uuid-here');
console.log('Package stats:', packageDetails.stats);
```

---

### 4. Update Package

**Updates an existing package and optionally syncs changes with Paddle.**

- **URL**: `PUT /v1/admin/packages/{package_id}`
- **Authentication**: Owner role required
- **Description**: Updates package details and syncs with Paddle if requested

#### Path Parameters
- `package_id` (string): UUID of the package to update

#### Request Body
```json
{
  "name": "Updated Starter Pack", // Optional
  "description": "New improved description", // Optional
  "coin_amount": 120, // Optional
  "price_usd": 12.99, // Optional
  "is_active": true, // Optional
  "auto_sync": true // Optional: Default true
}
```

#### Response Body
```json
{
  "success": true,
  "message": "Package updated successfully",
  "package": {
    "id": "pkg-uuid-here",
    "name": "Updated Starter Pack",
    "description": "New improved description",
    "package_type": "one_time",
    "coin_amount": 120,
    "price_usd": 12.99,
    "is_active": true,
    "paddle_product_id": "pro_abc123",
    "paddle_price_id": "pri_new456", // New price ID if price changed
    "created_at": "2025-01-29T15:30:00Z",
    "updated_at": "2025-01-29T16:45:00Z"
  },
  "paddle_sync": {
    "status": "success",
    "product_id": "pro_abc123",
    "price_id": "pri_new456",
    "message": "Package synced to Paddle successfully"
  }
}
```

#### Frontend Implementation
```javascript
async function updatePackage(packageId, updates) {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/admin/packages/${packageId}`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(updates)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Package updated:', result.package);
      return result.package;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Failed to update package:', error);
    throw error;
  }
}

// Usage example
const updates = {
  price_usd: 19.99,
  description: "Enhanced package with more value",
  auto_sync: true
};

const updatedPackage = await updatePackage('pkg-uuid-here', updates);
```

---

### 5. Delete Package (Soft Delete)

**Deactivates a package without permanently deleting it.**

- **URL**: `DELETE /v1/admin/packages/{package_id}`
- **Authentication**: Owner role required
- **Description**: Soft deletes by setting is_active to false

#### Path Parameters
- `package_id` (string): UUID of the package to delete

#### Request Example
```
DELETE /v1/admin/packages/pkg-uuid-here
```

#### Response Body
```json
{
  "success": true,
  "message": "Package deactivated successfully",
  "package": {
    "id": "pkg-uuid-here",
    "name": "Starter Pack",
    "is_active": false,
    "updated_at": "2025-01-29T17:00:00Z"
  }
}
```

#### Frontend Implementation
```javascript
async function deletePackage(packageId) {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/admin/packages/${packageId}`, {
      method: 'DELETE',
      headers
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Package deactivated:', result.package);
      return result.package;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Failed to delete package:', error);
    throw error;
  }
}

// Usage with confirmation
async function deletePackageWithConfirmation(packageId, packageName) {
  const confirmed = confirm(`Are you sure you want to deactivate "${packageName}"?`);
  if (confirmed) {
    return await deletePackage(packageId);
  }
}
```

---

### 6. Retry Paddle Sync

**Manually retries Paddle synchronization for a package.**

- **URL**: `POST /v1/admin/packages/{package_id}/sync`
- **Authentication**: Owner role required
- **Description**: Manually triggers Paddle sync for troubleshooting

#### Path Parameters
- `package_id` (string): UUID of the package to sync

#### Request Example
```
POST /v1/admin/packages/pkg-uuid-here/sync
```

#### Response Body
```json
{
  "success": true,
  "message": "Paddle sync completed",
  "sync_result": {
    "status": "success",
    "product_id": "pro_abc123",
    "price_id": "pri_def456",
    "message": "Package synced to Paddle successfully"
  }
}
```

#### Error Response
```json
{
  "success": true,
  "message": "Paddle sync completed",
  "sync_result": {
    "status": "failed",
    "error": "Paddle API error: Product already exists",
    "retry_available": true
  }
}
```

#### Frontend Implementation
```javascript
async function retryPaddleSync(packageId) {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/admin/packages/${packageId}/sync`, {
      method: 'POST',
      headers
    });
    
    const result = await response.json();
    
    if (result.success) {
      if (result.sync_result.status === 'success') {
        console.log('Sync successful:', result.sync_result);
        return result.sync_result;
      } else {
        console.warn('Sync failed:', result.sync_result.error);
        throw new Error(result.sync_result.error);
      }
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Failed to sync package:', error);
    throw error;
  }
}

// Usage with UI feedback
async function syncPackageWithFeedback(packageId) {
  try {
    showLoading('Syncing with Paddle...');
    const syncResult = await retryPaddleSync(packageId);
    showSuccess('Package synced successfully!');
    return syncResult;
  } catch (error) {
    showError(`Sync failed: ${error.message}`);
    throw error;
  } finally {
    hideLoading();
  }
}
```

---

### 7. Get Payment Analytics

**Retrieves comprehensive payment analytics and statistics.**

- **URL**: `GET /v1/admin/analytics/payments`
- **Authentication**: Owner role required
- **Description**: Returns payment metrics, revenue data, and top-performing packages

#### Query Parameters
- `period` (string): Analytics period - "7d", "30d", "90d", "1y" (default: "30d")
- `package_type` (string): Filter by package type (optional)

#### Request Example
```
GET /v1/admin/analytics/payments?period=30d&package_type=monthly_subscription
```

#### Response Body
```json
{
  "success": true,
  "period": "30d",
  "analytics": {
    "total_revenue": 15247.50,
    "total_transactions": 543,
    "successful_transactions": 487,
    "refunded_transactions": 12,
    "coins_granted": 125400,
    "conversion_rate": 89.7,
    "top_packages": [
      {
        "package_name": "Pro Monthly",
        "purchases": 156,
        "revenue": 4678.44
      },
      {
        "package_name": "Starter Pack",
        "purchases": 203,
        "revenue": 2029.97
      },
      {
        "package_name": "Annual Pro",
        "purchases": 45,
        "revenue": 8099.55
      }
    ]
  }
}
```

#### Frontend Implementation
```javascript
async function getPaymentAnalytics(period = '30d', packageType = null) {
  try {
    const queryParams = new URLSearchParams({ period });
    if (packageType) queryParams.set('package_type', packageType);
    
    const url = `${API_BASE_URL}/v1/admin/analytics/payments?${queryParams.toString()}`;
    const response = await fetch(url, { headers });
    
    const result = await response.json();
    
    if (result.success) {
      return result.analytics;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Failed to get payment analytics:', error);
    throw error;
  }
}

// Usage for dashboard charts
async function loadDashboardData() {
  try {
    const [weeklyData, monthlyData, yearlyData] = await Promise.all([
      getPaymentAnalytics('7d'),
      getPaymentAnalytics('30d'),
      getPaymentAnalytics('1y')
    ]);
    
    updateRevenueChart(weeklyData, monthlyData, yearlyData);
    updateTopPackagesTable(monthlyData.top_packages);
    updateKPICards(monthlyData);
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
  }
}
```

---

## Error Handling

### Common Error Types

1. **Authentication Errors (401)**
```json
{
  "success": false,
  "error": "unauthorized",
  "message": "Owner role required"
}
```

2. **Validation Errors (400)**
```json
{
  "success": false,
  "error": "validation_error",
  "message": "Package name already exists"
}
```

3. **Not Found Errors (404)**
```json
{
  "success": false,
  "error": "not_found",
  "message": "Package not found: pkg-invalid-uuid"
}
```

4. **Server Errors (500)**
```json
{
  "success": false,
  "error": "internal_error",
  "message": "Failed to create package"
}
```

### Frontend Error Handler
```javascript
function handleApiError(error, operation) {
  console.error(`${operation} failed:`, error);
  
  if (error.message.includes('unauthorized')) {
    // Redirect to login or refresh token
    redirectToLogin();
  } else if (error.message.includes('validation_error')) {
    // Show validation error to user
    showValidationError(error.message);
  } else if (error.message.includes('not_found')) {
    // Handle missing resource
    showNotFoundError();
  } else {
    // Generic error handling
    showGenericError('An unexpected error occurred. Please try again.');
  }
}
```

## Complete Frontend Integration Example

```javascript
class AdminPackagesAPI {
  constructor(baseUrl, authToken) {
    this.baseUrl = baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    };
  }
  
  async createPackage(packageData) {
    return this.makeRequest('POST', '/v1/admin/packages', packageData);
  }
  
  async listPackages(filters = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.set(key, value.toString());
      }
    });
    
    const url = `/v1/admin/packages?${queryParams.toString()}`;
    return this.makeRequest('GET', url);
  }
  
  async getPackage(packageId) {
    return this.makeRequest('GET', `/v1/admin/packages/${packageId}`);
  }
  
  async updatePackage(packageId, updates) {
    return this.makeRequest('PUT', `/v1/admin/packages/${packageId}`, updates);
  }
  
  async deletePackage(packageId) {
    return this.makeRequest('DELETE', `/v1/admin/packages/${packageId}`);
  }
  
  async retryPaddleSync(packageId) {
    return this.makeRequest('POST', `/v1/admin/packages/${packageId}/sync`);
  }
  
  async getPaymentAnalytics(period = '30d', packageType = null) {
    const queryParams = new URLSearchParams({ period });
    if (packageType) queryParams.set('package_type', packageType);
    
    const url = `/v1/admin/analytics/payments?${queryParams.toString()}`;
    return this.makeRequest('GET', url);
  }
  
  async makeRequest(method, endpoint, body = null) {
    try {
      const config = {
        method,
        headers: this.headers
      };
      
      if (body) {
        config.body = JSON.stringify(body);
      }
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      const result = await response.json();
      
      if (result.success) {
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error(`API request failed: ${method} ${endpoint}`, error);
      throw error;
    }
  }
}

// Usage
const adminAPI = new AdminPackagesAPI('http://localhost:5000', userToken);

// Create a new package
const newPackage = await adminAPI.createPackage({
  name: "Premium Pack",
  description: "Ultimate learning package",
  package_type: "yearly_subscription",
  coin_amount: 5000,
  price_usd: 199.99
});

// Get analytics for dashboard
const analytics = await adminAPI.getPaymentAnalytics('30d');
```

## Security Considerations

1. **Authentication**: All endpoints require Owner-level authentication
2. **Input Validation**: Frontend should validate data before sending to API
3. **Rate Limiting**: Implement proper error handling for rate limits
4. **Sensitive Data**: Never log or expose authentication tokens
5. **HTTPS**: Always use HTTPS in production
6. **Token Refresh**: Implement token refresh mechanism for expired JWTs

## Testing

Use the provided Postman collection for testing:
- Import `locals/postman-collections/admin-operations.json`
- Set environment variables for `base_url` and `jwt_token`
- Test all endpoints with various scenarios (success, validation errors, edge cases)

This implementation guide provides everything needed to build a comprehensive admin package management interface for the Lab Dojo platform.