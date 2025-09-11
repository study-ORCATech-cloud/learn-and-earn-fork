# Backend Management API Documentation

## Overview

This document outlines all the management, user, and role-related API endpoints available in the Learn & Earn backend. These endpoints enable comprehensive user and role management, audit trail access, and system administration.

## Base URL
```
https://your-api-domain.com
```

## Authentication

All endpoints require JWT authentication unless otherwise specified. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Role-Based Access Control

The system enforces strict role hierarchy:

- **Owner**: Can manage admin, moderator, user roles (owner role only set at deployment)
- **Admin**: Can manage moderator, user roles only  
- **Moderator**: Can manage user role only, view users
- **User**: Can only manage own profile

## Common Response Format

All endpoints return responses in this format:

```json
{
  "success": true|false,
  "data": {...},           // Present on success
  "error": "error_type",   // Present on failure
  "message": "...",        // Human-readable message
  "field": "field_name"    // Present for validation errors
}
```

---

## User Management Endpoints

### 1. List Users
**GET** `/api/v1/users`

List all users with filtering and pagination.

**Required Role:** `admin`, `moderator`

**Query Parameters:**
- `page` (int, optional): Page number (default: 1)
- `limit` (int, optional): Items per page (default: 50, max: 100)
- `role` (string, optional): Filter by role (`user`, `moderator`, `admin`, `owner`)
- `search` (string, optional): Search by name or email (min 2 chars)
- `provider` (string, optional): Filter by OAuth provider (`google`, `github`)
- `is_active` (boolean, optional): Filter by active status

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user-uuid",
        "email": "user@example.com",
        "name": "John Doe",
        "role": "user",
        "avatar_url": "https://...",
        "is_active": true,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
        "last_login": "2024-01-01T00:00:00Z",
        "provider_count": 2,           // For admins only
        "last_login_ago": "2 days ago" // For admins only
      }
    ],
    "pagination": {
      "page": 1,
      "pages": 5,
      "per_page": 50,
      "total": 250,
      "has_next": true,
      "has_prev": false
    },
    "filters_applied": {
      "role": "user",
      "search": "john"
    }
  }
}
```

### 2. Get User Details
**GET** `/api/v1/users/{user_id}`

Get detailed information about a specific user.

**Required Role:** `admin`, `moderator` (for any user), or own profile

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "avatar_url": "https://...",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "last_login": "2024-01-01T00:00:00Z",
    "providers": [
      {
        "id": "provider-uuid",
        "provider": "google",
        "provider_email": "user@gmail.com",
        "is_primary": true,
        "linked_at": "2024-01-01T00:00:00Z",
        "last_used": "2024-01-01T00:00:00Z"
      }
    ],
    "recent_activity": [  // For admins only
      {
        "action": "UPDATE",
        "timestamp": "2024-01-01T00:00:00Z",
        "performed_by": "admin@example.com"
      }
    ]
  }
}
```

### 3. Create User
**POST** `/api/v1/users`

Create a new user (admin override).

**Required Role:** `admin`

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "name": "New User",
  "role": "user",                    // Optional, defaults to "user"
  "avatar_url": "https://..."        // Optional
}
```

**Note:** Owner role cannot be assigned via API.

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "User created successfully",
    "user": {
      "id": "new-user-uuid",
      "email": "newuser@example.com",
      "name": "New User",
      "role": "user"
    },
    "created_by": "admin@example.com"
  }
}
```

### 4. Update User
**PUT** `/api/v1/users/{user_id}`

Update user information. Email cannot be updated (SSO only).

**Required Role:** `admin`, `moderator` (for users), or own profile

**Request Body:**
```json
{
  "name": "Updated Name",
  "avatar_url": "https://new-avatar.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "User updated successfully. Changed: name, avatar_url",
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "name": "Updated Name",
      "avatar_url": "https://new-avatar.jpg"
    },
    "updated_fields": ["name", "avatar_url"],
    "updated_by": "admin@example.com"
  }
}
```

### 5. Deactivate User
**DELETE** `/api/v1/users/{user_id}`

Soft delete user (set is_active=false).

**Required Role:** `admin`

**Request Body (Optional):**
```json
{
  "reason": "Reason for deactivation"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "User deactivated successfully",
    "user": {
      "id": "user-uuid",
      "is_active": false
    },
    "deactivated_by": "admin@example.com",
    "reason": "Policy violation"
  }
}
```

### 6. Activate User
**POST** `/api/v1/users/{user_id}/activate`

Reactivate a soft-deleted user.

**Required Role:** `admin`

**Request Body (Optional):**
```json
{
  "reason": "Reason for activation"
}
```

### 7. Search Users
**GET** `/api/v1/users/search`

Search users by name or email.

**Required Role:** `admin`, `moderator`

**Query Parameters:**
- `q` (string, required): Search query (minimum 2 characters)

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "john",
    "results": [
      {
        "id": "user-uuid",
        "email": "john@example.com",
        "name": "John Doe",
        "role": "user",
        "avatar_url": "https://..."
      }
    ],
    "count": 1
  }
}
```

### 8. Bulk Operations
**POST** `/api/v1/users/bulk-operations`

Perform bulk operations on multiple users.

**Required Role:** `admin`

**Request Body:**
```json
{
  "operation": "ACTIVATE|DEACTIVATE|ROLE_CHANGE|DELETE",
  "user_ids": ["user1", "user2", "user3"],
  "role": "moderator",          // Required for ROLE_CHANGE
  "reason": "Bulk operation reason"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "operation": "ACTIVATE",
    "total_users": 3,
    "successful": [
      {"user_id": "user1", "result": {"success": true}},
      {"user_id": "user2", "result": {"success": true}}
    ],
    "failed": [
      {"user_id": "user3", "error": "User not found"}
    ],
    "summary": {
      "successful_count": 2,
      "failed_count": 1,
      "success_rate": 66.7
    }
  }
}
```

### 9. User Providers
**GET** `/api/v1/users/{user_id}/providers`

List user's linked OAuth providers.

**Required Role:** `admin`, `moderator` (for any user), or own profile

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "user-uuid",
    "email": "user@example.com",
    "providers": [
      {
        "id": "provider-uuid",
        "provider": "google",
        "provider_email": "user@gmail.com",
        "provider_name": "John Doe",
        "is_primary": true,
        "linked_at": "2024-01-01T00:00:00Z",
        "last_used": "2024-01-01T00:00:00Z",
        "avatar_url": "https://..."
      }
    ],
    "provider_count": 1
  }
}
```

### 10. User Audit Trail
**GET** `/api/v1/users/{user_id}/audit`

Get user activity audit log.

**Required Role:** `admin`

**Query Parameters:**
- `page` (int, optional): Page number (default: 1)
- `limit` (int, optional): Items per page (default: 50, max: 100)
- `action` (string, optional): Filter by action type
- `start_date` (string, optional): Start date filter (ISO format)
- `end_date` (string, optional): End date filter (ISO format)

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "user-uuid",
    "audit_logs": [
      {
        "id": "log-uuid",
        "action": "ROLE_CHANGE",
        "resource_type": "user",
        "old_values": {"role": "user"},
        "new_values": {"role": "moderator"},
        "reason": "Promotion",
        "performed_by": "admin@example.com",
        "ip_address": "192.168.1.1",
        "user_agent": "Mozilla/5.0...",
        "timestamp": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pages": 3,
      "per_page": 50,
      "total": 150,
      "has_next": true,
      "has_prev": false
    },
    "filters": {
      "action": null,
      "start_date": null,
      "end_date": null
    }
  }
}
```

---

## Role Management Endpoints

### 1. Get Role Hierarchy
**GET** `/api/v1/roles`

Get all available roles with hierarchy and permissions.

**Required Role:** `admin`, `moderator`

**Response:**
```json
{
  "success": true,
  "data": {
    "roles": [
      {
        "name": "owner",
        "level": 99999,
        "permissions": [
          "view_all_users",
          "create_users", 
          "edit_all_users",
          "delete_users",
          "change_all_roles",
          "view_audit_logs",
          "manage_system",
          "bulk_operations"
        ]
      },
      {
        "name": "admin", 
        "level": 9000,
        "permissions": [
          "view_all_users",
          "create_users",
          "edit_all_users", 
          "delete_users",
          "change_admin_and_below_roles",
          "view_audit_logs",
          "bulk_operations"
        ]
      },
      {
        "name": "moderator",
        "level": 5000,
        "permissions": [
          "view_all_users",
          "edit_user_role_only",
          "change_user_role_only"
        ]
      },
      {
        "name": "user",
        "level": 100,
        "permissions": [
          "view_own_profile",
          "edit_own_profile"
        ]
      }
    ],
    "levels": {
      "owner": 99999,
      "admin": 9000,
      "moderator": 5000,
      "user": 100
    },
    "permissions": {
      "owner": [...],
      "admin": [...],
      "moderator": [...],
      "user": [...]
    }
  }
}
```

### 2. Change User Role
**PUT** `/api/v1/roles/users/{user_id}/role`

Change a user's role with authorization validation.

**Required Role:** `admin`, `moderator` (limited scope)

**Request Body:**
```json
{
  "role": "moderator",
  "reason": "Promotion due to excellent performance"
}
```

**Note:** Owner role cannot be assigned via API.

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Role changed from user to moderator",
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "role": "moderator"
    },
    "old_role": "user",
    "new_role": "moderator",
    "changed_by": "admin@example.com",
    "reason": "Promotion due to excellent performance"
  }
}
```

### 3. Get User Permissions
**GET** `/api/v1/roles/users/{user_id}/permissions`

Get user's effective permissions based on their role.

**Required Role:** `admin`, `moderator` (for any user), or own profile

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "user-uuid",
    "email": "user@example.com",
    "role": "admin",
    "role_level": 9000,
    "permissions": [
      "view_all_users",
      "create_users",
      "edit_all_users",
      "delete_users",
      "change_admin_and_below_roles",
      "view_audit_logs",
      "bulk_operations"
    ],
    "can_manage_roles": ["moderator", "user"],
    "effective_permissions": {
      "can_view_all_users": true,
      "can_create_users": true,
      "can_edit_all_users": true,
      "can_delete_users": true,
      "can_change_roles": true,
      "can_view_audit_logs": true,
      "can_bulk_operations": true,
      "can_manage_system": false
    }
  }
}
```

### 4. Get Manageable Roles
**GET** `/api/v1/roles/manageable`

Get list of roles that current user can assign to others.

**Required Role:** `admin`, `moderator`

**Response:**
```json
{
  "success": true,
  "data": {
    "current_user_role": "admin",
    "manageable_roles": ["moderator", "user"],
    "detailed_roles": [
      {
        "name": "moderator",
        "level": 5000,
        "permissions": [...]
      },
      {
        "name": "user", 
        "level": 100,
        "permissions": [...]
      }
    ]
  }
}
```

### 5. Validate Role Permission
**POST** `/api/v1/roles/validate`

Validate role hierarchy and permissions (for frontend authorization checks).

**Required Role:** `admin`

**Request Body:**
```json
{
  "user_role": "admin",
  "required_role": "moderator",
  "operation": "edit_users"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user_role": "admin",
    "required_role": "moderator",
    "operation": "edit_users",
    "has_permission": true,
    "validation_details": {
      "user_role_level": 9000,
      "required_role_level": 5000
    }
  }
}
```

---

## System Management Endpoints

### 1. Health Check
**GET** `/v1/management/health`

System health check for monitoring.

**Required Role:** `admin`, `moderator`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "service": "learn-and-earn-backend",
  "version": "1.0.0",
  "environment": "production"
}
```

### 2. Cache Statistics
**GET** `/v1/management/cache-stats`

Get cache statistics for monitoring.

**Required Role:** `admin`, `moderator`

**Response:**
```json
{
  "success": true,
  "data": {
    "lab_cache": {
      "hits": 1000,
      "misses": 50,
      "hit_rate": 95.2
    },
    "data_cache": {
      "size": "2.5MB",
      "entries": 150
    },
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

### 3. Clear Data Cache
**POST** `/v1/management/cache/data/clear`

Clear the data cache.

**Required Role:** `admin`

**Response:**
```json
{
  "success": true,
  "message": "Data cache cleared successfully",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 4. Clear Lab Cache
**POST** `/v1/management/cache/lab/clear`

Clear the lab cache.

**Required Role:** `admin`

### 5. Global Logout
**POST** `/v1/admin/global-logout`

Trigger global logout - invalidate all existing JWT tokens.

**Required Role:** `admin`

**Response:**
```json
{
  "success": true,
  "message": "Global logout triggered - all existing tokens invalidated",
  "logout_time": "2024-01-01T00:00:00Z",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 6. Global Logout Status
**GET** `/v1/admin/global-logout/status`

Get current global logout status.

**Required Role:** `admin`, `moderator`

**Response:**
```json
{
  "success": true,
  "global_logout_active": true,
  "global_logout_time": "2024-01-01T00:00:00Z",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 7. Clear Global Logout
**POST** `/v1/admin/clear-global-logout`

Clear global logout and resume normal token validation.

**Required Role:** `admin`

---

## Error Handling

### Common Error Codes

- `400` - Bad Request (validation errors, missing fields)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

### Error Response Format

```json
{
  "success": false,
  "error": "validation_error",
  "message": "Invalid email format: The email address is not valid",
  "field": "email"
}
```

### Specific Error Types

- `token_missing` - JWT token not provided
- `authentication_failed` - Invalid JWT token
- `validation_error` - Input validation failed
- `permission_denied` - Insufficient role permissions
- `user_not_found` - Requested user doesn't exist
- `role_change_failed` - Role change operation failed
- `user_creation_failed` - User creation failed
- `global_logout_failed` - Global logout operation failed

---

## Implementation Notes

### Frontend Implementation Tips

1. **Role-Based UI**: Use the `/api/v1/roles/users/{user_id}/permissions` endpoint to determine what UI elements to show/hide.

2. **Manageable Roles**: Use `/api/v1/roles/manageable` to populate role selection dropdowns.

3. **Real-time Validation**: Use `/api/v1/roles/validate` for client-side permission checking before attempting operations.

4. **Pagination**: Implement proper pagination controls using the pagination metadata returned by list endpoints.

5. **Search**: Implement debounced search with minimum 2 character queries.

6. **Bulk Operations**: Provide clear feedback on bulk operation results, showing both successful and failed operations.

7. **Audit Trail**: Display audit logs with proper formatting and filtering options.

### Security Considerations

1. **Owner Role**: Owner role can only be set at deployment time, never via API.
2. **Email Updates**: Email changes are not allowed via API (SSO only).
3. **Self-Management**: Users cannot deactivate their own accounts.
4. **Global Logout**: Use sparingly as it invalidates all active sessions.
5. **JWT Validation**: All endpoints validate JWT tokens and check global logout status.

### Rate Limiting

Consider implementing rate limiting on:
- Search endpoints
- Bulk operations  
- Role change operations
- Cache clearing operations

This completes the comprehensive API documentation for all management-related endpoints in the Learn & Earn backend system.