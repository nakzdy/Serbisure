import axios from 'axios';

// Detect environment to switch between localhost and production
// Prefer a Vite-provided env var `VITE_API_URL` when available, otherwise
// default to localhost:8000 for local development and the deployed URL for prod.
const DEV_FALLBACK = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : 'http://192.168.1.4:8000';

const BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? DEV_FALLBACK
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

// Automatically handle unauthorized responses (401/403)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.warn("Unauthorized access detected. Clearing session...");
            localStorage.removeItem('serbisure_token');
            // Redirect to login if not already there
            if (window.location.pathname !== '/login') {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

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
    // Fetch only services created by the current worker
    getWorkerServices: async (providerId) => {
        const url = providerId ? `/api/v1/services/?provider=${providerId}` : '/api/v1/services/';
        const response = await api.get(url);
        const data = response.data.results || response.data.data || response.data;
        return data;
    },
    createService: async (data) => {
        const response = await api.post('/api/v1/services/', data);
        return unwrap(response);
    },
    updateService: async (id, data) => {
        const response = await api.patch(`/api/v1/services/${id}/`, data);
        return unwrap(response);
    },
    deleteService: async (id) => {
        const response = await api.delete(`/api/v1/services/${id}/`);
        return response.data;
    }
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
    updateBooking: async (id, data) => {
        const response = await api.patch(`/api/v1/bookings/${id}/`, data);
        return unwrap(response);
    },
    deleteBooking: async (id) => {
        const response = await api.delete(`/api/v1/bookings/${id}/`);
        return response.data;
    }
};

export const openJobsAPI = {
    getOpenJobs: async () => {
        const response = await api.get('/api/v1/open-jobs/');
        return response.data.results || response.data.data || response.data;
    },
    acceptJob: async (bookingId) => {
        const response = await api.patch(`/api/v1/open-jobs/${bookingId}/accept/`);
        return response.data;
    }
};

export default api;
