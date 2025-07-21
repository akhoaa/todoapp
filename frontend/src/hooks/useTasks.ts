import { useState, useEffect, useCallback } from 'react';
import { Task, TaskFilters, CreateTaskRequest, UpdateTaskRequest, TaskStatus } from '../types';
import { taskService } from '../services';

export const useTasks = (initialFilters?: TaskFilters) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TaskFilters>(initialFilters || {});

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await taskService.getTasks(filters);
      setTasks(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (data: CreateTaskRequest): Promise<Task> => {
    try {
      const newTask = await taskService.createTask(data);
      setTasks(prev => [newTask, ...prev]);
      return newTask;
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
      throw err;
    }
  };

  const updateTask = async (id: number, data: UpdateTaskRequest): Promise<Task> => {
    try {
      const updatedTask = await taskService.updateTask(id, data);
      setTasks(prev => prev.map(task => task.id === id ? updatedTask : task));
      return updatedTask;
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
      throw err;
    }
  };

  const deleteTask = async (id: number): Promise<void> => {
    try {
      await taskService.deleteTask(id);
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete task');
      throw err;
    }
  };

  const updateTaskStatus = async (id: number, status: TaskStatus): Promise<Task> => {
    return updateTask(id, { status });
  };

  const refetch = () => {
    fetchTasks();
  };

  return {
    tasks,
    loading,
    error,
    filters,
    setFilters,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    refetch,
  };
};
