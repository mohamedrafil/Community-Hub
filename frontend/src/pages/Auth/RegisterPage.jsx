import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FaRocket, FaUser, FaEnvelope, FaLock, FaArrowLeft, FaCheck, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import Button from '../../components/Button';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const passwordRequirements = [
    { label: 'At least 8 characters', test: (pwd) => pwd.length >= 8 },
    { label: 'Contains uppercase letter', test: (pwd) => /[A-Z]/.test(pwd) },
    { label: 'Contains lowercase letter', test: (pwd) => /[a-z]/.test(pwd) },
    { label: 'Contains number', test: (pwd) => /\d/.test(pwd) },
    { label: 'Contains special character', test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);
    setLoading(false);
    
    if (result.success) {
      // Use window.location to force reload and pick up auth state
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 py-12">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative glass rounded-3xl p-10 w-full max-w-md shadow-2xl"
      >
        {/* Back to home */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-500 mb-6 transition-colors"
        >
          <FaArrowLeft />
          <span>Back to Home</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FaRocket className="text-4xl text-primary-500" />
            <span className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              Community Hub
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h1>
          <p className="text-gray-600">Join Community Hub today</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              type="text"
              name="firstName"
              placeholder="John"
              icon={FaUser}
              value={formData.firstName}
              onChange={handleChange}
              error={errors.firstName}
            />

            <Input
              label="Last Name"
              type="text"
              name="lastName"
              placeholder="Doe"
              icon={FaUser}
              value={formData.lastName}
              onChange={handleChange}
              error={errors.lastName}
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            name="email"
            placeholder="john.doe@example.com"
            icon={FaEnvelope}
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />

          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="Create a strong password"
            icon={FaLock}
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
          />

          {/* Password Requirements */}
          {formData.password && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-2 p-4 bg-gray-50 rounded-lg"
            >
              <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
              {passwordRequirements.map((req, index) => {
                const isValid = req.test(formData.password);
                return (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    {isValid ? (
                      <FaCheck className="text-green-500" />
                    ) : (
                      <FaTimes className="text-gray-400" />
                    )}
                    <span className={isValid ? 'text-green-600' : 'text-gray-500'}>
                      {req.label}
                    </span>
                  </div>
                );
              })}
            </motion.div>
          )}

          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            placeholder="Confirm your password"
            icon={FaLock}
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
          />

          <Button
            type="submit"
            loading={loading}
            className="w-full"
          >
            Create Account
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-500 font-semibold hover:text-primary-600 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
