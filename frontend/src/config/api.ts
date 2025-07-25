import type {
  IBackendRes,
  IAccount,
  IUser,
  IGetAccount,
  ITask,
  ICreateTask,
  IUpdateTask,
  IRegisterRequest,
  IChangePasswordRequest,
  IUpdateProfileRequest
} from '@/types/backend';
import axios from './axios-customize';

/**
 * Auth Module
 */
export const callLogin = (email: string, password: string) => {
  return axios.post<IAccount>('/auth/login', { email, password });
}

export const callRegister = (data: IRegisterRequest) => {
  return axios.post<IAccount>('/auth/register', data);
}

export const callFetchAccount = () => {
  return axios.get<IGetAccount>('/users/profile');
}

export const callRefreshToken = (refreshToken: string) => {
  return axios.post<IBackendRes<{ access_token: string }>>('/auth/refresh', { refreshToken });
}

export const callLogout = () => {
  return axios.post<IBackendRes<string>>('/auth/logout');
}

/**
 * User Module
 */
export const callGetProfile = () => {
  return axios.get<IBackendRes<IUser>>('/users/profile');
}

export const callUpdateProfile = (data: IUpdateProfileRequest) => {
  return axios.put<IBackendRes<IUser>>('/users/profile', data);
}

export const callChangePassword = (data: IChangePasswordRequest) => {
  return axios.put<IBackendRes<string>>('/users/change-password', data);
}

/**
 * Task Module
 */
export const callGetTasks = (status?: string) => {
  const query = status ? `?status=${status}` : '';
  return axios.get<ITask[]>(`/tasks${query}`);
}

export const callGetTaskById = (id: number) => {
  return axios.get<ITask>(`/tasks/${id}`);
}

export const callCreateTask = (data: ICreateTask) => {
  return axios.post<ITask>('/tasks', data);
}

export const callUpdateTask = (id: number, data: IUpdateTask) => {
  return axios.put<ITask>(`/tasks/${id}`, data);
}

export const callDeleteTask = (id: number) => {
  return axios.delete(`/tasks/${id}`);
}
