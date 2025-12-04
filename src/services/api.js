/**
 * API Service Configuration
 * 
 * This module configures axios for API communication with the backend.
 * The backend is hosted on Render.com and uses JWT for authentication.
 * 
 * @module api
 */

import axios from 'axios';

// Production backend URL (hosted on Render.com)
// Auth service handles: login, register, profile
export const API_URL = 'https://trackingapp-jbci.onrender.com';

/**
 * Axios instance configured with base URL and default headers
 * All API calls should use this instance for consistent configuration
 */
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 second timeout for slow cold starts on free tier
});

/**
 * Set or clear the JWT authentication token
 * Called after successful login to authorize subsequent requests
 * 
 * @param {string|null} token - JWT token from login, or null to clear
 */
export const setAuthToken = (token) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

/**
 * Authentication service methods
 * Handles user registration and login via the auth-service microservice
 */
export const authService = {
    /** Login with email and password, returns JWT token */
    login: (email, password) => api.post('/auth/login', { email, password }),

    /** Register new user with email, password and name */
    register: (email, password, name) => api.post('/auth/register', { email, password, name }),
};

export default api;

