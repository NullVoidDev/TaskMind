export interface IUser {
  _id: string;
  email: string;
  password: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBoard {
  _id: string;
  title: string;
  description?: string;
  owner: string;
  members: string[];
  lists: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IList {
  _id: string;
  title: string;
  board: string;
  tasks: string[];
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITask {
  _id: string;
  title: string;
  description?: string;
  list: string;
  board: string;
  assignedTo?: string[];
  labels: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in-progress' | 'review' | 'done';
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  position: number;
  aiSuggestions?: {
    suggestedPriority?: 'low' | 'medium' | 'high' | 'urgent';
    suggestedDueDate?: Date;
    improvedDescription?: string;
    estimatedComplexity?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ILabel {
  _id: string;
  name: string;
  color: string;
  board: string;
}

export interface AITaskAnalysis {
  suggestedPriority: 'low' | 'medium' | 'high' | 'urgent';
  suggestedDueDate: Date;
  estimatedHours: number;
  complexityScore: number;
  improvedDescription?: string;
  reasoning: string;
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