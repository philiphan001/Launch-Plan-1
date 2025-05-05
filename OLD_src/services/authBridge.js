import axios from 'axios';

// Assume API_URL is defined in your environment variables
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * This service bridges Firebase Authentication with your Python backend.
 * It handles sending Firebase tokens to your backend and storing session tokens.
 */

// Store the session token in localStorage
const setSessionToken = (token) => {
  localStorage.setItem('session_token', token);
};

// Get the session token from localStorage
const getSessionToken = () => {
  return localStorage.getItem('session_token');
};

// Remove the session token from localStorage
const removeSessionToken = () => {
  localStorage.removeItem('session_token');
};

// Create axios instance with authorization header
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = getSessionToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle authentication with the backend
const authenticateWithBackend = async (firebaseUser) => {
  try {
    // Get the Firebase ID token
    const idToken = await firebaseUser.getIdToken();
    
    // Send the token to your backend
    const response = await axios.post(`${API_URL}/auth/firebase-login`, {
      firebase_token: idToken
    });
    
    // Store the session token from your backend
    if (response.data && response.data.session_token) {
      setSessionToken(response.data.session_token);
      return response.data;
    } else {
      throw new Error('No session token received from backend');
    }
  } catch (error) {
    console.error('Backend authentication error:', error);
    throw error;
  }
};

// Log out from the backend
const logoutFromBackend = async () => {
  try {
    if (getSessionToken()) {
      await api.post('/auth/logout');
      removeSessionToken();
    }
  } catch (error) {
    console.error('Backend logout error:', error);
  } finally {
    removeSessionToken();
  }
};

// Get the current authenticated user from the backend
const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/user');
    return response.data;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

export {
  authenticateWithBackend,
  logoutFromBackend,
  getCurrentUser,
  api, // Export API instance for other services to use
  getSessionToken,
  setSessionToken,
  removeSessionToken
};