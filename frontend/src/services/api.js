import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const message = error.response.data?.error || 'An error occurred';

      // Handle specific status codes
      if (error.response.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        window.location.href = '/login';
        toast.error('Session expired. Please login again.');
      } else if (error.response.status === 403) {
        toast.error('You do not have permission to perform this action');
      } else if (error.response.status === 404) {
        toast.error('Resource not found');
      } else {
        toast.error(message);
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
    } else {
      toast.error('An unexpected error occurred');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
};

// Student APIs
export const studentAPI = {
  getAll: (params) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  bulkCreate: (data) => api.post('/students/bulk', data),
};

// Room APIs
export const roomAPI = {
  getAll: (params) => api.get('/rooms', { params }),
  getStats: () => api.get('/rooms/stats'),
  getById: (id) => api.get(`/rooms/${id}`),
  create: (data) => api.post('/rooms', data),
  update: (id, data) => api.put(`/rooms/${id}`, data),
  delete: (id) => api.delete(`/rooms/${id}`),
};

// Exam APIs
export const examAPI = {
  getAll: (params) => api.get('/exams', { params }),
  getStats: () => api.get('/exams/stats'),
  getById: (id) => api.get(`/exams/${id}`),
  create: (data) => api.post('/exams', data),
  update: (id, data) => api.put(`/exams/${id}`, data),
  delete: (id) => api.delete(`/exams/${id}`),
};

// Allocation APIs
export const allocationAPI = {
  getAll: (params) => api.get('/allocations', { params }),
  getByExam: (examId) => api.get(`/allocations/exam/${examId}`),
  getById: (id) => api.get(`/allocations/${id}`),
  create: (data) => api.post('/allocations', data),
  updateStatus: (id, status) => api.put(`/allocations/${id}/status`, { status }),
  bulkUpdateStatus: (data) => api.put('/allocations/bulk-status', { allocations: data }),
  delete: (id) => api.delete(`/allocations/${id}`),
};

export default api;