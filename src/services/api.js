import axios from 'axios';

// Point to local auth-service using computer's IP address (so phone can connect)
export const API_URL = 'http://172.29.23.29:3001';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const setAuthToken = (token) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

export const authService = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    register: (email, password, name) => api.post('/auth/register', { email, password, name }),
};

export default api;
