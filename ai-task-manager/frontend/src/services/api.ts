import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  User, 
  Board, 
  Task, 
  DashboardMetrics, 
  AuthResponse, 
  TaskFilters 
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/register', {
      email,
      password,
      name,
    });
    return response.data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  }

  async getProfile(): Promise<{ user: User }> {
    const response = await this.api.get('/auth/profile');
    return response.data;
  }

  // Board methods
  async getBoards(): Promise<{ boards: Board[] }> {
    const response = await this.api.get('/boards');
    return response.data;
  }

  async getBoard(id: string): Promise<{ board: Board }> {
    const response = await this.api.get(`/boards/${id}`);
    return response.data;
  }

  async createBoard(title: string, description?: string): Promise<{ board: Board }> {
    const response = await this.api.post('/boards', { title, description });
    return response.data;
  }

  async updateBoard(id: string, updates: Partial<Board>): Promise<{ board: Board }> {
    const response = await this.api.put(`/boards/${id}`, updates);
    return response.data;
  }

  async deleteBoard(id: string): Promise<{ message: string }> {
    const response = await this.api.delete(`/boards/${id}`);
    return response.data;
  }

  async addBoardMember(boardId: string, email: string): Promise<{ board: Board }> {
    const response = await this.api.post(`/boards/${boardId}/members`, { email });
    return response.data;
  }

  // Task methods
  async getTasks(filters?: TaskFilters): Promise<{ tasks: Task[]; pagination: any }> {
    const response = await this.api.get('/tasks', { params: filters });
    return response.data;
  }

  async createTask(taskData: Partial<Task>): Promise<{ task: Task }> {
    const response = await this.api.post('/tasks', taskData);
    return response.data;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<{ task: Task }> {
    const response = await this.api.put(`/tasks/${id}`, updates);
    return response.data;
  }

  async deleteTask(id: string): Promise<{ message: string }> {
    const response = await this.api.delete(`/tasks/${id}`);
    return response.data;
  }

  async improveTaskDescription(
    id: string, 
    targetLength: 'concise' | 'detailed' = 'concise'
  ): Promise<{ improvedDescription: string; task: Task }> {
    const response = await this.api.post(`/tasks/${id}/improve-description`, {
      targetLength,
    });
    return response.data;
  }

  async getAISuggestions(id: string): Promise<{ suggestions: any; analysis: any }> {
    const response = await this.api.get(`/tasks/${id}/ai-suggestions`);
    return response.data;
  }

  // Dashboard methods
  async getDashboardMetrics(boardId?: string, timeRange?: string): Promise<{ metrics: DashboardMetrics }> {
    const response = await this.api.get('/dashboard/metrics', {
      params: { boardId, timeRange },
    });
    return response.data;
  }

  async getTaskAnalytics(boardId?: string, timeRange?: string): Promise<any> {
    const response = await this.api.get('/dashboard/analytics', {
      params: { boardId, timeRange },
    });
    return response.data;
  }
}

export const apiService = new ApiService();