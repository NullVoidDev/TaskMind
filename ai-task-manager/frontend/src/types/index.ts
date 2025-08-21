export interface User {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Board {
  _id: string;
  title: string;
  description?: string;
  owner: User;
  members: User[];
  lists: List[];
  createdAt: string;
  updatedAt: string;
}

export interface List {
  _id: string;
  title: string;
  board: string;
  tasks: Task[];
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  list: string;
  board: string;
  assignedTo?: User[];
  labels: Label[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in-progress' | 'review' | 'done';
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  position: number;
  aiSuggestions?: {
    suggestedPriority?: 'low' | 'medium' | 'high' | 'urgent';
    suggestedDueDate?: string;
    improvedDescription?: string;
    estimatedComplexity?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Label {
  _id: string;
  name: string;
  color: string;
  board: string;
}

export interface DashboardMetrics {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  tasksInProgress: number;
  averageCompletionTime: number;
  productivityScore: number;
  tasksByPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  tasksByStatus: {
    todo: number;
    'in-progress': number;
    review: number;
    done: number;
  };
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  message?: string;
  data?: T;
  error?: string;
  details?: any;
}

export interface TaskFilters {
  boardId?: string;
  listId?: string;
  status?: string;
  priority?: string;
  search?: string;
  page?: number;
  limit?: number;
}