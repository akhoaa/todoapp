import { apiService } from './api';
import {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskFilters,
  TaskStatus,
} from '../types';

class TaskService {
  async getTasks(filters?: TaskFilters): Promise<Task[]> {
    const params = filters ? { status: filters.status } : undefined;
    return apiService.get<Task[]>('/tasks', params);
  }

  async getTask(id: number): Promise<Task> {
    return apiService.get<Task>(`/tasks/${id}`);
  }

  async createTask(data: CreateTaskRequest): Promise<Task> {
    return apiService.post<Task>('/tasks', data);
  }

  async updateTask(id: number, data: UpdateTaskRequest): Promise<Task> {
    return apiService.put<Task>(`/tasks/${id}`, data);
  }

  async deleteTask(id: number): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(`/tasks/${id}`);
  }

  async updateTaskStatus(id: number, status: TaskStatus): Promise<Task> {
    return this.updateTask(id, { status });
  }

  // Helper methods for filtering
  async getPendingTasks(): Promise<Task[]> {
    return this.getTasks({ status: 'PENDING' });
  }

  async getInProgressTasks(): Promise<Task[]> {
    return this.getTasks({ status: 'IN_PROGRESS' });
  }

  async getCompletedTasks(): Promise<Task[]> {
    return this.getTasks({ status: 'COMPLETED' });
  }
}

export const taskService = new TaskService();
