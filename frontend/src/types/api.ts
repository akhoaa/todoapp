export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface Statistics {
  totalUsers: number;
  totalTasks: number;
  usersByRole: Record<string, number>;
  tasksByStatus: Record<string, number>;
}
