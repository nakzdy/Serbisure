import axios from 'axios';

const BASE_URL = 'https://serbisure-backend.vercel.app';

// Centralized API instance
const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Automatically attach Token to requests if it exists in localStorage
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('serbisure_token');
    if (token) {
        config.headers.Authorization = `Token ${token}`;
    }
    return config;
});

export const authAPI = {
    login: async (email, password) => {
        const response = await api.post('/api/auth/login/', { email, password });
        if (response.data.data && response.data.data.token) {
            localStorage.setItem('serbisure_token', response.data.data.token);
        }
        return response.data.data;
    },
    register: async (userData) => {
        const response = await api.post('/api/auth/register/', userData);
        if (response.data.data.token) {
            localStorage.setItem('serbisure_token', response.data.data.token);
        }
        return response.data.data;
    },
    logout: () => {
        localStorage.removeItem('serbisure_token');
    },
    googleSync: async (userData) => {
        const response = await api.post('/api/auth/google-sync/', userData);
        if (response.data.data.token) {
            localStorage.setItem('serbisure_token', response.data.data.token);
        }
        return response.data.data;
    }
};

export const servicesAPI = {
    getServices: async () => {
        const response = await api.get('/api/services/');
        return response.data;
    },
};

export const bookingsAPI = {
    getBookings: async () => {
        const response = await api.get('/api/bookings/');
        return response.data;
    },
    createBooking: async (bookingData) => {
        const response = await api.post('/api/bookings/', bookingData);
        return response.data;
    },
};

export default api;
