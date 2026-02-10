import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiUsers, FiMessageSquare, FiSettings, FiCopy, 
  FiCheck, FiActivity, FiShield, FiLogOut 
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';

const CommunityHomePage = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [community, setCommunity] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchCommunityData();
  }, [communityId]);

  const fetchCommunityData = async () => {
    try {
      setLoading(true);
      
      // Fetch community details
      const communityRes = await api.communities.getById(communityId);
      setCommunity(communityRes.data);

      // Fetch community stats
      const statsRes = await api.statistics.getCommunity(communityId);
      setStats(statsRes.data);

      // TODO: Add recent activities endpoint in backend
      // For now, set empty activities
      setRecentActivities([]);
      
    } catch (error) {
      console.error('Error fetching community data:', error);
      toast.error('Failed to load community data');
    } finally {
      setLoading(false);
    }
  };

  const copyJoinCode = () => {
    if (community?.joinCode) {
      navigator.clipboard.writeText(community.joinCode);
      setCopied(true);
      toast.success('Join code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLeaveCommunity = async () => {
    if (!window.confirm('Are you sure you want to leave this community?')) {
      return;
    }

    try {
      await api.members.removeMember(communityId, user.id);
      toast.success('You have left the community');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error leaving community:', error);
      toast.error('Failed to leave community');
    }
  };

  const formatActivityType = (type) => {
    const typeMap = {
      'MEMBER_JOINED': '👋 Member joined',
      'MEMBER_LEFT': '👋 Member left',
      'MESSAGE_SENT': '💬 Message sent',
      'COMMUNITY_CREATED': '✨ Community created',
      'MODERATOR_ADDED': '🛡️ Moderator added',
      'ANNOUNCEMENT_CREATED': '📢 Announcement posted'
    };
    return typeMap[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Community not found</h2>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const isAdmin = community.role === 'ADMINISTRATOR';
  const isModerator = community.role === 'MODERATOR';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="glass border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                ← Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                  {community.name}
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant={community.isPrivate ? 'warning' : 'success'}>
                    {community.isPrivate ? 'Private' : 'Public'}
                  </Badge>
                  {isAdmin && <Badge variant="primary">Administrator</Badge>}
                  {isModerator && <Badge variant="info">Moderator</Badge>}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {(isAdmin || isModerator) && (
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/community/${communityId}/admin`)}
                >
                  <FiSettings className="mr-2" />
                  Admin Panel
                </Button>
              )}
              
              {!isAdmin && (
                <Button variant="ghost" onClick={handleLeaveCommunity}>
                  <FiLogOut className="mr-2" />
                  Leave Community
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-8 p-8 text-center bg-gradient-to-r from-primary-500 to-secondary-500"
        >
          <h2 className="text-3xl font-bold text-white mb-3">
            Welcome to {community.name}! 👋
          </h2>
          <p className="text-white/90 max-w-2xl mx-auto text-lg">
            {community.description || 'Connect, collaborate, and grow together with your community members.'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Members</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats?.totalMembers || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FiUsers className="text-2xl text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Messages</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats?.totalMessages || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <FiMessageSquare className="text-2xl text-green-600" />
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Active Members</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats?.activeMembers || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FiActivity className="text-2xl text-purple-600" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Community Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Community Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-start justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="text-sm text-gray-600">Community Name</p>
                    <p className="text-base font-medium text-gray-900 mt-1">{community.name}</p>
                  </div>
                </div>

                <div className="flex items-start justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="text-sm text-gray-600">Description</p>
                    <p className="text-base text-gray-900 mt-1">
                      {community.description || 'No description provided'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="text-sm text-gray-600">Privacy</p>
                    <p className="text-base font-medium text-gray-900 mt-1">
                      {community.isPrivate ? 'Private Community' : 'Public Community'}
                    </p>
                  </div>
                  <Badge variant={community.isPrivate ? 'warning' : 'success'}>
                    {community.isPrivate ? 'Private' : 'Public'}
                  </Badge>
                </div>

                {community.joinCode && (
                  <div className="flex items-start justify-between py-3 border-b border-gray-100">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-2">Join Code</p>
                      <div className="flex items-center space-x-3">
                        <code className="px-4 py-2 bg-gray-100 rounded-lg text-lg font-mono font-bold text-primary-500">
                          {community.joinCode}
                        </code>
                        <Button
                          variant="ghost"
                          onClick={copyJoinCode}
                          className="flex items-center space-x-2"
                        >
                          {copied ? (
                            <>
                              <FiCheck className="text-green-500" />
                              <span className="text-green-500">Copied!</span>
                            </>
                          ) : (
                            <>
                              <FiCopy />
                              <span>Copy</span>
                            </>
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Share this code with others to invite them to this community
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start justify-between py-3">
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="text-base text-gray-900 mt-1">
                      {new Date(community.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <Button
                  variant="primary"
                  className="w-full justify-center"
                  onClick={() => navigate(`/community/${communityId}/messages`)}
                >
                  <FiMessageSquare className="mr-2" />
                  View Messages
                </Button>

                <Button
                  variant="secondary"
                  className="w-full justify-center"
                  onClick={() => navigate(`/community/${communityId}/members`)}
                >
                  <FiUsers className="mr-2" />
                  View Members
                </Button>

                {(isAdmin || isModerator) && (
                  <Button
                    variant="ghost"
                    className="w-full justify-center"
                    onClick={() => navigate(`/community/${communityId}/admin`)}
                  >
                    <FiShield className="mr-2" />
                    Manage Community
                  </Button>
                )}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="card p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
              
              {recentActivities.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No recent activity
                </p>
              ) : (
                <div className="space-y-3">
                  {recentActivities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {formatActivityType(activity.activityType)}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {activity.description}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityHomePage;
