# API Changes: Orca to Dojo Rebranding

This document outlines the API changes made during the rebranding from "Orca" to "Dojo" terminology. These changes affect the frontend integration and should be updated accordingly.

## Summary

The changes are focused on **API-level modifications only**. Internal database schema and service layer code remain unchanged to maintain backward compatibility.

## URL Prefix Changes

### Wallet API Routes
- **Old:** `/api/orca/`
- **New:** `/api/wallet/`

All wallet-related endpoints now use the `/api/wallet/` prefix instead of `/api/orca/`.

## API Response Field Changes

### User Wallet Response (`/api/wallet/`)
```json
// OLD Response Fields
{
  "orca_balance": 15,
  "total_orca_earned": 25,
  "total_orca_spent": 10
}

// NEW Response Fields
{
  "coin_balance": 15,
  "total_coins_earned": 25,
  "total_coins_spent": 10
}
```

### User Lab Purchase Response
```json
// OLD Response Fields
{
  "orca_cost": 5
}

// NEW Response Fields
{
  "coin_cost": 5
}
```

### Admin Analytics Response (`/api/wallet/admin/analytics`)
```json
// OLD Response Fields
{
  "economy_overview": {
    "total_orca_in_circulation": 1500
  }
}

// NEW Response Fields
{
  "economy_overview": {
    "total_coins_in_circulation": 1500
  }
}
```

## Complete Endpoint Reference

### Wallet Endpoints
| Method | New Endpoint | Description |
|--------|--------------|-------------|
| GET | `/api/wallet/` | Get wallet details |
| GET | `/api/wallet/balance` | Get balance only |
| GET | `/api/wallet/library` | Get purchased lab library |
| POST | `/api/wallet/purchase/lab` | Purchase lab premium |
| POST | `/api/wallet/lab/access` | Check lab access |

### Admin Wallet Endpoints
| Method | New Endpoint | Description |
|--------|--------------|-------------|
| POST | `/api/wallet/admin/grant` | Grant coins to user |
| GET | `/api/wallet/admin/transactions` | View all transactions |
| GET | `/api/wallet/admin/analytics` | Get wallet analytics |

## Error Message Changes

Error messages now use "Dojo Coins" terminology:
- "Failed to grant Orca Coins" → "Failed to grant Dojo Coins"
- References to "Orca Coins" in success messages → "Dojo Coins"

## Documentation Updates

### API Endpoint Descriptions
- All docstrings updated to reference "Dojo Coins" instead of "Orca Coins"
- Purchase endpoint documentation updated to reflect Dojo Coins pricing

### Postman Collections
All Postman collections have been updated with:
- Correct `/api/wallet/` URL prefixes
- Updated collection names and descriptions
- Brand-neutral terminology throughout

## Implementation Notes

### Backend Changes
1. **Route URL Prefixes**: Updated from `/api/orca` to `/api/wallet`
2. **Response Mapping**: API responses use brand-neutral field names while maintaining database compatibility
3. **Error Messages**: User-facing error messages updated to use "Dojo Coins"
4. **Documentation**: All API docstrings and comments updated

### Database Schema
- **No changes required** - all database tables and columns remain unchanged
- Internal field names like `orca_balance` are preserved for compatibility
- API layer maps these fields to brand-neutral names in responses

### Backward Compatibility
- Database schema remains fully compatible
- Internal service methods unchanged
- Only API contract (URLs and response fields) modified

## Frontend Integration Updates Required

### 1. Update API Base URLs
```javascript
// OLD
const WALLET_API_BASE = '/api/orca';

// NEW
const WALLET_API_BASE = '/api/wallet';
```

### 2. Update Response Field References
```javascript
// OLD
const balance = response.data.orca_balance;
const earned = response.data.total_orca_earned;
const spent = response.data.total_orca_spent;

// NEW
const balance = response.data.coin_balance;
const earned = response.data.total_coins_earned;
const spent = response.data.total_coins_spent;
```

### 3. Update Lab Purchase References
```javascript
// OLD
const cost = labData.orca_cost;

// NEW
const cost = labData.coin_cost;
```

### 4. Update Analytics Field References
```javascript
// OLD
const circulation = analytics.total_orca_in_circulation;

// NEW
const circulation = analytics.total_coins_in_circulation;
```

## Testing

All Postman collections have been updated and verified:
- `wallet-management.json`
- `complete-api-collection.json`
- `testing-scenarios.json`
- `contact-us.json`

Collections are ready for frontend testing with the new API endpoints.

## Migration Checklist

- [ ] Update frontend API base URLs
- [ ] Update response field mappings
- [ ] Update error handling for new field names
- [ ] Test all wallet-related functionality
- [ ] Update any hardcoded references to "orca" in frontend
- [ ] Test admin analytics dashboard
- [ ] Verify lab purchase flows work correctly