import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API service
const api = {
  // Auth endpoints
  auth: {
    login: (credentials) => apiClient.post('/auth/login', credentials),
    register: (userData) => apiClient.post('/auth/register', userData),
    logout: () => apiClient.post('/auth/logout'),
    getCurrentUser: () => apiClient.get('/auth/me'),
  },

  // Community endpoints
  communities: {
    getPublic: () => apiClient.get('/communities/public'),
    getMyCommunities: () => apiClient.get('/communities/my-communities'),
    getById: (id) => apiClient.get(`/communities/${id}`),
    getCommunityById: (id) => apiClient.get(`/communities/${id}`), // Alias for getById
    create: (data) => apiClient.post('/communities', data),
    update: (id, data) => apiClient.put(`/communities/${id}`, data),
    updateCommunity: (id, data) => apiClient.put(`/communities/${id}`, data), // Alias for update
    delete: (id) => apiClient.delete(`/communities/${id}`),
    deleteCommunity: (id) => apiClient.delete(`/communities/${id}`), // Alias for delete
    join: (joinCode) => apiClient.post(`/communities/join/${joinCode}`),
  },

  // Member endpoints
  members: {
    getAll: (communityId) => apiClient.get(`/communities/${communityId}/members`),
    getCommunityMembers: (communityId) => apiClient.get(`/communities/${communityId}/members`), // Alias for getAll
    getById: (communityId, memberId) => apiClient.get(`/communities/${communityId}/members/${memberId}`),
    getActivity: (communityId, memberId) => apiClient.get(`/communities/${communityId}/members/${memberId}/activity`),
    add: (communityId, data) => apiClient.post(`/communities/${communityId}/members`, data),
    changeRole: (communityId, memberId, role) => apiClient.put(`/communities/${communityId}/members/${memberId}/role`, { role }),
    remove: (communityId, memberId) => apiClient.delete(`/communities/${communityId}/members/${memberId}`),
    removeMember: (communityId, memberId) => apiClient.delete(`/communities/${communityId}/members/${memberId}`), // Alias for remove
    leaveCommunity: (communityId) => apiClient.post(`/communities/${communityId}/members/leave`),
    leave: (communityId) => apiClient.post(`/communities/${communityId}/members/leave`), // Alias for leaveCommunity
  },

  // Message endpoints
  messages: {
    getConversations: (communityId) => apiClient.get(`/messages/conversations?communityId=${communityId}`),
    getConversation: (otherUserId, page = 0, size = 50) => 
      apiClient.get(`/messages/conversation/${otherUserId}?page=${page}&size=${size}`),
    getDirectMessages: (communityId, otherUserId, page = 0, size = 50) => 
      apiClient.get(`/messages/conversation/${otherUserId}?page=${page}&size=${size}`),
    getUnreadCount: () => apiClient.get('/messages/unread-count'),
    // Note: markAsRead is handled via WebSocket, not REST API
    markAsRead: (communityId, senderId) => Promise.resolve({ data: { success: true } }),
  },

  // Join request endpoints
  joinRequests: {
    getPending: (communityId) => apiClient.get(`/communities/${communityId}/join-requests`),
    getPendingRequests: (communityId) => apiClient.get(`/communities/${communityId}/join-requests`), // Alias for getPending
    getPendingCount: (communityId) => apiClient.get(`/communities/${communityId}/join-requests/pending-count`),
    approve: (communityId, requestId) => apiClient.post(`/communities/${communityId}/join-requests/${requestId}/approve`),
    approveRequest: (communityId, requestId) => apiClient.post(`/communities/${communityId}/join-requests/${requestId}/approve`), // Alias for approve
    reject: (communityId, requestId, reason) => 
      apiClient.post(`/communities/${communityId}/join-requests/${requestId}/reject`, { reason }),
    rejectRequest: (communityId, requestId, reason) => 
      apiClient.post(`/communities/${communityId}/join-requests/${requestId}/reject`, { reason }), // Alias for reject
    delete: (communityId, requestId) => apiClient.delete(`/communities/${communityId}/join-requests/${requestId}`),
    deleteRequest: (communityId, requestId) => apiClient.delete(`/communities/${communityId}/join-requests/${requestId}`), // Alias for delete
  },

  // Invite endpoints
  invites: {
    send: (communityId, data) => apiClient.post(`/communities/${communityId}/invites`, data),
    createInvite: (communityId, email) => apiClient.post(`/communities/${communityId}/invites`, { email }), // Alias for send
    getCommunityInvites: (communityId) => apiClient.get(`/communities/${communityId}/invites`),
    cancel: (communityId, inviteId) => apiClient.delete(`/communities/${communityId}/invites/${inviteId}`),
    cancelInvite: (inviteId) => apiClient.delete(`/invites/${inviteId}`), // Simplified alias
    delete: (communityId, inviteId) => apiClient.delete(`/communities/${communityId}/invites/${inviteId}?permanent=true`),
    deleteInvite: (communityId, inviteId) => apiClient.delete(`/communities/${communityId}/invites/${inviteId}?permanent=true`), // Alias for permanent delete
    accept: (token) => apiClient.post(`/invites/${token}/accept`),
    validate: (token) => apiClient.get(`/invites/${token}/validate`),
    getMyInvites: () => apiClient.get('/invites/my'),
    getUserInvites: () => apiClient.get('/invites/my'), // Alias for getMyInvites
  },

  // Moderator endpoints
  moderators: {
    getAll: (communityId) => apiClient.get(`/communities/${communityId}/moderators`),
    getCommunityModerators: (communityId) => apiClient.get(`/communities/${communityId}/moderators`), // Alias for getAll
    getById: (communityId, moderatorId) => apiClient.get(`/communities/${communityId}/moderators/${moderatorId}`),
    add: (communityId, userId) => apiClient.post(`/communities/${communityId}/moderators`, { userId }),
    addModerator: (communityId, userId) => apiClient.post(`/communities/${communityId}/moderators`, { userId }), // Alias for add
    remove: (communityId, moderatorId) => apiClient.delete(`/communities/${communityId}/moderators/${moderatorId}`),
    removeModerator: (communityId, moderatorId) => apiClient.delete(`/communities/${communityId}/moderators/${moderatorId}`), // Alias for remove
    updatePermissions: (communityId, moderatorId, permissions) => 
      apiClient.put(`/communities/${communityId}/moderators/${moderatorId}/permissions`, permissions),
    getActions: (communityId, moderatorId, limit = 50) => 
      apiClient.get(`/communities/${communityId}/moderators/${moderatorId}/actions?limit=${limit}`),
  },

  // Bulk upload endpoints
  bulkUpload: {
    upload: (communityId, formData) => 
      apiClient.post(`/communities/${communityId}/bulk-upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    uploadMembers: (communityId, formData) => 
      apiClient.post(`/communities/${communityId}/bulk-upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }), // Alias for upload
    downloadTemplate: () => apiClient.get('/communities//bulk-upload/template', { responseType: 'blob' }),
    getHistory: (communityId) => apiClient.get(`/communities/${communityId}/bulk-upload/history`),
    getUploadHistory: (communityId) => apiClient.get(`/communities/${communityId}/bulk-upload/history`), // Alias for getHistory
  },

  // Statistics endpoints
  statistics: {
    getGlobal: () => apiClient.get('/statistics/global'),
    getCommunity: (communityId) => apiClient.get(`/statistics/communities/${communityId}`),
    getCommunityStats: (communityId) => apiClient.get(`/statistics/communities/${communityId}`), // Alias for getCommunity
    // TODO: Add getRecentActivities endpoint when backend is ready
  },
};

export default api;
