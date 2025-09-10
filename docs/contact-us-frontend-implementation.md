# Contact Us Frontend Implementation Guide

## Overview
Implementation guide for integrating the Contact Us feature with the existing frontend contact page and admin management dashboard.

**Note:** Contact messages are from public users (both signed-in and anonymous users). No authentication is required to submit contact forms.

## 🎯 Implementation Strategy

### Public Contact Page
- **Existing page:** Contact form already exists in frontend
- **Required change:** Update form submission to use backend API
- **User access:** Public (no authentication required)

### Admin Management Features  
- **Location:** Admin/Owner management dashboard
- **Required access:** Owner/Admin role with JWT authentication
- **Features:** List, filter, search, and manage contact messages

---

## 📝 Public Contact Form Implementation

### API Endpoint
- **URL:** `POST /api/v1/contact`
- **Access:** Public (no authentication required)
- **Content-Type:** `application/json`

### Request Structure

#### Headers
```javascript
{
  'Content-Type': 'application/json'
}
```

#### Request Body
```javascript
{
  // Required fields
  "name": "John",                           // String, 2-100 chars, letters/spaces only
  "email": "john@domain.com",               // Valid email format
  "message": "Your message here...",        // String, 10-2000 chars
  
  // Optional fields
  "last_name": "Doe",                       // String, max 100 chars (optional)
  "phone_number": "+1234567890"             // International format (optional)
}
```

### Response Handling

#### Success Response (201)
```javascript
{
  "success": true,
  "message": "Thank you for contacting us! We'll get back to you shortly.",
  "reference_id": "550e8400-e29b-41d4-a716-446655440000",
  "acknowledgment_email_sent": true
}
```

#### Validation Error Response (400)
```javascript
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "email": ["Please enter a valid email address"],
    "message": ["Message must be at least 10 characters long"]
  }
}
```

#### Rate Limit Error Response (429)
```javascript
{
  "success": false,
  "message": "Rate limit exceeded. Please try again later.",
  "errors": {
    "rate_limit": ["Too many submissions from this IP address"]
  }
}
```

---

## 🔐 Admin Management Features

### List Contact Messages

#### API Endpoint
- **URL:** `GET /api/v1/contact`
- **Access:** Owner/Admin only
- **Authentication:** Required (JWT token)

#### Headers
```javascript
{
  'Authorization': 'Bearer YOUR_JWT_TOKEN',
  'Content-Type': 'application/json'
}
```

#### Query Parameters
- `page` (int): Page number (default: 1)
- `per_page` (int): Items per page (default: 20, max: 100)
- `status` (string): Filter by status (NEW, READ, IN_PROGRESS, RESOLVED, SPAM)
- `search` (string): Search in name, email, or message content

#### Response (200)
```javascript
{
  "success": true,
  "messages": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John",
      "last_name": "Doe", 
      "email": "john@example.com",
      "phone_number": "+1234567890",
      "message": "Hello, I have a question...",
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "country": "US",
      "city": "New York",
      "status": "NEW",
      "created_at": "2025-08-28T16:30:00.000Z",
      "read_at": null,
      "resolved_at": null,
      "acknowledgment_sent": true,
      "acknowledgment_sent_at": "2025-08-28T16:30:05.000Z",
      "admin_notes": null,
      "assigned_to": null
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total_pages": 3,
    "total_items": 42,
    "has_next": true,
    "has_prev": false,
    "next_page": 2,
    "prev_page": null
  },
  "filters": {
    "status": null,
    "search": null
  },
  "stats": {
    "total_messages": 42,
    "new_messages": 15,
    "in_progress": 8,
    "resolved": 19
  }
}
```

### Update Contact Message

#### API Endpoint
- **URL:** `PUT /api/v1/contact/{message_id}`
- **Access:** Owner/Admin only
- **Authentication:** Required (JWT token)

#### Headers
```javascript
{
  'Authorization': 'Bearer YOUR_JWT_TOKEN',
  'Content-Type': 'application/json'
}
```

#### Path Parameters
- `message_id` - UUID of the contact message

#### Request Body
```javascript
{
  "status": "READ",                    // Optional: NEW, READ, IN_PROGRESS, RESOLVED, SPAM
  "admin_notes": "Reviewed and...",    // Optional: Admin notes  
  "assigned_to": "admin@orcatech.com"  // Optional: Admin email
}
```

#### Response (200)
```javascript
{
  "success": true,
  "message": "Contact message updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "READ",
    "read_at": "2025-08-28T17:00:00.000Z",
    "admin_notes": "Reviewed and...",
    "assigned_to": "admin@orcatech.com"
    // ... other fields
  }
}
```

### Contact Messages Status Check (Individual)

#### API Endpoint
- **URL:** `GET /api/v1/contact/status/{reference_id}`
- **Access:** Owner/Admin only
- **Authentication:** Required (JWT token)

#### Response (200)
```javascript
{
  "success": true,
  "message": {
    "reference_id": "550e8400-e29b-41d4-a716-446655440000", 
    "status": "NEW",
    "created_at": "2025-08-28T16:30:00.000Z",
    "acknowledgment_sent": true
  }
}
```

### Contact System Health Check

#### API Endpoint
- **URL:** `GET /api/v1/contact/health`
- **Access:** Owner/Admin only
- **Authentication:** Required (JWT token)

#### Response (200)
```javascript
{
  "success": true,
  "message": "Contact system is healthy",
  "stats": {
    "total_messages": 42,
    "email_enabled": true,
    "geolocation_enabled": true,
    "rate_limit_per_hour": 3
  }
}
```

---

## 📋 Admin Dashboard Implementation

### Contact Messages Management Dashboard

#### HTML Structure
```html
<div class="admin-section contact-management">
  <h3>Contact Messages Management</h3>
  
  <!-- Stats Cards -->
  <div class="stats-cards">
    <div class="stat-card new">
      <h4>New Messages</h4>
      <span class="stat-number" id="newCount">0</span>
    </div>
    <div class="stat-card in-progress">
      <h4>In Progress</h4>
      <span class="stat-number" id="inProgressCount">0</span>
    </div>
    <div class="stat-card resolved">
      <h4>Resolved</h4>
      <span class="stat-number" id="resolvedCount">0</span>
    </div>
    <div class="stat-card total">
      <h4>Total Messages</h4>
      <span class="stat-number" id="totalCount">0</span>
    </div>
  </div>
  
  <!-- Filters -->
  <div class="filters-section">
    <form id="messageFilters" class="filters-form">
      <select id="statusFilter" name="status">
        <option value="">All Statuses</option>
        <option value="NEW">New</option>
        <option value="READ">Read</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="RESOLVED">Resolved</option>
        <option value="SPAM">Spam</option>
      </select>
      
      <input type="text" id="searchInput" name="search" placeholder="Search messages..." />
      
      <button type="submit" class="btn btn-primary">Filter</button>
      <button type="button" id="clearFilters" class="btn btn-secondary">Clear</button>
    </form>
  </div>
  
  <!-- Messages List -->
  <div class="messages-container">
    <div id="messagesTable" class="messages-table">
      <!-- Messages will be loaded here -->
    </div>
    
    <!-- Pagination -->
    <div id="pagination" class="pagination">
      <!-- Pagination controls will be loaded here -->
    </div>
  </div>
  
  <!-- System Health -->
  <div class="health-section">
    <h4>System Health</h4>
    <button id="checkHealthBtn" class="btn btn-info">Check Health</button>
    <div id="healthStatus" class="status-display"></div>
  </div>
</div>

<!-- Message Details Modal -->
<div id="messageModal" class="modal">
  <div class="modal-content">
    <span class="close">&times;</span>
    <h4>Message Details</h4>
    <div id="messageDetails"></div>
    
    <form id="updateMessageForm" class="update-form">
      <div class="form-group">
        <label for="messageStatus">Status:</label>
        <select id="messageStatus" name="status">
          <option value="NEW">New</option>
          <option value="READ">Read</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="SPAM">Spam</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="adminNotes">Admin Notes:</label>
        <textarea id="adminNotes" name="admin_notes" rows="4"></textarea>
      </div>
      
      <div class="form-group">
        <label for="assignedTo">Assigned To:</label>
        <input type="email" id="assignedTo" name="assigned_to" placeholder="admin@orcatech.com" />
      </div>
      
      <button type="submit" class="btn btn-primary">Update Message</button>
    </form>
  </div>
</div>
```

#### JavaScript Implementation
```javascript
class ContactMessagesManager {
  constructor() {
    this.currentPage = 1;
    this.currentFilters = {};
    this.currentMessageId = null;
    this.init();
  }
  
  init() {
    this.bindEvents();
    this.loadMessages();
    this.loadStats();
  }
  
  bindEvents() {
    document.getElementById('messageFilters').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFiltersSubmit();
    });
    
    document.getElementById('clearFilters').addEventListener('click', () => {
      this.clearFilters();
    });
    
    document.getElementById('checkHealthBtn').addEventListener('click', () => {
      this.checkSystemHealth();
    });
    
    document.getElementById('updateMessageForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.updateMessage();
    });
    
    // Modal close
    document.querySelector('.modal .close').addEventListener('click', () => {
      this.closeModal();
    });
  }
  
  async loadMessages(page = 1) {
    try {
      const token = localStorage.getItem('jwt_token');
      const params = new URLSearchParams({
        page: page,
        per_page: 20,
        ...this.currentFilters
      });
      
      const response = await fetch(`/api/v1/contact?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.renderMessages(data.messages);
        this.renderPagination(data.pagination);
        this.updateStats(data.stats);
        this.currentPage = page;
      } else {
        this.showError('Failed to load messages');
      }
    } catch (error) {
      this.showError('Network error loading messages');
    }
  }
  
  renderMessages(messages) {
    const container = document.getElementById('messagesTable');
    
    if (messages.length === 0) {
      container.innerHTML = '<div class="no-messages">No messages found</div>';
      return;
    }
    
    const table = `
      <table class="messages-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Message Preview</th>
            <th>Status</th>
            <th>Created</th>
            <th>Location</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${messages.map(message => `
            <tr class="message-row status-${message.status.toLowerCase()}">
              <td>${message.name} ${message.last_name || ''}</td>
              <td>${message.email}</td>
              <td class="message-preview">${this.truncateText(message.message, 50)}</td>
              <td><span class="status-badge status-${message.status.toLowerCase()}">${message.status}</span></td>
              <td>${new Date(message.created_at).toLocaleDateString()}</td>
              <td>${message.city || ''} ${message.country || ''}</td>
              <td>
                <button class="btn btn-sm btn-view" onclick="contactManager.viewMessage('${message.id}')">View</button>
                <button class="btn btn-sm btn-update" onclick="contactManager.updateMessageModal('${message.id}')">Update</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    
    container.innerHTML = table;
  }
  
  renderPagination(pagination) {
    const container = document.getElementById('pagination');
    
    let paginationHTML = '<div class="pagination-controls">';
    
    // Previous button
    if (pagination.has_prev) {
      paginationHTML += `<button class="btn btn-sm" onclick="contactManager.loadMessages(${pagination.prev_page})">Previous</button>`;
    }
    
    // Page info
    paginationHTML += `<span class="page-info">Page ${pagination.page} of ${pagination.total_pages} (${pagination.total_items} total)</span>`;
    
    // Next button
    if (pagination.has_next) {
      paginationHTML += `<button class="btn btn-sm" onclick="contactManager.loadMessages(${pagination.next_page})">Next</button>`;
    }
    
    paginationHTML += '</div>';
    container.innerHTML = paginationHTML;
  }
  
  updateStats(stats) {
    document.getElementById('newCount').textContent = stats.new_messages;
    document.getElementById('inProgressCount').textContent = stats.in_progress;
    document.getElementById('resolvedCount').textContent = stats.resolved;
    document.getElementById('totalCount').textContent = stats.total_messages;
  }
  
  handleFiltersSubmit() {
    const formData = new FormData(document.getElementById('messageFilters'));
    this.currentFilters = {};
    
    for (const [key, value] of formData) {
      if (value.trim()) {
        this.currentFilters[key] = value.trim();
      }
    }
    
    this.loadMessages(1); // Reset to first page
  }
  
  clearFilters() {
    document.getElementById('messageFilters').reset();
    this.currentFilters = {};
    this.loadMessages(1);
  }
  
  async viewMessage(messageId) {
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`/api/v1/contact/status/${messageId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.showMessageDetails(data.message);
      }
    } catch (error) {
      this.showError('Failed to load message details');
    }
  }
  
  async updateMessageModal(messageId) {
    // Load full message details first
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`/api/v1/contact?search=${messageId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success && data.messages.length > 0) {
        const message = data.messages[0];
        this.currentMessageId = messageId;
        
        // Populate form
        document.getElementById('messageStatus').value = message.status;
        document.getElementById('adminNotes').value = message.admin_notes || '';
        document.getElementById('assignedTo').value = message.assigned_to || '';
        
        // Show modal
        document.getElementById('messageModal').style.display = 'block';
      }
    } catch (error) {
      this.showError('Failed to load message for update');
    }
  }
  
  async updateMessage() {
    if (!this.currentMessageId) return;
    
    try {
      const token = localStorage.getItem('jwt_token');
      const formData = new FormData(document.getElementById('updateMessageForm'));
      const updateData = Object.fromEntries(formData);
      
      const response = await fetch(`/api/v1/contact/${this.currentMessageId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.closeModal();
        this.loadMessages(this.currentPage); // Refresh current page
        this.showSuccess('Message updated successfully');
      } else {
        this.showError(data.message);
      }
    } catch (error) {
      this.showError('Failed to update message');
    }
  }
  
  async checkSystemHealth() {
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch('/api/v1/contact/health', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        document.getElementById('healthStatus').innerHTML = `
          <div class="health-success">
            <h5>✅ ${data.message}</h5>
            <ul>
              <li>Total Messages: ${data.stats.total_messages}</li>
              <li>Email Enabled: ${data.stats.email_enabled ? '✅' : '❌'}</li>
              <li>Geolocation Enabled: ${data.stats.geolocation_enabled ? '✅' : '❌'}</li>
              <li>Rate Limit: ${data.stats.rate_limit_per_hour} per hour</li>
            </ul>
          </div>
        `;
      } else {
        this.showHealthError(data.message);
      }
    } catch (error) {
      this.showHealthError('Network error checking system health');
    }
  }
  
  closeModal() {
    document.getElementById('messageModal').style.display = 'none';
    this.currentMessageId = null;
  }
  
  truncateText(text, maxLength) {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
  
  showSuccess(message) {
    // Show success toast/notification
    console.log('Success:', message);
  }
  
  showError(message) {
    // Show error toast/notification
    console.error('Error:', message);
  }
  
  showHealthError(message) {
    document.getElementById('healthStatus').innerHTML = `
      <div class="health-error">
        <p>❌ ${message}</p>
      </div>
    `;
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.contactManager = new ContactMessagesManager();
});
```

#### CSS Styling
```css
.contact-management {
  padding: 20px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  color: white;
}

.stat-card.new { background-color: #3498db; }
.stat-card.in-progress { background-color: #f39c12; }
.stat-card.resolved { background-color: #27ae60; }
.stat-card.total { background-color: #7f8c8d; }

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  margin-top: 0.5rem;
}

.filters-form {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
}

.messages-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.messages-table th,
.messages-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.messages-table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.message-preview {
  max-width: 300px;
  overflow: hidden;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
}

.status-new { background-color: #e3f2fd; color: #1976d2; }
.status-read { background-color: #fff3e0; color: #f57c00; }
.status-in_progress { background-color: #f3e5f5; color: #7b1fa2; }
.status-resolved { background-color: #e8f5e8; color: #2e7d32; }
.status-spam { background-color: #ffebee; color: #c62828; }

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.modal {
  display: none;
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
}

.modal-content {
  background-color: white;
  margin: 5% auto;
  padding: 2rem;
  border-radius: 8px;
  width: 80%;
  max-width: 600px;
}

.update-form .form-group {
  margin-bottom: 1rem;
}

.update-form label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.update-form input,
.update-form select,
.update-form textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}
```

---

## 🧪 Testing Checklist

### Public Contact Form
- [ ] Form submission with all fields
- [ ] Form submission with required fields only
- [ ] Email validation (various formats)
- [ ] Message length validation  
- [ ] Phone number validation
- [ ] XSS protection testing
- [ ] Rate limiting behavior
- [ ] Network error handling

### Admin Features
- [ ] List messages with pagination
- [ ] Filter messages by status
- [ ] Search messages by content
- [ ] Update message status
- [ ] Add admin notes
- [ ] Assign messages to admins
- [ ] View individual message details
- [ ] System health check
- [ ] Authentication error handling

### Authentication & Authorization
- [ ] Admin/owner JWT token validation
- [ ] Unauthorized access prevention
- [ ] Token expiration handling
- [ ] Role-based access control

---

## 📚 Integration Summary

1. **Update existing contact page** to use new backend API
2. **Add admin dashboard** with message management features  
3. **Implement proper error handling** and user feedback
4. **Test thoroughly** across different scenarios
5. **Deploy with proper environment configuration**

The backend is ready with full CRUD operations for contact message management!