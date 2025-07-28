# 🚀 TodoApp - Enterprise Project Management System

A comprehensive full-stack project management application with advanced role-based access control (RBAC), built with modern technologies and production-ready architecture.

## 📋 Overview

TodoApp has evolved from a simple task management tool into a sophisticated project management platform featuring:

- **Multi-user collaboration** with role-based permissions
- **Project-centric workflow** with team member management
- **Advanced task assignment** and tracking capabilities
- **Enterprise-grade security** with JWT authentication and RBAC
- **Production-ready architecture** with comprehensive validation and error handling

## ✨ Key Features

### 🔐 Role-Based Access Control (RBAC)
- **Three-tier role system**: Admin, Manager, User
- **Granular permissions** for fine-grained access control
- **Dynamic permission checking** on both frontend and backend
- **Secure API endpoints** with permission-based guards

### 📊 Project Management
- **Complete project lifecycle** management (Create, Read, Update, Delete)
- **Team collaboration** with member invitation and role assignment
- **Project-task relationships** with seamless integration
- **Project status tracking** (Active, Completed, Archived)

### ✅ Advanced Task Management
- **Task-project association** with automatic assignment
- **Status workflow** (Pending, In Progress, Completed)
- **User assignment** and ownership tracking
- **Rich task descriptions** and metadata

### 👥 User Management
- **User registration** with email validation
- **Profile management** with avatar support
- **Role assignment** by administrators
- **Password security** with bcrypt hashing

### 🛡️ Security & Validation
- **JWT-based authentication** with refresh token support
- **Comprehensive input validation** using class-validator
- **SQL injection protection** with Prisma ORM
- **CORS configuration** for secure cross-origin requests

## 🛠️ Technology Stack

### Backend
- **Framework**: NestJS (Node.js framework with TypeScript)
- **Database**: MySQL with Prisma ORM
- **Authentication**: JWT with Passport.js
- **Validation**: class-validator with comprehensive DTO validation
- **Documentation**: Swagger/OpenAPI
- **Security**: bcrypt, CORS, helmet

### Frontend
- **Framework**: React 18 with TypeScript
- **State Management**: Redux Toolkit with RTK Query
- **Routing**: React Router v6 with protected routes
- **HTTP Client**: Axios with interceptors
- **UI Components**: Custom components with modern CSS
- **Build Tool**: Vite for fast development and building

### DevOps & Production
- **Database Migrations**: Prisma migrate
- **Environment Management**: dotenv
- **Code Quality**: ESLint, Prettier
- **Production Build**: Optimized builds for both frontend and backend

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **MySQL** 8.0 or higher
- **npm** or **yarn** package manager

### 📦 Installation

1. **Clone the repository**:
```bash
git clone https://github.com/akhoaa/todoapp.git
cd todoapp
```

2. **Install backend dependencies**:
```bash
cd backend
npm install
```

3. **Install frontend dependencies**:
```bash
cd ../frontend
npm install
```

### ⚙️ Environment Configuration

1. **Backend Environment** - Create `.env` file in the backend directory:
```env
# Database Configuration
DATABASE_URL="mysql://username:password@localhost:3306/todoapp"

# JWT Configuration
JWT_SECRET="your-super-secure-jwt-secret-key-here"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_SECRET="your-super-secure-refresh-secret-key-here"
JWT_REFRESH_EXPIRES_IN="7d"

# Application Configuration
NODE_ENV="development"
PORT=3000

# CORS Configuration
FRONTEND_URL="http://localhost:5173"
```

2. **Frontend Environment** - Create `.env` file in the frontend directory:
```env
VITE_API_BASE_URL="http://localhost:3000"
```

### 🗄️ Database Setup

1. **Create MySQL database**:
```sql
CREATE DATABASE todoapp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. **Generate Prisma client**:
```bash
cd backend
npx prisma generate
```

3. **Run database migrations**:
```bash
npx prisma migrate deploy
```

4. **Seed the database** with initial data:
```bash
npx prisma db seed
```

This will create:
- Default admin user: `admin@example.com` / `admin123`
- Default manager user: `manager@example.com` / `manager123`
- Default regular user: `user@example.com` / `user123`
- RBAC roles and permissions
- Sample projects and tasks

### 🏃‍♂️ Running the Application

1. **Start the backend server**:
```bash
cd backend
npm run start:dev
```

2. **Start the frontend development server**:
```bash
cd frontend
npm run dev
```

### 🌐 Access Points

- **Frontend Application**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api
- **Database Studio**: `npx prisma studio` (optional)

## 📚 API Documentation

### Interactive API Documentation
Access the complete Swagger/OpenAPI documentation at: **http://localhost:3000/api**

### Key API Endpoints

#### 🔐 Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - User login with email/password
- `POST /auth/refresh` - Refresh access token
- `POST /auth/forgot-password` - Request password reset

#### 👥 User Management
- `GET /users` - Get all users (Admin/Manager only)
- `GET /users/profile` - Get current user profile
- `PUT /users/profile` - Update user profile
- `PUT /users/change-password` - Change user password
- `POST /users/:id/assign-role` - Assign role to user (Admin only)

#### 📊 Project Management
- `GET /projects` - Get user's projects
- `POST /projects` - Create new project (Manager/Admin)
- `GET /projects/:id` - Get project details
- `PUT /projects/:id` - Update project (Owner/Admin)
- `DELETE /projects/:id` - Delete project (Owner/Admin)
- `GET /projects/:id/members` - Get project members
- `POST /projects/:id/members` - Add project member (Manager/Admin)
- `DELETE /projects/:id/members/:memberId` - Remove member (Manager/Admin)

#### ✅ Task Management
- `GET /tasks` - Get user's tasks (with optional status filter)
- `POST /tasks` - Create new task
- `GET /tasks/:id` - Get task details
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task

### Permission Levels
- **Admin**: Full system access
- **Manager**: Project and team management
- **User**: Personal tasks and assigned project tasks

## 📁 Project Structure

```
todoapp/
├── backend/                    # NestJS Backend Application
│   ├── src/
│   │   ├── auth/              # Authentication & JWT management
│   │   │   ├── dto/           # Data Transfer Objects
│   │   │   ├── strategies/    # Passport strategies
│   │   │   └── guards/        # Auth guards
│   │   ├── users/             # User management module
│   │   │   ├── dto/           # User DTOs with validation
│   │   │   └── entities/      # User entity definitions
│   │   ├── task/              # Task management module
│   │   │   ├── dto/           # Task DTOs
│   │   │   └── entities/      # Task entities
│   │   ├── project/           # Project management module
│   │   │   ├── dto/           # Project DTOs
│   │   │   └── entities/      # Project entities
│   │   ├── rbac/              # Role-Based Access Control
│   │   │   └── entities/      # Role & Permission entities
│   │   ├── common/            # Shared utilities
│   │   │   ├── decorators/    # Custom decorators
│   │   │   ├── guards/        # Permission guards
│   │   │   └── dto/           # Common DTOs
│   │   ├── config/            # Configuration management
│   │   └── prisma/            # Prisma service
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   ├── migrations/        # Database migrations
│   │   └── seed.ts           # Database seeding
│   └── package.json
├── frontend/                   # React Frontend Application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── Layout.tsx     # Main layout component
│   │   │   └── PermissionGuard.tsx # Permission-based rendering
│   │   ├── pages/             # Page components
│   │   │   ├── Login.tsx      # Authentication pages
│   │   │   ├── Projects.tsx   # Project management
│   │   │   ├── Tasks.tsx      # Task management
│   │   │   └── Profile.tsx    # User profile
│   │   ├── redux/             # State management
│   │   │   ├── store.ts       # Redux store configuration
│   │   │   └── slice/         # Redux slices
│   │   ├── hooks/             # Custom React hooks
│   │   ├── config/            # API configuration
│   │   ├── types/             # TypeScript definitions
│   │   └── utils/             # Utility functions
│   └── package.json
└── README.md
```

## 🎯 Feature Showcase

### 🔐 Authentication & Security
- **Secure Registration**: Email validation with password strength requirements
- **JWT Authentication**: Access and refresh token implementation
- **Password Security**: bcrypt hashing with salt rounds
- **Session Management**: Automatic token refresh and logout

### 👥 User Roles & Permissions
- **Admin Role**: Complete system administration
  - User management and role assignment
  - System-wide project and task access
  - RBAC configuration and management
- **Manager Role**: Team and project leadership
  - Project creation and management
  - Team member invitation and role assignment
  - Cross-project task visibility
- **User Role**: Individual contributor
  - Personal task management
  - Assigned project participation
  - Profile management

### 📊 Project Management Workflow
1. **Project Creation**: Managers create projects with descriptions and status
2. **Team Building**: Add members with specific roles (Member/Manager)
3. **Task Assignment**: Create and assign tasks within project context
4. **Progress Tracking**: Monitor project and task completion status
5. **Collaboration**: Team members collaborate on shared objectives

### ✅ Advanced Task Features
- **Smart Assignment**: Tasks automatically linked to projects
- **Status Workflow**: Pending → In Progress → Completed
- **Ownership Tracking**: Clear task ownership and responsibility
- **Project Context**: Tasks organized within project structure

## 🚀 Production Deployment

### Environment Variables for Production
```env
# Production Database
DATABASE_URL="mysql://user:password@production-host:3306/todoapp"

# Security
JWT_SECRET="your-production-jwt-secret-256-bit-key"
JWT_REFRESH_SECRET="your-production-refresh-secret-256-bit-key"
NODE_ENV="production"

# Application
PORT=3000
FRONTEND_URL="https://your-domain.com"
```

### Build Commands
```bash
# Backend Production Build
cd backend
npm run build
npm run start:prod

# Frontend Production Build
cd frontend
npm run build
# Serve dist/ folder with your preferred web server
```

### Database Migration for Production
```bash
# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Seed production data (optional)
npx prisma db seed
```
## 🛠️ Development

### Code Quality
- **ESLint**: Consistent code style and error detection
- **Prettier**: Automatic code formatting
- **TypeScript**: Type safety across the entire stack
- **Validation**: Comprehensive input validation with class-validator

### Database Management
```bash
# View database in browser
npx prisma studio

# Reset database (development only)
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --name your_migration_name
```

### Debugging
- **Backend**: Debug mode available with `npm run start:debug`
- **Frontend**: React DevTools and Redux DevTools support
- **Database**: Prisma Studio for visual database management

## 🤝 Contributing

We welcome contributions to improve TodoApp! Here's how you can help:

### Getting Started
1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** with proper testing
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Development Guidelines
- Follow existing code style and conventions
- Add comprehensive validation for new DTOs
- Include proper error handling in services
- Update API documentation for new endpoints
- Test your changes thoroughly

### Areas for Contribution
- 🎨 **UI/UX Improvements**: Enhanced user interface and experience
- 🔧 **Performance Optimization**: Database queries and frontend performance
- 🛡️ **Security Enhancements**: Additional security measures and validation
- 📱 **Mobile Responsiveness**: Better mobile device support
- 🧪 **Testing**: Unit tests and integration tests
- 📚 **Documentation**: API documentation and user guides

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **NestJS** for the robust backend framework
- **React** for the powerful frontend library
- **Prisma** for the excellent database toolkit
- **MySQL** for reliable data storage
- **TypeScript** for type safety and developer experience

## 📞 Support

If you encounter any issues or have questions:

1. **Check the documentation** in this README
2. **Review the API documentation** at `/api` endpoint
3. **Search existing issues** on GitHub
4. **Create a new issue** with detailed information

---

**Built with ❤️ using modern web technologies for enterprise-grade project management.**

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
