import axios, { AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import {
  ApiResponse,
  AuthResponse,
  LoginData,
  RegisterData,
  Task,
  CreateTaskData,
  UpdateTaskData,
  User,
  UserStats,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only clear and redirect if it's from auth endpoints or if token is invalid
      const isAuthEndpoint = error.config?.url?.includes('/auth/');
      const token = Cookies.get('token');
      
      if (isAuthEndpoint || !token) {
        // Clear token and redirect to login
        Cookies.remove('token');
        Cookies.remove('user');
        // Use a small delay to prevent immediate redirect during rapid API calls
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
        }, 100);
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response: AxiosResponse<ApiResponse<AuthResponse>> = await api.post('/auth/login', data);
    return response.data.data!;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response: AxiosResponse<ApiResponse<AuthResponse>> = await api.post('/auth/register', data);
    return response.data.data!;
  },
};

// Tasks API
export const tasksAPI = {
  getTasks: async (params?: {
    status?: string;
    priority?: string;
    completed?: boolean;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<Task[]> => {
    const response: AxiosResponse<ApiResponse<Task[]>> = await api.get('/tasks', { params });
    return response.data.data!;
  },

  getTask: async (id: string): Promise<Task> => {
    const response: AxiosResponse<ApiResponse<Task>> = await api.get(`/tasks/${id}`);
    return response.data.data!;
  },

  createTask: async (data: CreateTaskData): Promise<Task> => {
    const response: AxiosResponse<ApiResponse<Task>> = await api.post('/tasks', data);
    return response.data.data!;
  },

  updateTask: async (id: string, data: UpdateTaskData): Promise<Task> => {
    const response: AxiosResponse<ApiResponse<Task>> = await api.put(`/tasks/${id}`, data);
    return response.data.data!;
  },

  deleteTask: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },

  toggleTask: async (id: string): Promise<Task> => {
    const response: AxiosResponse<ApiResponse<Task>> = await api.patch(`/tasks/${id}/toggle`);
    return response.data.data!;
  },

  reorderTasks: async (taskOrders: { id: string; sortOrder: number }[]): Promise<void> => {
    await api.patch('/tasks/reorder', { taskOrders });
  },
};

// Users API
export const usersAPI = {
  getProfile: async (): Promise<User> => {
    const response: AxiosResponse<ApiResponse<User>> = await api.get('/users/profile');
    return response.data.data!;
  },

  getStats: async (): Promise<UserStats> => {
    const response: AxiosResponse<ApiResponse<UserStats>> = await api.get('/users/stats');
    return response.data.data!;
  },
};

export default api;
