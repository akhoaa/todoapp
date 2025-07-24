# Todo App - Full Stack Application

A complete full-stack todo application built with NestJS backend and React frontend.

## Features

### Backend (NestJS)
- JWT Authentication (login, register, refresh tokens)
- User management with profile updates and password changes
- Task CRUD operations with status filtering
- Role-based access control
- CORS configuration for frontend integration
- TypeScript with proper decorators and validation

### Frontend (React + TypeScript)
- Modern React with hooks and functional components
- Redux Toolkit for state management
- Ant Design UI components
- Protected routes with JWT authentication
- Responsive design
- Task management with filtering and CRUD operations
- User profile management

## Tech Stack

### Backend
- **Framework**: NestJS
- **Database**: SQLite with TypeORM
- **Authentication**: JWT with bcryptjs
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: Redux Toolkit
- **UI Library**: Ant Design
- **HTTP Client**: Axios
- **Routing**: React Router DOM

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run start:dev
```

The backend will be available at `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Running Both Services

You can run both backend and frontend simultaneously:

1. **Terminal 1** (Backend):
```bash
cd backend && npm run start:dev
```

2. **Terminal 2** (Frontend):
```bash
cd frontend && npm run dev
```

## API Documentation

Once the backend is running, you can access the Swagger API documentation at:
`http://localhost:3000/api`

## Project Structure

```
todoapp/
├── backend/                 # NestJS backend
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── users/          # User management module
│   │   ├── task/           # Task management module
│   │   └── common/         # Shared utilities and decorators
│   └── package.json
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── redux/          # Redux store and slices
│   │   ├── config/         # API and axios configuration
│   │   └── types/          # TypeScript type definitions
│   └── package.json
└── README.md
```

## Key Features Implemented

### Authentication
- User registration and login
- JWT token-based authentication
- Automatic token refresh
- Protected routes
- User profile management

### Task Management
- Create, read, update, delete tasks
- Task status management (Pending, In Progress, Completed)
- Filter tasks by status
- User-specific task isolation

### UI/UX
- Responsive design
- Modern and clean interface
- Loading states and error handling
- Form validation
- Dashboard with statistics

## Environment Configuration

### Backend
The backend uses environment variables. Default configuration works out of the box.

### Frontend
Create a `.env` file in the frontend directory:
```
VITE_BACKEND_URL=http://localhost:3000
VITE_API_PREFIX=api
```

## Development Notes

- The backend uses SQLite database (file-based, no setup required)
- CORS is configured to allow frontend requests
- JWT tokens are stored in localStorage
- The application uses TypeScript throughout for type safety
- Redux Toolkit is used for efficient state management
- Ant Design provides a consistent and professional UI

## Building for Production

### Backend
```bash
cd backend && npm run build
```

### Frontend
```bash
cd frontend && npm run build
```

The built frontend files will be in the `frontend/dist` directory and can be served by any static file server.
