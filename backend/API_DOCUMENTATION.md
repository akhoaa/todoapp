# ToDo App API Documentation

## Base URL
- **Development**: `http://localhost:3000`
- **Production**: `https://your-domain.com`

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### 🔐 Authentication Endpoints

#### POST /auth/login
Login with email and password.
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "access_token": "jwt-token",
  "refresh_token": "refresh-token",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "roles": "user"
  }
}
```

#### POST /auth/register
Register a new user.
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### POST /auth/refresh
Refresh access token.
```json
{
  "refresh_token": "your-refresh-token"
}
```

#### GET /auth/profile
Get current user profile (requires authentication).

#### POST /auth/logout
Logout user (requires authentication).

### 👤 User Endpoints

#### GET /users/profile
Get current user profile (requires authentication).

#### PUT /users/profile
Update current user profile (requires authentication).
```json
{
  "name": "Updated Name",
  "avatar": "https://example.com/avatar.png"
}
```

#### PUT /users/change-password
Change password (requires authentication).
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword123"
}
```

#### GET /users/statistics
Get system statistics (admin only).

#### GET /users
Get all users (admin only).

#### GET /users/:id
Get user by ID (admin only).

### 📝 Task Endpoints

#### GET /tasks
Get user's tasks (requires authentication).
**Query Parameters:**
- `status` (optional): Filter by status (`PENDING`, `IN_PROGRESS`, `COMPLETED`)

#### GET /tasks/:id
Get task by ID (requires authentication).

#### POST /tasks
Create new task (requires authentication).
```json
{
  "title": "Task Title",
  "description": "Task Description",
  "status": "PENDING"
}
```

#### PUT /tasks/:id
Update task (requires authentication, ownership check).
```json
{
  "title": "Updated Title",
  "description": "Updated Description",
  "status": "COMPLETED"
}
```

#### DELETE /tasks/:id
Delete task (requires authentication, ownership check).

### 🏥 Health Check

#### GET /health
Check application health status.
```json
{
  "status": "ok",
  "timestamp": "2025-07-20T09:00:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "version": "1.0.0"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["Validation error messages"],
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

## Rate Limiting
- **Short**: 3 requests per second
- **Medium**: 20 requests per 10 seconds  
- **Long**: 100 requests per minute

## CORS
The API supports CORS for the following origins:
- `http://localhost:3000` (React default)
- `http://localhost:3001` (Alternative React port)
- `http://localhost:5173` (Vite default)
- `http://localhost:4200` (Angular default)

## Swagger Documentation
Interactive API documentation is available at:
- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`
