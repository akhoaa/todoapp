export interface IBackendRes<T> {
  error?: string | string[];
  message: string;
  statusCode: number | string;
  data?: T;
}

export interface IAccount {
  access_token: string;
  refresh_token: string;
  user: IUser;
}

export interface IUser {
  id: number;
  email: string;
  name?: string;
  avatar?: string;
  roles: string; // Legacy role field
  rbacRoles?: IRole[];
  permissions?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IGetAccount {
  user: IUser;
}

export interface ITask {
  id: number;
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  userId: number;
  projectId?: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  project?: {
    id: number;
    name: string;
    status: string;
    ownerId?: number;
  };
}

export interface ICreateTask {
  title: string;
  description?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  projectId?: number;
}

export interface IUpdateTask {
  title?: string;
  description?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  projectId?: number;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface IChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface IUpdateProfileRequest {
  name?: string;
  avatar?: string;
}

export interface IModelPaginate<T> {
  meta: {
    current: number;
    pageSize: number;
    pages: number;
    total: number;
  };
  result: T[];
}

// RBAC Types
export interface IRole {
  id: number;
  name: string;
  description?: string;
  permissions?: IPermission[];
  assignedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IPermission {
  id: number;
  name: string;
  description?: string;
  resource: string;
  action: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IAssignRoleRequest {
  roleId: number;
}

export interface ICreateUserRequest {
  email: string;
  password: string;
  name?: string;
}

export interface IUpdateUserRequest {
  name?: string;
  email?: string;
}

// Project Management Types
export interface IProject {
  id: number;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  ownerId: number;
  createdAt: string;
  updatedAt: string;
  owner?: {
    id: number;
    name: string;
    email: string;
  };
  tasks?: ITask[];
  members?: IProjectMember[];
  _count?: {
    tasks: number;
    members: number;
  };
}

export interface IProjectMember {
  id: number;
  userId: number;
  projectId: number;
  role: 'MEMBER' | 'MANAGER';
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface ICreateProject {
  name: string;
  description?: string;
  status?: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
}

export interface IUpdateProject {
  name?: string;
  description?: string;
  status?: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
}

export interface IAddProjectMember {
  userId: number;
  role?: 'MEMBER' | 'MANAGER';
}
