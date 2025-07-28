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
  IUpdateProfileRequest,
  IProject,
  ICreateProject,
  IUpdateProject,
  IProjectMember,
  IAddProjectMember,
  IAssignRoleRequest
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
export const callGetUsers = () => {
  return axios.get<IUser[]>('/users');
}

export const callGetProfile = () => {
  return axios.get<IBackendRes<IUser>>('/users/profile');
}

export const callUpdateProfile = (data: IUpdateProfileRequest) => {
  return axios.put<IBackendRes<IUser>>('/users/profile', data);
}

export const callChangePassword = (data: IChangePasswordRequest) => {
  return axios.put<IBackendRes<string>>('/users/change-password', data);
}

export const callGetUserById = (id: number) => {
  return axios.get<IBackendRes<IUser>>(`/users/${id}`);
}

export const callCreateUser = (data: IRegisterRequest) => {
  return axios.post<IBackendRes<IUser>>('/users', data);
}

export const callUpdateUser = (id: number, data: IUpdateProfileRequest) => {
  return axios.put<IBackendRes<IUser>>(`/users/${id}`, data);
}

export const callDeleteUser = (id: number) => {
  return axios.delete<IBackendRes<string>>(`/users/${id}`);
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

/**
 * Project Module
 */
export const callGetProjects = () => {
  return axios.get<IProject[]>('/projects');
}

export const callGetProjectById = (id: number) => {
  return axios.get<IProject>(`/projects/${id}`);
}

export const callCreateProject = (data: ICreateProject) => {
  return axios.post<IProject>('/projects', data);
}

export const callUpdateProject = (id: number, data: IUpdateProject) => {
  return axios.put<IProject>(`/projects/${id}`, data);
}

export const callDeleteProject = (id: number) => {
  return axios.delete(`/projects/${id}`);
}

// Project Members
export const callGetProjectMembers = (projectId: number) => {
  return axios.get<IProjectMember[]>(`/projects/${projectId}/members`);
}

export const callAddProjectMember = (projectId: number, data: IAddProjectMember) => {
  return axios.post<IBackendRes<{ member: IProjectMember }>>(`/projects/${projectId}/members`, data);
}

export const callRemoveProjectMember = (projectId: number, memberId: number) => {
  return axios.delete(`/projects/${projectId}/members/${memberId}`);
}

/**
 * RBAC Module
 */
export const callGetUserRoles = (userId: number) => {
  return axios.get(`/users/${userId}/roles`);
}

export const callAssignRole = (userId: number, data: IAssignRoleRequest) => {
  return axios.post(`/users/${userId}/roles`, data);
}

export const callRemoveRole = (userId: number, roleId: number) => {
  return axios.delete(`/users/${userId}/roles/${roleId}`);
}
