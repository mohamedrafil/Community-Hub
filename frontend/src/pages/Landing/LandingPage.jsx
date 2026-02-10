import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FaRocket, FaUsers, FaLock, FaComments, FaChartLine, FaBolt, FaShieldAlt, 
  FaGlobeAmericas, FaArrowRight 
} from 'react-icons/fa';
import api from '../../services/api';
import Button from '../../components/Button';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    communities: 0,
    members: 0,
    messages: 0,
    activeNow: 0,
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      fetchStats();
    }
  }, [isAuthenticated]);

  const fetchStats = async () => {
    try {
      const response = await api.statistics.getGlobal();
      const data = response.data;
      setStats({
        communities: data.totalCommunities || 0,
        members: data.totalUsers || 0,
        messages: Math.floor((data.totalMessages || 0) / 1000),
        activeNow: data.activeNow || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Use default values
      setStats({
        communities: 12,
        members: 234,
        messages: 15,
        activeNow: 48,
      });
    }
  };

  const features = [
    {
      icon: FaUsers,
      title: 'Public & Private Communities',
      description: 'Customizable access controls and join codes',
      color: 'text-blue-500',
    },
    {
      icon: FaLock,
      title: 'Role-Based Access',
      description: 'Admin, Moderator, and Member roles with permissions',
      color: 'text-purple-500',
    },
    {
      icon: FaComments,
      title: 'Real-Time Messaging',
      description: 'Direct messages, group chats, and channels',
      color: 'text-green-500',
    },
    {
      icon: FaChartLine,
      title: 'Admin Dashboard',
      description: 'Analytics and member management tools',
      color: 'text-orange-500',
    },
    {
      icon: FaBolt,
      title: 'Lightning Fast',
      description: 'WebSocket-powered instant communication',
      color: 'text-yellow-500',
    },
    {
      icon: FaShieldAlt,
      title: 'Secure & Reliable',
      description: 'JWT authentication and encrypted data',
      color: 'text-red-500',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 glass"
      >
        <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaRocket className="text-3xl text-primary-500" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              Community Hub
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/login')}>
              Sign In
            </Button>
            <Button onClick={() => navigate('/register')}>
              Get Started
            </Button>
          </div>
        </nav>
      </motion.header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-8"
          >
            <h1 className="text-6xl md:text-7xl font-bold leading-tight">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-primary-500 via-purple-500 to-secondary-500 bg-clip-text text-transparent animate-pulse">
                Community Hub
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
              Enterprise-Grade Communication Platform for Teams and Communities
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={() => navigate('/register')}
                icon={FaRocket}
                className="text-lg px-8 py-4"
              >
                Get Started Free
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate('/login')}
                className="text-lg px-8 py-4"
              >
                Sign In
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              ✨ No credit card required • Free forever
            </p>
          </motion.div>

          {/* Floating Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16"
          >
            {[
              { label: 'Communities', value: stats.communities, icon: FaGlobeAmericas },
              { label: 'Real-time Messaging', value: '24/7', icon: FaComments },
              { label: 'Security', value: '100%', icon: FaShieldAlt },
              { label: 'Active Now', value: stats.activeNow, icon: FaBolt },
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05, rotate: 1 }}
                className="card text-center"
              >
                <stat.icon className="text-4xl text-primary-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-white/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600">Everything you need for seamless collaboration</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="card-hover card"
              >
                <feature.icon className={`text-5xl ${feature.color} mb-4`} />
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="glass rounded-3xl p-12 text-center">
            <h2 className="text-4xl font-bold mb-12">Join Thousands of Communities</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-5xl font-bold text-primary-500">{stats.communities}+</div>
                <div className="text-gray-600 mt-2">Active Communities</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-primary-500">{stats.members}+</div>
                <div className="text-gray-600 mt-2">Community Members</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-primary-500">{stats.messages}K+</div>
                <div className="text-gray-600 mt-2">Messages Sent</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-primary-500">{stats.activeNow}</div>
                <div className="text-gray-600 mt-2">Active Now</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="container mx-auto max-w-4xl text-center space-y-8"
        >
          <FaRocket className="text-6xl mx-auto animate-bounce-subtle" />
          <h2 className="text-5xl font-bold">Ready to Get Started?</h2>
          <p className="text-2xl opacity-90">
            Join thousands of communities already using Community Hub
          </p>
          <Button
            onClick={() => navigate('/register')}
            variant="secondary"
            className="text-lg px-8 py-4 bg-white text-primary-500 hover:bg-gray-50"
            icon={FaArrowRight}
          >
            Get Started Free
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-900 text-white text-center">
        <p>&copy; 2026 Community Hub. All rights reserved.</p>
        <div className="flex items-center justify-center gap-6 mt-4">
          <a href="#" className="hover:text-primary-400 transition-colors">Terms</a>
          <a href="#" className="hover:text-primary-400 transition-colors">Privacy</a>
          <a href="#" className="hover:text-primary-400 transition-colors">Contact</a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
