// Contact Messages Management Page

import React, { useState, useEffect, useCallback } from 'react';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  Edit,
  MapPin,
  Calendar,
  Mail,
  Phone,
  X
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { managementApiService } from '../services/managementApiService';
import type { 
  ContactMessage, 
  ContactMessageResponse, 
  ContactFilters, 
  ContactMessageUpdate 
} from '../types/management';

const ContactMessagesPage: React.FC = () => {
  // State management
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [pagination, setPagination] = useState<ContactMessageResponse['pagination'] | null>(null);
  const [stats, setStats] = useState<ContactMessageResponse['stats'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ContactFilters>({ page: 1, per_page: 20 });
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Form state for updating messages
  const [updateForm, setUpdateForm] = useState<ContactMessageUpdate>({});

  // Load messages
  const loadMessages = useCallback(async (newFilters?: ContactFilters) => {
    setLoading(true);
    try {
      const filtersToUse = { ...filters, ...newFilters };
      const response = await managementApiService.getContactMessages(filtersToUse);
      
      if (response.success && response.data) {
        setMessages(response.data.messages);
        setPagination(response.data.pagination);
        setStats(response.data.stats);
        setFilters(filtersToUse);
      } else {
        toast.error(response.message || 'Failed to load contact messages');
      }
    } catch (error) {
      toast.error('Network error loading contact messages');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initial load
  useEffect(() => {
    loadMessages();
  }, []);

  // Handle filter changes
  const handleFilterChange = (key: keyof ContactFilters, value: any) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    loadMessages(newFilters);
  };

  const clearFilters = () => {
    loadMessages({ page: 1, per_page: 20 });
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    loadMessages({ ...filters, page });
  };

  // Handle message update
  const handleUpdateMessage = async (messageId: string, update: ContactMessageUpdate) => {
    setUpdating(true);
    try {
      const response = await managementApiService.updateContactMessage(messageId, update);
      
      if (response.success) {
        toast.success('Message updated successfully');
        setIsUpdateDialogOpen(false);
        setSelectedMessage(null);
        setUpdateForm({});
        await loadMessages(); // Refresh the list
      } else {
        toast.error(response.message || 'Failed to update message');
      }
    } catch (error) {
      toast.error('Network error updating message');
    } finally {
      setUpdating(false);
    }
  };

  // Open update dialog
  const openUpdateDialog = (message: ContactMessage) => {
    setSelectedMessage(message);
    setUpdateForm({
      status: message.status,
      admin_notes: message.admin_notes || '',
      assigned_to: message.assigned_to || ''
    });
    setIsUpdateDialogOpen(true);
  };

  // Status badge styling
  const getStatusBadge = (status: string) => {
    const styles = {
      NEW: 'bg-blue-900/50 text-blue-400 border-blue-500/30',
      READ: 'bg-orange-900/50 text-orange-400 border-orange-500/30',
      IN_PROGRESS: 'bg-purple-900/50 text-purple-400 border-purple-500/30',
      RESOLVED: 'bg-green-900/50 text-green-400 border-green-500/30',
      SPAM: 'bg-red-900/50 text-red-400 border-red-500/30'
    };
    
    return styles[status as keyof typeof styles] || 'bg-slate-900/50 text-slate-400 border-slate-500/30';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="space-y-6">
      {/* Page Actions */}
      <div className="flex justify-end">
        <Button onClick={() => loadMessages()} disabled={loading} variant="outline" size="sm" className="bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white">
          <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-blue-900/20 border-blue-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-400">{stats.new_messages}</p>
                  <p className="text-sm text-slate-400">New Messages</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-900/20 border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-400">{stats.in_progress}</p>
                  <p className="text-sm text-slate-400">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-900/20 border-green-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                  <Badge className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-400">{stats.resolved}</p>
                  <p className="text-sm text-slate-400">Resolved</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-600">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-600/20 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-300">{stats.total_messages}</p>
                  <p className="text-sm text-slate-400">Total Messages</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="bg-slate-900/50 border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-400">Filters:</span>
            </div>
            
            <Select value={filters.status || 'all'} onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : value)}>
              <SelectTrigger className="w-40 bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="all" className="text-white hover:bg-slate-700">All Statuses</SelectItem>
                <SelectItem value="NEW" className="text-white hover:bg-slate-700">New</SelectItem>
                <SelectItem value="READ" className="text-white hover:bg-slate-700">Read</SelectItem>
                <SelectItem value="IN_PROGRESS" className="text-white hover:bg-slate-700">In Progress</SelectItem>
                <SelectItem value="RESOLVED" className="text-white hover:bg-slate-700">Resolved</SelectItem>
                <SelectItem value="SPAM" className="text-white hover:bg-slate-700">Spam</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search messages..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
                  className="pl-10 bg-slate-800 border-slate-600 text-white"
                />
              </div>
            </div>

            {(filters.status || filters.search) && (
              <Button onClick={clearFilters} variant="outline" size="sm">
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Messages Table */}
      <Card className="bg-slate-900/50 border-slate-700">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-6 h-6 text-slate-400 animate-spin mx-auto mb-2" />
              <p className="text-slate-400">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400">No messages found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left p-4 text-slate-300 font-medium">Contact</th>
                    <th className="text-left p-4 text-slate-300 font-medium">Message</th>
                    <th className="text-left p-4 text-slate-300 font-medium">Status</th>
                    <th className="text-left p-4 text-slate-300 font-medium">Created</th>
                    <th className="text-left p-4 text-slate-300 font-medium">Location</th>
                    <th className="text-left p-4 text-slate-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((message) => (
                    <tr key={message.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                      <td className="p-4">
                        <div className="space-y-1">
                          <p className="text-white font-medium">
                            {message.name} {message.last_name}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Mail className="w-3 h-3" />
                            {message.email}
                          </div>
                          {message.phone_number && (
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                              <Phone className="w-3 h-3" />
                              {message.phone_number}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 max-w-xs">
                        <p className="text-slate-300 text-sm">
                          {truncateText(message.message, 100)}
                        </p>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className={getStatusBadge(message.status)}>
                          {message.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Calendar className="w-3 h-3" />
                          {formatDate(message.created_at)}
                        </div>
                      </td>
                      <td className="p-4">
                        {(message.city || message.country) && (
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <MapPin className="w-3 h-3" />
                            {message.city} {message.country}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white">
                                <Eye className="w-3 h-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-800 [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-slate-500" style={{ scrollbarWidth: 'thin', scrollbarColor: '#64748b #374151' }}>
                              <DialogHeader>
                                <DialogTitle className="text-white">Message Details</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-slate-400">Name</Label>
                                    <p className="text-white">{message.name} {message.last_name}</p>
                                  </div>
                                  <div>
                                    <Label className="text-slate-400">Email</Label>
                                    <p className="text-white">{message.email}</p>
                                  </div>
                                  {message.phone_number && (
                                    <div>
                                      <Label className="text-slate-400">Phone</Label>
                                      <p className="text-white">{message.phone_number}</p>
                                    </div>
                                  )}
                                  <div>
                                    <Label className="text-slate-400">Status</Label><br/>
                                    <Badge variant="outline" className={getStatusBadge(message.status)}>
                                      {message.status}
                                    </Badge>
                                  </div>
                                  <div>
                                    <Label className="text-slate-400">Created</Label>
                                    <p className="text-white">{formatDate(message.created_at)}</p>
                                  </div>
                                  {message.assigned_to && (
                                    <div>
                                      <Label className="text-slate-400">Assigned To</Label>
                                      <p className="text-white">{message.assigned_to}</p>
                                    </div>
                                  )}
                                  <div>
                                    <Label className="text-slate-400">Acknowledgment Email</Label>
                                    <div className="flex items-center gap-2">
                                      <span className={message.acknowledgment_sent ? 'text-green-400' : 'text-red-400'}>
                                        {message.acknowledgment_sent ? '✅ Sent' : '❌ Not Sent'}
                                      </span>
                                      {message.acknowledgment_sent_at && (
                                        <span className="text-slate-500 text-sm">
                                          ({formatDate(message.acknowledgment_sent_at)})
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  {(message.city || message.country) && (
                                    <div>
                                      <Label className="text-slate-400">Location</Label>
                                      <p className="text-white">{message.city} {message.country}</p>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <Label className="text-slate-400">Message</Label>
                                  <div className="p-3 bg-slate-800 rounded-lg text-white whitespace-pre-wrap">
                                    {message.message}
                                  </div>
                                </div>
                                {message.admin_notes && (
                                  <div>
                                    <Label className="text-slate-400">Admin Notes</Label>
                                    <div className="p-3 bg-slate-800 rounded-lg text-white">
                                      {message.admin_notes}
                                    </div>
                                  </div>
                                )}
                                {message.ip_address && (
                                  <div className="pt-2 border-t border-slate-700">
                                    <Label className="text-slate-400">Technical Information</Label>
                                    <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                                      <div>
                                        <span className="text-slate-500">IP Address:</span>
                                        <p className="text-slate-300 font-mono">{message.ip_address}</p>
                                      </div>
                                      {message.user_agent && (
                                        <div>
                                          <span className="text-slate-500">User Agent:</span>
                                          <p className="text-slate-300 text-xs truncate" title={message.user_agent}>
                                            {message.user_agent}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openUpdateDialog(message)}
                            className="bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Page {pagination.page} of {pagination.total_pages} 
            ({pagination.total_items} total messages)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.has_prev}
              onClick={() => pagination.prev_page && handlePageChange(pagination.prev_page)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.has_next}
              onClick={() => pagination.next_page && handlePageChange(pagination.next_page)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Update Message Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-800 [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-slate-500" style={{ scrollbarWidth: 'thin', scrollbarColor: '#64748b #374151' }}>
          <DialogHeader>
            <DialogTitle className="text-white">Update Message</DialogTitle>
            <DialogDescription className="text-slate-400">
              Update the status and add notes for this message
            </DialogDescription>
          </DialogHeader>
          
          {selectedMessage && (
            <div className="space-y-4">
              <div>
                <Label className="text-slate-400">From: {selectedMessage.name} {selectedMessage.last_name}</Label>
                <p className="text-sm text-slate-500">{selectedMessage.email}</p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-slate-300">Status</Label>
                <Select 
                  value={updateForm.status} 
                  onValueChange={(value) => setUpdateForm({...updateForm, status: value as any})}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600 max-h-[60vh] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-700 [&::-webkit-scrollbar-thumb]:bg-slate-500 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-slate-400" style={{ scrollbarWidth: 'thin', scrollbarColor: '#64748b #374151' }}>
                    <SelectItem value="NEW" className="text-white hover:bg-slate-700">New</SelectItem>
                    <SelectItem value="READ" className="text-white hover:bg-slate-700">Read</SelectItem>
                    <SelectItem value="IN_PROGRESS" className="text-white hover:bg-slate-700">In Progress</SelectItem>
                    <SelectItem value="RESOLVED" className="text-white hover:bg-slate-700">Resolved</SelectItem>
                    <SelectItem value="SPAM" className="text-white hover:bg-slate-700">Spam</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Admin Notes</Label>
                <Textarea
                  placeholder="Add notes about this message..."
                  value={updateForm.admin_notes}
                  onChange={(e) => setUpdateForm({...updateForm, admin_notes: e.target.value})}
                  className="bg-slate-800 border-slate-600 text-white"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Assigned To</Label>
                <Input
                  type="email"
                  placeholder="admin@labdojo.com"
                  value={updateForm.assigned_to}
                  onChange={(e) => setUpdateForm({...updateForm, assigned_to: e.target.value})}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsUpdateDialogOpen(false)}
                  disabled={updating}
                  className="bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => selectedMessage && handleUpdateMessage(selectedMessage.id, updateForm)}
                  disabled={updating}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {updating ? 'Updating...' : 'Update Message'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactMessagesPage;