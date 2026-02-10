import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FaHome, FaPlus, FaSignInAlt, FaRocket, FaUsers, FaLock, 
  FaGlobeAmericas, FaSignOutAlt, FaCrown, FaShieldAlt, FaUserCircle,
  FaEnvelope, FaCheck, FaTimes, FaEllipsisV, FaDoorOpen 
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invitesLoading, setInvitesLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [activeView, setActiveView] = useState('communities'); // 'communities' or 'invites'
  const [communityMenuOpen, setCommunityMenuOpen] = useState(null);

  // Create community form
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    isPrivate: false,
  });
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  // Join community form
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    fetchCommunities();
    fetchInvites();
  }, []);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const response = await api.communities.getMyCommunities();
      setCommunities(response.data || []);
    } catch (error) {
      console.error('Error fetching communities:', error);
      toast.error('Failed to load communities');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvites = async () => {
    try {
      setInvitesLoading(true);
      const response = await api.invites.getMyInvites();
      setInvites(response.data || []);
    } catch (error) {
      console.error('Error fetching invites:', error);
    } finally {
      setInvitesLoading(false);
    }
  };

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    
    if (!createForm.name.trim()) {
      setCreateError('Community name is required');
      return;
    }

    setCreating(true);
    try {
      await api.communities.create(createForm);
      toast.success('Community created successfully! 🎉');
      setShowCreateModal(false);
      setCreateForm({ name: '', description: '', isPrivate: false });
      setCreateError('');
      fetchCommunities();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create community';
      setCreateError(message);
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  const handleJoinCommunity = async (e) => {
    e.preventDefault();
    
    if (!joinCode.trim()) {
      setJoinError('Join code is required');
      return;
    }

    setJoining(true);
    try {
      await api.communities.join(joinCode);
      toast.success('Successfully joined the community! 🎉');
      setShowJoinModal(false);
      setJoinCode('');
      setJoinError('');
      fetchCommunities();
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid join code';
      setJoinError(message);
      toast.error(message);
    } finally {
      setJoining(false);
    }
  };

  const handleAcceptInvite = async (token) => {
    try {
      await api.invites.accept(token);
      toast.success('Successfully joined the community! 🎉');
      fetchCommunities();
      fetchInvites();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to accept invite';
      toast.error(message);
    }
  };

  const handleLeaveCommunity = async (communityId, communityName) => {
    if (!window.confirm(`Are you sure you want to leave "${communityName}"?`)) {
      return;
    }

    try {
      await api.members.leaveCommunity(communityId);
      toast.success('Successfully left the community');
      fetchCommunities();
      setCommunityMenuOpen(null);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to leave community';
      toast.error(message);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMINISTRATOR':
        return FaCrown;
      case 'MODERATOR':
        return FaShieldAlt;
      default:
        return FaUserCircle;
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'ADMINISTRATOR':
        return 'warning';
      case 'MODERATOR':
        return 'primary';
      default:
        return 'success';
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-80 glass border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <FaRocket className="text-2xl text-primary-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              Community Hub
            </span>
          </div>
        </div>

        {/* Menu Section */}
        <div className="p-4 space-y-2 flex-1">
          <button 
            onClick={() => setActiveView('communities')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
              activeView === 'communities' 
                ? 'bg-primary-50 text-primary-700' 
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <FaHome />
            <span>My Communities</span>
          </button>

          <button
            onClick={() => setActiveView('invites')}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
              activeView === 'invites' 
                ? 'bg-primary-50 text-primary-700' 
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <FaEnvelope />
              <span>Received Invites</span>
            </div>
            {invites.length > 0 && (
              <span className="bg-primary-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {invites.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
          >
            <FaPlus />
            <span>Create Community</span>
          </button>

          <button
            onClick={() => setShowJoinModal(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
          >
            <FaSignInAlt />
            <span>Join Community</span>
          </button>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-gray-50">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 truncate">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-sm text-gray-600 truncate">{user?.email}</div>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              logout();
              navigate('/');
            }}
            icon={FaSignOutAlt}
            className="w-full"
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="glass border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              {activeView === 'communities' ? 'My Communities' : 'Received Invites'}
            </h1>
            {activeView === 'communities' && (
              <Button onClick={() => setShowCreateModal(true)} icon={FaPlus}>
                Create Community
              </Button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8">
          {activeView === 'communities' ? (
            // Communities View
            <>
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <LoadingSpinner size="large" text="Loading communities..." />
                </div>
              ) : communities.length === 0 ? (
                // Empty State
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-20"
                >
                  <FaUsers className="text-6xl text-gray-300 mx-auto mb-6" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">No Communities Yet</h2>
                  <p className="text-gray-600 mb-8">
                    Create your first community or join an existing one to get started
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <Button onClick={() => setShowCreateModal(true)} icon={FaPlus}>
                      Create Community
                    </Button>
                    <Button variant="secondary" onClick={() => setShowJoinModal(true)} icon={FaSignInAlt}>
                      Join Community
                    </Button>
                  </div>
                </motion.div>
              ) : (
                // Communities Grid
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {communities.map((community, index) => (
                    <motion.div
                      key={community.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                      className="card card-hover cursor-pointer relative"
                    >
                      <div onClick={() => navigate(`/community/${community.id}`)}>
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-xl font-bold text-gray-900">{community.name}</h3>
                          <Badge variant={community.isPrivate ? 'warning' : 'success'} icon={community.isPrivate ? FaLock : FaGlobeAmericas}>
                            {community.isPrivate ? 'Private' : 'Public'}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {community.description || 'No description available'}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <Badge variant={getRoleBadgeVariant(community.role)} icon={getRoleIcon(community.role)}>
                            {community.role}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {community.memberCount || 0} members
                          </span>
                        </div>
                      </div>
                      
                      {/* Leave Community Button */}
                      <div className="absolute top-16 right-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLeaveCommunity(community.id, community.name);
                          }}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Leave Community"
                        >
                          <FaDoorOpen className="text-lg" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          ) : (
            // Invites View
            <>
              {invitesLoading ? (
                <div className="flex items-center justify-center py-20">
                  <LoadingSpinner size="large" text="Loading invites..." />
                </div>
              ) : invites.length === 0 ? (
                // Empty State
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-20"
                >
                  <FaEnvelope className="text-6xl text-gray-300 mx-auto mb-6" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">No Pending Invites</h2>
                  <p className="text-gray-600 mb-8">
                    You don't have any pending community invitations
                  </p>
                </motion.div>
              ) : (
                // Invites List
                <div className="max-w-4xl mx-auto space-y-4">
                  {invites.map((invite, index) => (
                    <motion.div
                      key={invite.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="card"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {invite.communityName}
                          </h3>
                          <p className="text-gray-600 mb-3">
                            {invite.communityDescription || 'No description available'}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>Invited by: <strong>{invite.invitedBy}</strong></span>
                            <Badge variant={getRoleBadgeVariant(invite.roleType)}>
                              {invite.roleType}
                            </Badge>
                            <span>
                              Expires: {new Date(invite.expiresAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            icon={FaCheck}
                            onClick={() => handleAcceptInvite(invite.inviteToken)}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            icon={FaTimes}
                            onClick={() => {
                              setInvites(invites.filter(i => i.id !== invite.id));
                              toast.info('Invite declined');
                            }}
                          >
                            Decline
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create Community Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setCreateForm({ name: '', description: '', isPrivate: false });
          setCreateError('');
        }}
        title="Create New Community"
      >
        <form onSubmit={handleCreateCommunity} className="space-y-6">
          <Input
            label="Community Name"
            type="text"
            placeholder="Enter community name"
            value={createForm.name}
            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            error={createError}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              className="input min-h-[100px] resize-y"
              placeholder="Describe your community..."
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPrivate"
              checked={createForm.isPrivate}
              onChange={(e) => setCreateForm({ ...createForm, isPrivate: e.target.checked })}
              className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
            />
            <label htmlFor="isPrivate" className="text-sm text-gray-700">
              Make this a private community
              <p className="text-xs text-gray-500 mt-1">
                Private communities require admin approval for members to join
              </p>
            </label>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" loading={creating} className="flex-1">
              Create
            </Button>
          </div>
        </form>
      </Modal>

      {/* Join Community Modal */}
      <Modal
        isOpen={showJoinModal}
        onClose={() => {
          setShowJoinModal(false);
          setJoinCode('');
          setJoinError('');
        }}
        title="Join Community"
      >
        <form onSubmit={handleJoinCommunity} className="space-y-6">
          <Input
            label="Join Code"
            type="text"
            placeholder="Enter community join code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            error={joinError}
          />

          <p className="text-sm text-gray-600">
            Enter the unique join code provided by the community administrator
          </p>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowJoinModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" loading={joining} className="flex-1">
              Join
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DashboardPage;
