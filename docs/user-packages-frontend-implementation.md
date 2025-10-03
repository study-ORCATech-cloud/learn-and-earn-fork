# User Packages Frontend Implementation Guide

This document provides comprehensive implementation guidance for integrating with the User Packages API endpoints. These endpoints enable users to browse available coin packages, initiate purchases, and manage their purchase history.

## Base Configuration

```javascript
const API_BASE_URL = 'http://localhost:5000'; // Development
// const API_BASE_URL = 'https://your-production-domain.com'; // Production

const headers = {
  'Content-Type': 'application/json'
};

// For authenticated endpoints
const authenticatedHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${userJwtToken}` // User JWT token required
};
```

## API Endpoints

### 1. List Available Packages (Public)

**Displays available coin packages for purchase - no authentication required.**

- **URL**: `GET /api/v1/packages`
- **Authentication**: None required (public endpoint)
- **Description**: Returns all active packages with user-friendly information and features

#### Query Parameters
- `type` (string): Filter by package type - "one_time", "monthly_subscription", "yearly_subscription"

#### Request Example
```
GET /api/v1/packages?type=one_time
```

#### Response Body
```json
{
  "success": true,
  "packages": [
    {
      "id": "pkg-uuid-1",
      "name": "Starter Pack",
      "description": "Perfect for new learners getting started with Lab Dojo",
      "package_type": "one_time",
      "coin_amount": 100,
      "price_usd": 9.99,
      "features": [
        "100 Dojo Coins",
        "One-time purchase",
        "No expiration",
        "Instant coin delivery",
        "Access to premium labs"
      ]
    },
    {
      "id": "pkg-uuid-2",
      "name": "Pro Monthly",
      "description": "Monthly subscription for regular learners",
      "package_type": "monthly_subscription", 
      "coin_amount": 500,
      "price_usd": 29.99,
      "features": [
        "500 Dojo Coins",
        "Monthly coin delivery",
        "Automatic renewal",
        "Cancel anytime",
        "Best for regular users",
        "Access to premium labs"
      ]
    },
    {
      "id": "pkg-uuid-3",
      "name": "Annual Pro",
      "description": "Best value yearly subscription",
      "package_type": "yearly_subscription",
      "coin_amount": 6000,
      "price_usd": 299.99,
      "features": [
        "6000 Dojo Coins",
        "Annual coin delivery", 
        "Best value option",
        "Automatic renewal",
        "Cancel anytime",
        "Access to premium labs"
      ]
    }
  ]
}
```

#### Error Response
```json
{
  "success": false,
  "error": "validation_error",
  "message": "Invalid package type"
}
```

#### Frontend Implementation
```javascript
async function listPackages(packageType = null) {
  try {
    let url = `${API_BASE_URL}/api/v1/packages`;
    
    if (packageType) {
      url += `?type=${encodeURIComponent(packageType)}`;
    }
    
    const response = await fetch(url, { headers });
    const result = await response.json();
    
    if (result.success) {
      return result.packages;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Failed to list packages:', error);
    throw error;
  }
}

// Usage examples
const allPackages = await listPackages();
const oneTimePackages = await listPackages('one_time');
const subscriptionPackages = await listPackages('monthly_subscription');

// Display packages in UI
function renderPackageCards(packages) {
  const container = document.getElementById('packages-container');
  
  packages.forEach(pkg => {
    const card = document.createElement('div');
    card.className = 'package-card';
    card.innerHTML = `
      <div class="package-header">
        <h3>${pkg.name}</h3>
        <div class="price">$${pkg.price_usd}</div>
      </div>
      <p class="description">${pkg.description}</p>
      <ul class="features">
        ${pkg.features.map(feature => `<li>${feature}</li>`).join('')}
      </ul>
      <button onclick="purchasePackage('${pkg.name}')" class="purchase-btn">
        Buy Now
      </button>
    `;
    container.appendChild(card);
  });
}
```

---

### 2. Initiate Purchase

**Starts the purchase process and returns Paddle checkout URL.**

- **URL**: `POST /api/v1/purchase/initiate`
- **Authentication**: JWT required
- **Description**: Creates purchase transaction and returns secure checkout URL
- **Features**: Includes duplicate prevention to avoid multiple transactions

#### Request Body
```json
{
  "package_name": "Starter Pack" // Required: Exact name of the package
}
```

#### Response Body
```json
{
  "success": true,
  "checkout": {
    "paddle_checkout_url": "https://checkout.paddle.com/checkout?checkout=abc123",
    "paddle_transaction_id": "paddle-txn-123",
    "transaction_id": "local-txn-uuid",
    "expires_at": "2025-01-29T17:30:00Z"
  },
  "package": {
    "name": "Starter Pack",
    "coin_amount": 100,
    "price_usd": 9.99
  },
  "redirect_urls": {
    "success": "http://localhost:8080/purchase/success?transaction_id=paddle-txn-123",
    "cancel": "http://localhost:8080/purchase/cancel?transaction_id=paddle-txn-123"
  }
}
```

#### Error Responses
```json
// Package not found
{
  "success": false,
  "error": "package_not_found",
  "message": "Package not found or inactive"
}

// Missing package name
{
  "success": false,
  "error": "validation_error",
  "message": "package_name is required"
}

// Payment service issues
{
  "success": false,
  "error": "payment_service_unavailable",
  "message": "Payment service temporarily unavailable. Please try again later."
}

// Authentication required
{
  "success": false,
  "error": "unauthorized",
  "message": "Authentication required"
}
```

#### Frontend Implementation
```javascript
async function initiatePurchase(packageName) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/purchase/initiate`, {
      method: 'POST',
      headers: authenticatedHeaders,
      body: JSON.stringify({
        package_name: packageName
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Redirect to Paddle checkout
      window.location.href = result.checkout.paddle_checkout_url;
      return result;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Failed to initiate purchase:', error);
    throw error;
  }
}

// Enhanced purchase flow with user feedback
async function purchasePackage(packageName) {
  try {
    // Check if user is authenticated
    if (!userJwtToken) {
      showLoginPrompt();
      return;
    }
    
    // Show loading state
    showLoading('Preparing your purchase...');
    
    // Initiate purchase
    const purchaseData = await initiatePurchase(packageName);
    
    // Store transaction info for later reference
    localStorage.setItem('pendingPurchase', JSON.stringify({
      transactionId: purchaseData.checkout.transaction_id,
      packageName: purchaseData.package.name,
      amount: purchaseData.package.price_usd,
      coinAmount: purchaseData.package.coin_amount,
      timestamp: new Date().toISOString()
    }));
    
    // User will be redirected to Paddle checkout
    // The page will reload after payment completion
    
  } catch (error) {
    hideLoading();
    
    if (error.message.includes('package_not_found')) {
      showError('This package is no longer available. Please refresh the page.');
    } else if (error.message.includes('payment_service_unavailable')) {
      showError('Payment system is temporarily unavailable. Please try again in a few minutes.');
    } else {
      showError('Failed to start purchase. Please try again.');
    }
  }
}

// Handle return from Paddle checkout
function handlePurchaseReturn() {
  const urlParams = new URLSearchParams(window.location.search);
  const transactionId = urlParams.get('transaction_id');
  
  if (transactionId) {
    // Check transaction status
    checkPurchaseStatus(transactionId);
  }
}
```

---

### 3. Get Purchase History

**Retrieves user's purchase transaction history with pagination.**

- **URL**: `GET /api/v1/purchase/history`
- **Authentication**: JWT required
- **Description**: Returns paginated list of user's transactions including refunds

#### Query Parameters
- `limit` (integer): Results per page (default: 20, max: 100)
- `offset` (integer): Pagination offset (default: 0)

#### Request Example
```
GET /api/v1/purchase/history?limit=10&offset=0
```

#### Response Body
```json
{
  "success": true,
  "transactions": [
    {
      "id": "txn-uuid-1",
      "package": {
        "name": "Starter Pack",
        "package_type": "one_time"
      },
      "status": "completed",
      "amount_usd": 9.99,
      "coins_granted": 100,
      "created_at": "2025-01-29T15:30:00Z",
      "completed_at": "2025-01-29T15:31:30Z"
    },
    {
      "id": "txn-uuid-2", 
      "package": {
        "name": "Pro Monthly",
        "package_type": "monthly_subscription"
      },
      "status": "pending",
      "amount_usd": 29.99,
      "coins_granted": 0,
      "created_at": "2025-01-29T16:00:00Z",
      "completed_at": null
    },
    {
      "id": "txn-uuid-3",
      "package": {
        "name": "Annual Pro",
        "package_type": "yearly_subscription"
      },
      "status": "refunded",
      "amount_usd": 299.99,
      "coins_granted": 0,
      "coins_deducted": 6000,
      "created_at": "2025-01-28T10:00:00Z",
      "completed_at": "2025-01-28T10:02:00Z",
      "refunded_at": "2025-01-29T14:00:00Z"
    }
  ],
  "pagination": {
    "total": 15,
    "limit": 10,
    "offset": 0,
    "has_next": true,
    "has_prev": false
  }
}
```

#### Frontend Implementation
```javascript
async function getPurchaseHistory(limit = 20, offset = 0) {
  try {
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    });
    
    const response = await fetch(
      `${API_BASE_URL}/api/v1/purchase/history?${queryParams.toString()}`,
      { headers: authenticatedHeaders }
    );
    
    const result = await response.json();
    
    if (result.success) {
      return {
        transactions: result.transactions,
        pagination: result.pagination
      };
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Failed to get purchase history:', error);
    throw error;
  }
}

// Render purchase history table
async function renderPurchaseHistory() {
  try {
    const { transactions, pagination } = await getPurchaseHistory();
    
    const container = document.getElementById('purchase-history');
    
    const table = document.createElement('table');
    table.className = 'purchase-history-table';
    table.innerHTML = `
      <thead>
        <tr>
          <th>Package</th>
          <th>Status</th>
          <th>Amount</th>
          <th>Coins</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        ${transactions.map(txn => `
          <tr class="transaction-row ${txn.status}">
            <td>
              <div class="package-info">
                <div class="package-name">${txn.package.name}</div>
                <div class="package-type">${formatPackageType(txn.package.package_type)}</div>
              </div>
            </td>
            <td>
              <span class="status-badge ${txn.status}">${formatStatus(txn.status)}</span>
            </td>
            <td>$${txn.amount_usd}</td>
            <td>
              ${txn.status === 'refunded' 
                ? `<span class="refunded">-${txn.coins_deducted}</span>`
                : txn.coins_granted || 'Pending'
              }
            </td>
            <td>${formatDate(txn.created_at)}</td>
          </tr>
        `).join('')}
      </tbody>
    `;
    
    container.appendChild(table);
    
    // Add pagination if needed
    if (pagination.total > pagination.limit) {
      renderPagination(pagination);
    }
    
  } catch (error) {
    showError('Failed to load purchase history');
  }
}

// Utility functions
function formatPackageType(type) {
  const types = {
    'one_time': 'One-time',
    'monthly_subscription': 'Monthly',
    'yearly_subscription': 'Yearly'
  };
  return types[type] || type;
}

function formatStatus(status) {
  const statuses = {
    'pending': 'Processing',
    'completed': 'Completed',
    'failed': 'Failed',
    'refunded': 'Refunded'
  };
  return statuses[status] || status;
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
```

---

### 4. Check Purchase Status

**Checks the status of a specific transaction.**

- **URL**: `GET /api/v1/purchase/status/{transaction_id}`
- **Authentication**: JWT required (users can only view their own transactions)
- **Description**: Returns detailed status information for a specific purchase

#### Path Parameters
- `transaction_id` (string): UUID of the transaction

#### Request Example
```
GET /api/v1/purchase/status/txn-uuid-here
```

#### Response Body
```json
{
  "success": true,
  "transaction": {
    "id": "txn-uuid-here",
    "status": "completed",
    "package": {
      "name": "Starter Pack",
      "coin_amount": 100,
      "package_type": "one_time"
    },
    "amount_usd": 9.99,
    "coins_granted": 100,
    "created_at": "2025-01-29T15:30:00Z",
    "completed_at": "2025-01-29T15:31:30Z",
    "message": "Payment completed successfully. 100 coins added to your wallet."
  }
}
```

#### Status-Specific Responses
```json
// Pending transaction
{
  "success": true,
  "transaction": {
    "id": "txn-uuid-here",
    "status": "pending",
    "message": "Payment is being processed",
    // ... other fields
  }
}

// Failed transaction
{
  "success": true,
  "transaction": {
    "id": "txn-uuid-here", 
    "status": "failed",
    "message": "Payment failed. Please try again or contact support.",
    // ... other fields
  }
}

// Refunded transaction
{
  "success": true,
  "transaction": {
    "id": "txn-uuid-here",
    "status": "refunded",
    "message": "Payment was refunded",
    "coins_deducted": 100,
    // ... other fields
  }
}
```

#### Error Response
```json
{
  "success": false,
  "error": "transaction_not_found",
  "message": "Transaction not found"
}
```

#### Frontend Implementation
```javascript
async function checkPurchaseStatus(transactionId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/purchase/status/${transactionId}`,
      { headers: authenticatedHeaders }
    );
    
    const result = await response.json();
    
    if (result.success) {
      return result.transaction;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Failed to check purchase status:', error);
    throw error;
  }
}

// Polling for transaction completion
async function pollTransactionStatus(transactionId, maxAttempts = 10) {
  let attempts = 0;
  
  const poll = async () => {
    try {
      attempts++;
      const transaction = await checkPurchaseStatus(transactionId);
      
      if (transaction.status === 'completed') {
        showSuccess(transaction.message);
        // Update wallet balance in UI
        updateWalletBalance();
        return transaction;
      } else if (transaction.status === 'failed') {
        showError(transaction.message);
        return transaction;
      } else if (transaction.status === 'pending' && attempts < maxAttempts) {
        // Continue polling
        setTimeout(poll, 3000); // Poll every 3 seconds
      } else {
        showWarning('Payment is taking longer than expected. Please check your purchase history.');
      }
    } catch (error) {
      console.error('Error polling transaction status:', error);
    }
  };
  
  poll();
}

// Handle post-purchase flow
function handlePostPurchase() {
  const urlParams = new URLSearchParams(window.location.search);
  const transactionId = urlParams.get('transaction_id');
  
  if (transactionId) {
    showLoading('Confirming your purchase...');
    pollTransactionStatus(transactionId);
    
    // Clear pending purchase from localStorage
    localStorage.removeItem('pendingPurchase');
  }
}

// Auto-check pending purchase on page load
function checkPendingPurchase() {
  const pendingPurchase = localStorage.getItem('pendingPurchase');
  
  if (pendingPurchase) {
    const purchase = JSON.parse(pendingPurchase);
    const purchaseTime = new Date(purchase.timestamp);
    const now = new Date();
    
    // Check if purchase was initiated within last hour
    if (now - purchaseTime < 60 * 60 * 1000) {
      pollTransactionStatus(purchase.transactionId);
    } else {
      // Clear old pending purchase
      localStorage.removeItem('pendingPurchase');
    }
  }
}
```

---

## Complete Integration Example

```javascript
class UserPackagesAPI {
  constructor(baseUrl, authToken = null) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
  }
  
  get headers() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    return headers;
  }
  
  // Public endpoint - no auth required
  async listPackages(packageType = null) {
    let url = `${this.baseUrl}/api/v1/packages`;
    if (packageType) {
      url += `?type=${encodeURIComponent(packageType)}`;
    }
    
    return this.makeRequest('GET', url, null, false);
  }
  
  // Authenticated endpoints
  async initiatePurchase(packageName) {
    return this.makeRequest('POST', '/api/v1/purchase/initiate', {
      package_name: packageName
    });
  }
  
  async getPurchaseHistory(limit = 20, offset = 0) {
    const params = new URLSearchParams({ limit, offset });
    return this.makeRequest('GET', `/api/v1/purchase/history?${params}`);
  }
  
  async checkPurchaseStatus(transactionId) {
    return this.makeRequest('GET', `/api/v1/purchase/status/${transactionId}`);
  }
  
  async makeRequest(method, endpoint, body = null, requireAuth = true) {
    try {
      if (requireAuth && !this.authToken) {
        throw new Error('Authentication required');
      }
      
      const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
      
      const config = {
        method,
        headers: this.headers
      };
      
      if (body) {
        config.body = JSON.stringify(body);
      }
      
      const response = await fetch(url, config);
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
  
  setAuthToken(token) {
    this.authToken = token;
  }
}

// Usage example
const packagesAPI = new UserPackagesAPI('http://localhost:5000');

// Load packages on page load (no auth required)
async function loadPackageStore() {
  try {
    const packages = await packagesAPI.listPackages();
    renderPackageCards(packages);
  } catch (error) {
    showError('Failed to load packages');
  }
}

// After user logs in
function handleUserLogin(authToken) {
  packagesAPI.setAuthToken(authToken);
  
  // Now can access purchase history
  loadPurchaseHistory();
  checkPendingPurchase();
}

// Purchase flow
async function handlePackagePurchase(packageName) {
  try {
    if (!packagesAPI.authToken) {
      showLoginModal();
      return;
    }
    
    const purchaseData = await packagesAPI.initiatePurchase(packageName);
    
    // Store transaction info and redirect to checkout
    localStorage.setItem('pendingPurchase', JSON.stringify({
      transactionId: purchaseData.checkout.transaction_id,
      packageName: purchaseData.package.name
    }));
    
    window.location.href = purchaseData.checkout.paddle_checkout_url;
    
  } catch (error) {
    handlePurchaseError(error);
  }
}
```

## Error Handling Best Practices

```javascript
function handlePurchaseError(error) {
  console.error('Purchase error:', error);
  
  if (error.message.includes('Authentication required')) {
    showLoginModal();
  } else if (error.message.includes('package_not_found')) {
    showError('This package is no longer available');
    // Refresh package list
    loadPackageStore();
  } else if (error.message.includes('payment_service_unavailable')) {
    showError('Payment system temporarily unavailable. Please try again shortly.');
  } else if (error.message.includes('validation_error')) {
    showError('Invalid request. Please refresh the page and try again.');
  } else {
    showError('Purchase failed. Please try again or contact support.');
  }
}

// Retry mechanism for failed requests
async function withRetry(apiCall, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Don't retry authentication or validation errors
      if (error.message.includes('Authentication') || 
          error.message.includes('validation_error')) {
        throw error;
      }
      
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
}
```

## Security Considerations

1. **JWT Storage**: Store authentication tokens securely (httpOnly cookies preferred)
2. **HTTPS**: Always use HTTPS in production for payment operations
3. **Input Validation**: Validate package names and parameters before API calls
4. **Rate Limiting**: Implement client-side rate limiting for API requests
5. **Error Handling**: Don't expose sensitive error details to users
6. **Transaction Security**: Never store payment details on client side

## Testing

Use the provided Postman collection for testing:
- Import `locals/postman-collections/packages-transactions.json`
- Set environment variables for `base_url` and `jwt_token`
- Test the complete purchase flow from package listing to status checking

This implementation guide provides everything needed to build a complete package purchasing interface for end users of the Lab Dojo platform.