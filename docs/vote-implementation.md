# Roadmap Voting API Implementation Guide

This document provides comprehensive guidance for frontend developers to implement the roadmap voting functionality.

## 🔐 Authentication Requirements

All voting endpoints (except `/top-voted`) require JWT authentication via:
- **Authorization Header**: `Authorization: Bearer <jwt_token>`
- **Cookie**: `auth_token=<jwt_token>`

The JWT token is obtained through the existing OAuth authentication flow (Google/GitHub).

## 📡 API Endpoints

### 1. Cast Vote
Cast a vote for a roadmap item.

**Endpoint**: `POST /api/v1/roadmap/{item_id}/vote`

**Authentication**: Required (JWT)

**Parameters**:
- `item_id` (path): The roadmap item ID (e.g., "feature-ai-assistant")

**Request Body**: None

**Example Request**:
```javascript
fetch('/api/v1/roadmap/feature-ai-assistant/vote', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${jwtToken}`,
    'Content-Type': 'application/json'
  }
})
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Vote cast successfully",
  "new_count": 15,
  "item_id": "feature-ai-assistant"
}
```

**Error Responses**:
- **401**: Authentication required
- **404**: Roadmap item not found  
- **409**: User already voted for this item

---

### 2. Remove Vote
Remove a user's vote from a roadmap item.

**Endpoint**: `DELETE /api/v1/roadmap/{item_id}/vote`

**Authentication**: Required (JWT)

**Parameters**:
- `item_id` (path): The roadmap item ID

**Request Body**: None

**Example Request**:
```javascript
fetch('/api/v1/roadmap/feature-ai-assistant/vote', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${jwtToken}`
  }
})
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Vote removed successfully", 
  "new_count": 14,
  "item_id": "feature-ai-assistant"
}
```

**Error Responses**:
- **401**: Authentication required
- **404**: User has not voted for this item

---

### 3. Get User's Votes
Retrieve all roadmap items the authenticated user has voted for.

**Endpoint**: `GET /api/v1/roadmap/my-votes`

**Authentication**: Required (JWT)

**Parameters**: None

**Request Body**: None

**Example Request**:
```javascript
fetch('/api/v1/roadmap/my-votes', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${jwtToken}`
  }
})
```

**Success Response** (200):
```json
{
  "success": true,
  "votes": [
    {
      "roadmap_item_id": "feature-ai-assistant",
      "voted_at": "2024-01-15T10:30:00Z",
      "item_title": "AI-Powered Learning Assistant",
      "item_description": "Intelligent chatbot to help students...",
      "item_category": "AI & Machine Learning",
      "item_status": "Planned",
      "current_vote_count": 15
    }
  ],
  "total_votes": 1
}
```

---

### 4. Get Top Voted Items
Retrieve the most voted roadmap items (public endpoint).

**Endpoint**: `GET /api/v1/roadmap/top-voted`

**Authentication**: None (Public)

**Query Parameters**:
- `limit` (optional): Maximum items to return (default: 10, max: 50)

**Example Request**:
```javascript
fetch('/api/v1/roadmap/top-voted?limit=5', {
  method: 'GET'
})
```

**Success Response** (200):
```json
{
  "success": true,
  "items": [
    {
      "id": "feature-ai-assistant",
      "title": "AI-Powered Learning Assistant", 
      "description": "Intelligent chatbot to help students...",
      "plannedReleaseDate": "Q3 2026",
      "status": "Planned",
      "type": "feature",
      "votingCount": 25
    }
  ],
  "total_items": 1,
  "limit": 5
}
```

---

### 5. Sync Vote Cache (Management Only)
Synchronize vote cache with database. **This endpoint should only be implemented in the management/admin section of the frontend.**

**Endpoint**: `POST /api/v1/roadmap/sync-cache`

**Authentication**: Required (Owner/Admin roles only)

**Parameters**: None

**Request Body**: None

**Example Request**:
```javascript
fetch('/api/v1/roadmap/sync-cache', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminJwtToken}`
  }
})
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Cache synchronized successfully"
}
```

**Error Responses**:
- **401**: Authentication required
- **403**: Insufficient permissions (owner/admin required)

---

## ⚠️ Error Handling

Always handle these common error scenarios:
- **Authentication errors** (401): Redirect to login
- **Permission errors** (403): Show access denied message  
- **Network errors**: Show retry option
- **Duplicate votes** (409): Update UI state accordingly

## 🎨 UI/UX Recommendations

1. **Visual Feedback**: Show loading states during vote operations
2. **Vote Count Updates**: Update counts immediately for better UX
3. **User Indication**: Clearly show which items user has voted for
4. **Sorting Options**: Allow sorting by vote count, release date, etc.
5. **Categories**: Group roadmap items by type (features, projects, tools)
6. **Mobile Responsive**: Ensure voting works well on mobile devices

## 🚀 Performance Tips

1. **Debounce**: Prevent rapid clicking on vote buttons
2. **Caching**: Cache user votes locally to reduce API calls
3. **Pagination**: Implement pagination for large roadmap lists
4. **Optimistic Updates**: Update UI immediately, rollback on error

This implementation provides a complete voting system that's secure, performant, and user-friendly!
