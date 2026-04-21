import axios from 'axios';

// Detect environment to switch between localhost and production
const BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8000'
    : 'https://serbisure-backend.vercel.app';

// Centralized API instance
const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Automatically attach Token to requests (Django Token Auth)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('serbisure_token');
    if (token) {
        config.headers.Authorization = `Token ${token}`;
    }
    return config;
});

// Helper to unwrap standard { status: "success", data: ... } response
const unwrap = (response) => response.data.data || response.data;

export const authAPI = {
    login: async (email, password) => {
        const response = await api.post('/api/v1/auth/login/', { email, password });
        const token = response.data.data?.token;
        if (token) {
            localStorage.setItem('serbisure_token', token);
        }
        return response.data.data;
    },
    register: async (userData) => {
        const response = await api.post('/api/v1/auth/register/', userData);
        if (response.data.data?.token) {
            localStorage.setItem('serbisure_token', response.data.data.token);
        }
        return response.data.data;
    },
    logout: () => {
        localStorage.removeItem('serbisure_token');
    },
    googleSync: async (userData) => {
        const response = await api.post('/api/v1/auth/google-sync/', userData);
        if (response.data.data?.token) {
            localStorage.setItem('serbisure_token', response.data.data.token);
        }
        return response.data.data;
    },
    getProfile: async () => {
        const response = await api.get('/api/v1/profile/');
        return unwrap(response);
    }
};

export const servicesAPI = {
    getServices: async () => {
        const response = await api.get('/api/v1/services/');
        // Return results for pagination support, fallback to data wrapper
        return response.data.results || response.data.data || response.data;
    },
};

export const bookingsAPI = {
    getBookings: async () => {
        const response = await api.get('/api/v1/bookings/');
        return response.data.results || response.data.data || response.data;
    },
    createBooking: async (bookingData) => {
        const response = await api.post('/api/v1/bookings/', bookingData);
        return unwrap(response);
    },
    deleteBooking: async (id) => {
        const response = await api.delete(`/api/v1/bookings/${id}/`);
        return response.data;
    }
};

export default api;
