import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      console.log('checkAuth - storedToken:', storedToken);
      console.log('checkAuth - storedUser:', storedUser);

      // Check if values are valid (not "undefined" or "null" strings)
      if (storedToken && storedUser && 
          storedToken !== 'undefined' && storedToken !== 'null' &&
          storedUser !== 'undefined' && storedUser !== 'null') {
        const parsedUser = JSON.parse(storedUser);
        console.log('checkAuth - Setting user:', parsedUser);
        setToken(storedToken);
        setUser(parsedUser);
      } else {
        console.log('checkAuth - Invalid data, clearing localStorage');
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      // Clear corrupted data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    setLoading(false);
    console.log('checkAuth - Finished, loading set to false');
  };

  const login = async (credentials) => {
    try {
      console.log('Login - Calling API with credentials');
      const response = await api.auth.login(credentials);
      console.log('Login - Full API response:', response);
      console.log('Login - Response data:', response.data);
      
      // Backend returns flat structure, need to extract token and build user object
      const authToken = response.data.token;
      const userData = {
        userId: response.data.userId,
        email: response.data.email,
        username: response.data.username,
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        profileImageURL: response.data.profileImageURL,
      };
      
      console.log('Login - Extracted token:', authToken);
      console.log('Login - Built user object:', userData);

      if (!authToken || !userData.userId) {
        console.error('Login - Missing token or userId in response!');
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('Login - Saved to localStorage');
      
      setToken(authToken);
      setUser(userData);
      console.log('Login - Updated state');

      toast.success('Welcome back! 🎉');
      
      return { success: true };
    } catch (error) {
      console.error('Login - Error:', error);
      console.error('Login - Error response:', error.response);
      const message = error.response?.data?.message || error.message || 'Invalid email or password';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.auth.register(userData);
      
      // Backend returns flat structure, need to extract token and build user object
      const authToken = response.data.token;
      const newUser = {
        userId: response.data.userId,
        email: response.data.email,
        username: response.data.username,
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        profileImageURL: response.data.profileImageURL,
      };

      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      setToken(authToken);
      setUser(newUser);

      toast.success('Account created successfully! Welcome! 🎉');
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
    return { success: true };
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
