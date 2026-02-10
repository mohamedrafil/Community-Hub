import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUsers, FiUserPlus, FiUserMinus, FiShield, 
  FiSettings, FiUpload, FiDownload, FiCheckCircle, 
  FiXCircle, FiClock, FiArrowLeft, FiTrash2, FiEdit,
  FiBarChart2, FiMessageSquare, FiActivity
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import Input from '../../components/Input';

const AdminPanelPage = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [community, setCommunity] = useState(null);
  const [stats, setStats] = useState(null);
  const [members, setMembers] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [invites, setInvites] = useState([]);
  const [moderators, setModerators] = useState([]);
  const [uploadHistories, setUploadHistories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAddModeratorModal, setShowAddModeratorModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  // Forms
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [bulkFile, setBulkFile] = useState(null);
  const [communitySettings, setCommunitySettings] = useState({
    name: '',
    description: '',
    isPrivate: false
  });

  useEffect(() => {
    fetchCommunityData();
  }, [communityId]);

  useEffect(() => {
    if (activeTab === 'members') {
      fetchMembers();
    } else if (activeTab === 'joinRequests') {
      fetchJoinRequests();
    } else if (activeTab === 'invites') {
      fetchInvites();
    } else if (activeTab === 'moderators') {
      fetchModerators();
    } else if (activeTab === 'bulkUpload') {
      fetchUploadHistories();
    }
  }, [activeTab]);

  const fetchCommunityData = async () => {
    try {
      setLoading(true);
      const [communityRes, statsRes] = await Promise.all([
        api.communities.getCommunityById(communityId),
        api.statistics.getCommunityStats(communityId)
      ]);
      
      const communityData = communityRes.data;
      
      // Check if user has admin or moderator role
      if (communityData.role !== 'ADMINISTRATOR' && communityData.role !== 'MODERATOR') {
        toast.error('Access denied. Only administrators and moderators can access this page.');
        navigate(`/community/${communityId}`);
        return;
      }
      
      setCommunity(communityData);
      setStats(statsRes.data);
      setCommunitySettings({
        name: communityData.name,
        description: communityData.description || '',
        isPrivate: communityData.isPrivate
      });
    } catch (error) {
      console.error('Error fetching community data:', error);
      toast.error('Failed to load community data');
      navigate(`/community/${communityId}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await api.members.getCommunityMembers(communityId);
      setMembers(response.data);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to load members');
    }
  };

  const fetchJoinRequests = async () => {
    try {
      const response = await api.joinRequests.getPendingRequests(communityId);
      setJoinRequests(response.data);
    } catch (error) {
      console.error('Error fetching join requests:', error);
      toast.error('Failed to load join requests');
    }
  };

  const fetchInvites = async () => {
    try {
      const response = await api.invites.getCommunityInvites(communityId);
      setInvites(response.data);
    } catch (error) {
      console.error('Error fetching invites:', error);
      toast.error('Failed to load invites');
    }
  };

  const fetchModerators = async () => {
    try {
      const response = await api.moderators.getCommunityModerators(communityId);
      setModerators(response.data);
    } catch (error) {
      console.error('Error fetching moderators:', error);
      toast.error('Failed to load moderators');
    }
  };

  const fetchUploadHistories = async () => {
    try {
      const response = await api.bulkUpload.getUploadHistory(communityId);
      setUploadHistories(response.data);
    } catch (error) {
      console.error('Error fetching upload histories:', error);
      toast.error('Failed to load upload history');
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      await api.joinRequests.approveRequest(communityId, requestId);
      toast.success('Join request approved');
      fetchJoinRequests();
      fetchMembers();
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await api.joinRequests.rejectRequest(communityId, requestId);
      toast.success('Join request rejected');
      fetchJoinRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to permanently delete this join request?')) {
      return;
    }

    try {
      await api.joinRequests.deleteRequest(communityId, requestId);
      toast.success('Request deleted successfully');
      fetchJoinRequests();
    } catch (error) {
      console.error('Error deleting request:', error);
      const message = error.response?.data?.message || 'Failed to delete request';
      toast.error(message);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) {
      return;
    }

    try {
      await api.members.removeMember(communityId, memberId);
      toast.success('Member removed');
      fetchMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    }
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    
    try {
      await api.invites.createInvite(communityId, inviteEmail);
      toast.success('Invite sent successfully');
      setShowInviteModal(false);
      setInviteEmail('');
      fetchInvites();
    } catch (error) {
      console.error('Error sending invite:', error);
      toast.error('Failed to send invite');
    }
  };

  const handleCancelInvite = async (inviteId) => {
    try {
      await api.invites.cancel(communityId, inviteId);
      toast.success('Invite cancelled');
      fetchInvites();
    } catch (error) {
      console.error('Error cancelling invite:', error);
      toast.error('Failed to cancel invite');
    }
  };

  const handleDeleteInvite = async (inviteId) => {
    if (!window.confirm('Are you sure you want to permanently delete this invitation?')) {
      return;
    }

    try {
      await api.invites.deleteInvite(communityId, inviteId);
      toast.success('Invitation deleted successfully');
      fetchInvites();
    } catch (error) {
      console.error('Error deleting invite:', error);
      const message = error.response?.data?.message || 'Failed to delete invitation';
      toast.error(message);
    }
  };

  const handleAddModerator = async (e) => {
    e.preventDefault();
    
    if (!selectedMember) {
      toast.error('Please select a member');
      return;
    }

    try {
      // Change member role to MODERATOR
      await api.members.changeRole(communityId, selectedMember.id, 'MODERATOR');
      toast.success('Moderator added successfully');
      setShowAddModeratorModal(false);
      setSelectedMember(null);
      fetchModerators();
      fetchMembers();
    } catch (error) {
      console.error('Error adding moderator:', error);
      const message = error.response?.data?.message || 'Failed to add moderator';
      toast.error(message);
    }
  };

  const handleRemoveModerator = async (moderatorId) => {
    if (!window.confirm('Are you sure you want to remove this moderator?')) {
      return;
    }

    try {
      // Change moderator role back to MEMBER
      await api.members.changeRole(communityId, moderatorId, 'MEMBER');
      toast.success('Moderator removed');
      fetchModerators();
      fetchMembers();
    } catch (error) {
      console.error('Error removing moderator:', error);
      const message = error.response?.data?.message || 'Failed to remove moderator';
      toast.error(message);
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    
    if (!bulkFile) {
      toast.error('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', bulkFile);

    try {
      const response = await api.bulkUpload.uploadMembers(communityId, formData);
      
      // Check response for errors
      if (response.data.failureCount > 0) {
        toast.warning(`Bulk upload completed with ${response.data.failureCount} errors. Check console for details.`);
        console.error('Upload errors:', response.data.errors);
      } else {
        toast.success(`Bulk upload completed: ${response.data.successCount} members invited`);
      }
      
      setShowBulkUploadModal(false);
      setBulkFile(null);
      fetchUploadHistories();
      fetchMembers();
    } catch (error) {
      console.error('Error uploading file:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upload file';
      toast.error(errorMessage);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.bulkUpload.downloadTemplate();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'bulk-upload-template.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Template downloaded');
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error('Failed to download template');
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    
    try {
      // Include all required fields for the update request
      const updateData = {
        name: communitySettings.name,
        description: communitySettings.description || '',
        isPrivate: communitySettings.isPrivate,
        logoUrl: community.logoUrl || null,
        allowMemberToMemberDM: community.allowMemberToMemberDM !== false // default to true if not set
      };
      
      await api.communities.updateCommunity(communityId, updateData);
      toast.success('Community settings updated');
      setShowSettingsModal(false);
      fetchCommunityData();
    } catch (error) {
      console.error('Error updating settings:', error);
      const message = error.response?.data?.message || 'Failed to update settings';
      toast.error(message);
    }
  };

  const handleDeleteCommunity = async () => {
    // Only administrators can delete communities
    if (community?.role !== 'ADMINISTRATOR') {
      toast.error('Only administrators can delete communities');
      return;
    }
    
    const confirmText = window.prompt(
      `Are you sure you want to delete this community? This action cannot be undone.\n\nType "${community.name}" to confirm:`
    );
    
    if (confirmText !== community.name) {
      if (confirmText !== null) {
        toast.error('Community name does not match');
      }
      return;
    }

    try {
      await api.communities.delete(communityId);
      toast.success('Community deleted successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting community:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to delete community';
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <LoadingSpinner />
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiBarChart2 },
    { id: 'members', label: 'Manage Members', icon: FiUsers },
    { id: 'joinRequests', label: 'Join Requests', icon: FiUserPlus, badge: joinRequests.length },
    { id: 'invites', label: 'Invites', icon: FiUserPlus },
    { id: 'moderators', label: 'Moderators', icon: FiShield },
    { id: 'bulkUpload', label: 'Bulk Upload', icon: FiUpload },
    // Settings tab only visible to administrators
    ...(community?.role === 'ADMINISTRATOR' ? [{ id: 'settings', label: 'Settings', icon: FiSettings }] : [])
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600">Total Members</h3>
                  <FiUsers className="text-2xl text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalMembers || 0}</p>
                <p className="text-sm text-gray-500 mt-2">Active members in community</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600">Total Messages</h3>
                  <FiMessageSquare className="text-2xl text-green-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalMessages || 0}</p>
                <p className="text-sm text-gray-500 mt-2">Messages exchanged</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600">Active Today</h3>
                  <FiActivity className="text-2xl text-purple-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats?.activeMembers || 0}</p>
                <p className="text-sm text-gray-500 mt-2">Members active today</p>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <div className="card p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  variant="primary"
                  className="w-full justify-center"
                  onClick={() => setShowInviteModal(true)}
                >
                  <FiUserPlus className="mr-2" />
                  Invite Members
                </Button>

                <Button
                  variant="secondary"
                  className="w-full justify-center"
                  onClick={() => setShowAddModeratorModal(true)}
                >
                  <FiShield className="mr-2" />
                  Add Moderator
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-center"
                  onClick={() => setShowBulkUploadModal(true)}
                >
                  <FiUpload className="mr-2" />
                  Bulk Upload
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-center"
                  onClick={() => setShowSettingsModal(true)}
                >
                  <FiSettings className="mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>
        );

      case 'members':
        return (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Community Members</h3>
              <Button onClick={fetchMembers}>
                Refresh
              </Button>
            </div>

            {members.length === 0 ? (
              <div className="text-center py-12">
                <FiUsers className="mx-auto text-5xl text-gray-400 mb-4" />
                <p className="text-gray-600">No members found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Member</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Username</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Joined</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => (
                      <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold">
                              {member.fullName?.charAt(0).toUpperCase() || member.username?.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-900">{member.fullName || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{member.username}</td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              member.role === 'ADMINISTRATOR' ? 'primary' :
                              member.role === 'MODERATOR' ? 'info' :
                              'secondary'
                            }
                          >
                            {member.role}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {new Date(member.joinedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {member.role === 'MEMBER' && member.id !== user?.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveMember(member.id)}
                            >
                              <FiUserMinus className="mr-2" />
                              Remove
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case 'joinRequests':
        return (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Join Requests</h3>
              <Button onClick={fetchJoinRequests}>
                Refresh
              </Button>
            </div>

            {joinRequests.length === 0 ? (
              <div className="text-center py-12">
                <FiUserPlus className="mx-auto text-5xl text-gray-400 mb-4" />
                <p className="text-gray-600">No pending join requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {joinRequests.map((request) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-lg">
                        {request.username?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{request.username}</p>
                        <p className="text-sm text-gray-600">
                          Requested {new Date(request.requestedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleApproveRequest(request.id)}
                      >
                        <FiCheckCircle className="mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRejectRequest(request.id)}
                      >
                        <FiXCircle className="mr-2" />
                        Reject
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRequest(request.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <FiTrash2 className="mr-2" />
                        Delete
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        );

      case 'invites':
        return (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Sent Invites</h3>
              <div className="flex space-x-2">
                <Button onClick={() => setShowInviteModal(true)}>
                  <FiUserPlus className="mr-2" />
                  Send Invite
                </Button>
                <Button variant="ghost" onClick={fetchInvites}>
                  Refresh
                </Button>
              </div>
            </div>

            {invites.length === 0 ? (
              <div className="text-center py-12">
                <FiUserPlus className="mx-auto text-5xl text-gray-400 mb-4" />
                <p className="text-gray-600">No invites sent yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Sent</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invites.map((invite) => (
                      <tr key={invite.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900">{invite.email}</td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              invite.status === 'ACCEPTED' ? 'success' :
                              invite.status === 'PENDING' ? 'warning' :
                              'danger'
                            }
                          >
                            {invite.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {new Date(invite.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {invite.status === 'PENDING' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCancelInvite(invite.id)}
                              >
                                <FiXCircle className="mr-2" />
                                Cancel
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteInvite(invite.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <FiTrash2 className="mr-2" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case 'moderators':
        return (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Moderators</h3>
              <div className="flex space-x-2">
                <Button onClick={() => setShowAddModeratorModal(true)}>
                  <FiShield className="mr-2" />
                  Add Moderator
                </Button>
                <Button variant="ghost" onClick={fetchModerators}>
                  Refresh
                </Button>
              </div>
            </div>

            {moderators.length === 0 ? (
              <div className="text-center py-12">
                <FiShield className="mx-auto text-5xl text-gray-400 mb-4" />
                <p className="text-gray-600">No moderators assigned yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {moderators.map((moderator) => (
                  <motion.div
                    key={moderator.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="card p-4"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold">
                        {moderator.fullName?.charAt(0).toUpperCase() || moderator.username?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{moderator.fullName || moderator.username}</p>
                        <p className="text-sm text-gray-600">@{moderator.username}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="info">Moderator</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveModerator(moderator.id)}
                      >
                        <FiTrash2 />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        );

      case 'bulkUpload':
        return (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Bulk Upload History</h3>
              <div className="flex space-x-2">
                <Button onClick={handleDownloadTemplate}>
                  <FiDownload className="mr-2" />
                  Download Template
                </Button>
                <Button variant="primary" onClick={() => setShowBulkUploadModal(true)}>
                  <FiUpload className="mr-2" />
                  Upload
                </Button>
              </div>
            </div>

            {uploadHistories.length === 0 ? (
              <div className="text-center py-12">
                <FiUpload className="mx-auto text-5xl text-gray-400 mb-4" />
                <p className="text-gray-600">No upload history</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Successful</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Failed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadHistories.map((history) => (
                      <tr key={history.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900">
                          {new Date(history.uploadedAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              history.status === 'COMPLETED' ? 'success' :
                              history.status === 'PROCESSING' ? 'warning' :
                              'danger'
                            }
                          >
                            {history.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{history.totalRecords}</td>
                        <td className="py-3 px-4 text-green-600">{history.successfulRecords}</td>
                        <td className="py-3 px-4 text-red-600">{history.failedRecords}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case 'settings':
        // Only administrators can access settings
        if (community?.role !== 'ADMINISTRATOR') {
          return (
            <div className="card p-6">
              <div className="text-center py-12">
                <FiShield className="mx-auto text-6xl text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h3>
                <p className="text-gray-600">Only administrators can access community settings.</p>
              </div>
            </div>
          );
        }
        
        return (
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Community Settings</h3>
              
              <form onSubmit={handleUpdateSettings} className="space-y-6 max-w-2xl">
                <Input
                  label="Community Name"
                  value={communitySettings.name}
                  onChange={(e) => setCommunitySettings(prev => ({ ...prev, name: e.target.value }))}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={communitySettings.description}
                    onChange={(e) => setCommunitySettings(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="input w-full"
                    placeholder="Enter community description..."
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={communitySettings.isPrivate}
                    onChange={(e) => setCommunitySettings(prev => ({ ...prev, isPrivate: e.target.checked }))}
                    className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="isPrivate" className="text-sm font-medium text-gray-700">
                    Private Community
                  </label>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => navigate(`/community/${communityId}`)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    <FiCheckCircle className="mr-2" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>

            {/* Danger Zone */}
            <div className="card p-6 border-2 border-red-200">
              <h3 className="text-xl font-bold text-red-600 mb-2 flex items-center">
                <FiTrash2 className="mr-2" />
                Danger Zone
              </h3>
              <p className="text-gray-600 mb-4">
                Once you delete a community, there is no going back. Please be certain.
              </p>
              <Button
                variant="ghost"
                onClick={handleDeleteCommunity}
                className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-300"
              >
                <FiTrash2 className="mr-2" />
                Delete Community
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="glass border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate(`/community/${communityId}`)}>
                <FiArrowLeft className="mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                  Admin Panel
                </h1>
                <p className="text-sm text-gray-600 mt-1">{community?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex items-center space-x-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-2">
                <tab.icon />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {tab.badge}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Invite Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Send Invite"
      >
        <form onSubmit={handleSendInvite} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Enter email address"
            required
          />
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="ghost" onClick={() => setShowInviteModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Send Invite</Button>
          </div>
        </form>
      </Modal>

      {/* Add Moderator Modal */}
      <Modal
        isOpen={showAddModeratorModal}
        onClose={() => setShowAddModeratorModal(false)}
        title="Add Moderator"
      >
        <form onSubmit={handleAddModerator} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Member
            </label>
            <select
              value={selectedMember?.id || ''}
              onChange={(e) => setSelectedMember(members.find(m => m.id === parseInt(e.target.value)))}
              className="input w-full"
              required
            >
              <option value="">Choose a member...</option>
              {members
                .filter(m => m.role === 'MEMBER')
                .map(member => (
                  <option key={member.id} value={member.id}>
                    {member.fullName || member.username} (@{member.username})
                  </option>
                ))}
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="ghost" onClick={() => setShowAddModeratorModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Moderator</Button>
          </div>
        </form>
      </Modal>

      {/* Bulk Upload Modal */}
      <Modal
        isOpen={showBulkUploadModal}
        onClose={() => setShowBulkUploadModal(false)}
        title="Bulk Upload Members"
      >
        <form onSubmit={handleBulkUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CSV File
            </label>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-primary-50 file:text-primary-700
                hover:file:bg-primary-100
                cursor-pointer"
              required
            />
            <p className="text-xs text-gray-500 mt-2">
              Upload a CSV file with member information. Download the template to see the required format.
            </p>
          </div>
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="ghost" onClick={() => setShowBulkUploadModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Upload</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminPanelPage;
