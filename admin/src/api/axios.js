import axios from 'axios';
import { API_BASE_URL } from '../config/env';

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Inject Bearer token on every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('thsti_admin_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// On 401, clear cached credentials and redirect to login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error('[AXIOS] 401 UNAUTHORIZED ON URL:', error.config.url);
            localStorage.removeItem('thsti_admin_token');
            localStorage.removeItem('thsti_admin_user');
            localStorage.removeItem('thsti_admin_refresh');
            // Only redirect if not already on login page
            if (window.location.pathname !== '/') {
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
