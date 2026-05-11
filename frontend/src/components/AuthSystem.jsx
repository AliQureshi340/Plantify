import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, Mail, Lock, Phone, MapPin, Upload, Eye, EyeOff, X, Send, Shield, CheckCircle, Clock } from 'lucide-react';

// ==================== AUTH CONTEXT ====================

const AuthContext = createContext();
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false
      };
    case 'LOGOUT':
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false
      };
    case 'LOAD_USER':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false
      };
    case 'AUTH_ERROR':
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: action.payload
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    isAuthenticated: false,
    user: null,
    token: localStorage.getItem('token'),
    loading: true,
    error: null
  });

  // Check if user is logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        dispatch({
          type: 'LOAD_USER',
          payload: { token, user: parsedUser }
        });
      } catch (error) {
        dispatch({ type: 'AUTH_ERROR', payload: 'Invalid stored data' });
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // API call helper with auth
  const authFetch = async (url, options = {}) => {
    const token = state.token || localStorage.getItem('token');
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

    const response = await fetch(`${API_BASE}${url}`, config);
    
    if (response.status === 401) {
      dispatch({ type: 'LOGOUT' });
      throw new Error('Session expired. Please login again.');
    }

    return response;
  };

  // Send OTP function
  const sendOTP = async (email, userType) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role: userType })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Auth functions
  const login = async (email, password, userType, otp) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, expectedRole: userType, otp })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      dispatch({
        type: 'LOGIN',
        payload: { token: data.token, user: data.user }
      });

      return { success: true, user: data.user };
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const formData = new FormData();
      Object.keys(userData).forEach(key => {
        if (userData[key] !== null && userData[key] !== undefined) {
          formData.append(key, userData[key]);
        }
      });

      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      dispatch({
        type: 'LOGIN',
        payload: { token: data.token, user: data.user }
      });

      return { success: true, user: data.user };
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = async (userData) => {
    try {
      const formData = new FormData();
      Object.keys(userData).forEach(key => {
        if (userData[key] !== null && userData[key] !== undefined) {
          formData.append(key, userData[key]);
        }
      });

      const response = await authFetch('/api/auth/profile', {
        method: 'PUT',
        body: formData
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Profile update failed');
      }

      dispatch({
        type: 'LOAD_USER',
        payload: { token: state.token, user: data.user }
      });

      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    authFetch,
    sendOTP,
    clearError: () => dispatch({ type: 'CLEAR_ERROR' })
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ==================== IMPROVED LOGIN/REGISTER MODAL ====================

export const AuthModal = ({ isOpen, onClose, initialMode = 'login', userType = 'user' }) => {
  const [mode, setMode] = React.useState(initialMode);
  const [showPassword, setShowPassword] = React.useState(false);
  const [currentUserType, setCurrentUserType] = React.useState(userType);
  const [loginStep, setLoginStep] = React.useState(1); // 1: credentials, 2: OTP
  const [otpCountdown, setOtpCountdown] = React.useState(0);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    role: userType,
    profileImage: null,
    otp: ''
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');

  const { login, register, sendOTP } = useAuth();

  // Countdown timer for OTP
  React.useEffect(() => {
    let timer;
    if (otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpCountdown]);

  // Update form data when userType changes
  React.useEffect(() => {
    setCurrentUserType(userType);
    setFormData(prev => ({ ...prev, role: userType }));
  }, [userType]);

  // Reset form when modal opens/closes or mode changes
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        role: currentUserType,
        profileImage: null,
        otp: ''
      });
      setError('');
      setSuccessMessage('');
      setLoginStep(1);
      setOtpCountdown(0);
    }
  }, [isOpen, mode, currentUserType]);

  const handleSendOTP = async () => {
    if (!formData.email || !formData.password) {
      setError('Please enter email and password first');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    const result = await sendOTP(formData.email, currentUserType);
    if (result.success) {
      setLoginStep(2);
      setSuccessMessage(`OTP sent to ${formData.email}! Please check your inbox.`);
      setOtpCountdown(300); // 5 minutes countdown
      setError('');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleResendOTP = async () => {
    setLoading(true);
    const result = await sendOTP(formData.email, currentUserType);
    if (result.success) {
      setSuccessMessage('New OTP sent! Please check your inbox.');
      setOtpCountdown(300);
      setError('');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        if (loginStep === 1) {
          // First step: Send OTP
          await handleSendOTP();
          return;
        } else {
          // Second step: Verify OTP and login
          if (!formData.otp || formData.otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            setLoading(false);
            return;
          }

          const result = await login(formData.email, formData.password, currentUserType, formData.otp);
          if (result.success) {
            onClose();
            // Redirect based on role
            if (result.user.role === 'admin') {
              window.location.href = '/admin/drives';
            } else if (result.user.role === 'nursery') {
              window.location.href = '/nursery';
            } else {
              window.location.href = '/user';
            }
          } else {
            setError(result.error);
          }
        }
      } else {
        // Registration
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters long');
          setLoading(false);
          return;
        }

        const result = await register(formData);
        if (result.success) {
          onClose();
          // Redirect based on role
          if (result.user.role === 'admin') {
            window.location.href = '/admin/drives';
          } else if (result.user.role === 'nursery') {
            window.location.href = '/nursery';
          } else {
            window.location.href = '/user';
          }
        } else {
          setError(result.error);
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
    if (error) setError('');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-sm text-gray-600">
              {currentUserType === 'nursery' ? 'Nursery Owner Portal' : 'Plant Enthusiast Portal'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            <X />
          </button>
        </div>

        {/* User Type Indicator */}
        <div className={`p-3 rounded-lg mb-6 text-center border-2 ${
          currentUserType === 'nursery' 
            ? 'bg-green-50 border-green-500 text-green-700' 
            : 'bg-blue-50 border-blue-500 text-blue-700'
        }`}>
          <strong>
            {currentUserType === 'nursery' 
              ? '🌿 Nursery Owner Portal' 
              : '🌱 Plant Enthusiast Portal'}
          </strong>
        </div>

        {/* Login Step Indicator */}
        {mode === 'login' && (
          <div className="flex items-center justify-center mb-6">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold mr-2 ${
              loginStep >= 1 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className={`w-12 h-1 rounded mr-2 ${loginStep >= 2 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
              loginStep >= 2 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
            <span className="ml-3 text-sm text-gray-600">
              {loginStep === 1 ? 'Enter Credentials' : 'Verify OTP'}
            </span>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Registration Fields */}
          {mode === 'register' && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {currentUserType === 'nursery' ? 'Nursery Name *' : 'Full Name *'}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder={currentUserType === 'nursery' ? 'Enter nursery name' : 'Enter your full name'}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="03001234567"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    placeholder={currentUserType === 'nursery' ? 'Nursery location' : 'Your address'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="12345"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {currentUserType === 'nursery' ? 'Nursery Logo (Optional)' : 'Profile Picture (Optional)'}
                </label>
                <div className="relative">
                  <Upload className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <input
                    type="file"
                    name="profileImage"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email Field */}
          {(mode === 'register' || loginStep === 1) && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={mode === 'login' && loginStep === 2}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50"
                  placeholder="your@email.com"
                />
              </div>
            </div>
          )}

          {/* Password Field */}
          {(mode === 'register' || loginStep === 1) && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={mode === 'login' && loginStep === 2}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                  disabled={mode === 'login' && loginStep === 2}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          {/* Confirm Password (Register only) */}
          {mode === 'register' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Confirm password"
                />
              </div>
            </div>
          )}

          {/* OTP Input (Login Step 2) */}
          {mode === 'login' && loginStep === 2 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Enter 6-Digit OTP Code *</label>
              <div className="relative">
                <Shield className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleInputChange}
                  required
                  maxLength="6"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-xl font-mono tracking-widest"
                  placeholder="000000"
                />
              </div>
              
              {/* OTP Timer and Resend */}
              <div className="text-center mt-4">
                {otpCountdown > 0 ? (
                  <p className="text-sm text-gray-600 flex items-center justify-center">
                    <Clock className="w-4 h-4 mr-1" />
                    OTP expires in: <span className="font-mono font-bold text-red-600 ml-1">{formatTime(otpCountdown)}</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="text-sm text-green-600 hover:text-green-700 underline disabled:opacity-50 flex items-center justify-center"
                  >
                    <Send className="w-4 h-4 mr-1" />
                    Resend OTP
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              currentUserType === 'nursery' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Please wait...
              </div>
            ) : mode === 'login' ? 
              (loginStep === 1 ? 'Send OTP to Email' : 'Verify OTP & Login') : 
              'Create Account'
            }
          </button>

          {/* Back button for OTP step */}
          {mode === 'login' && loginStep === 2 && (
            <button
              type="button"
              onClick={() => {
                setLoginStep(1);
                setOtpCountdown(0);
                setSuccessMessage('');
                setFormData(prev => ({ ...prev, otp: '' }));
              }}
              className="w-full mt-3 py-2 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ← Back to Credentials
            </button>
          )}

          {/* Switch Mode */}
          <div className="text-center mt-6">
            <span className="text-gray-600">
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
                setSuccessMessage('');
                setLoginStep(1);
                setOtpCountdown(0);
                setFormData({
                  name: '',
                  email: '',
                  password: '',
                  confirmPassword: '',
                  phone: '',
                  address: '',
                  city: '',
                  postalCode: '',
                  role: currentUserType,
                  profileImage: null,
                  otp: ''
                });
              }}
              className={`font-semibold underline hover:no-underline ${
                currentUserType === 'nursery' ? 'text-green-600' : 'text-blue-600'
              }`}
            >
              {mode === 'login' ? 'Sign up here' : 'Sign in here'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================== PROTECTED ROUTE COMPONENT ====================

export const ProtectedRoute = ({ children, requiredRole = null, fallback = null }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || (
      <div className="flex flex-col justify-center items-center h-screen text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
        <p className="text-gray-600">Please login to access this page</p>
      </div>
    );
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Unauthorized</h2>
        <p className="text-gray-600">You don't have permission to access this page</p>
      </div>
    );
  }

  return children;
};

// ==================== USER PROFILE COMPONENT ====================

export const UserProfile = () => {
  const { user, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    postalCode: user?.postalCode || '',
    profileImage: null
  });
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await updateProfile(formData);
    if (result.success) {
      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } else {
      setMessage(result.error);
    }
    setLoading(false);
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
          <div className="flex gap-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isEditing 
                  ? 'bg-gray-500 hover:bg-gray-600 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {message && (
          <div className={`p-4 mb-6 rounded-lg ${
            message.includes('success') 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {user.role === 'nursery' ? 'Nursery Name' : 'Full Name'}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="block text-sm font-medium text-gray-500 mb-1">
                  {user.role === 'nursery' ? 'Nursery Name' : 'Name'}
                </span>
                <span className="text-lg text-gray-800">{user.name}</span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-500 mb-1">Email</span>
                <span className="text-lg text-gray-800">{user.email}</span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-500 mb-1">Phone</span>
                <span className="text-lg text-gray-800">{user.phone || 'Not provided'}</span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-500 mb-1">Role</span>
                <span className="text-lg text-gray-800 capitalize">{user.role}</span>
              </div>
            </div>
            <div>
              <span className="block text-sm font-medium text-gray-500 mb-1">Address</span>
              <span className="text-lg text-gray-800">{user.address || 'Not provided'}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="block text-sm font-medium text-gray-500 mb-1">City</span>
                <span className="text-lg text-gray-800">{user.city || 'Not provided'}</span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-500 mb-1">Postal Code</span>
                <span className="text-lg text-gray-800">{user.postalCode || 'Not provided'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
