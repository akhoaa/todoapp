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
- **Three-tier role hierarchy**: Admin (19 permissions) → Manager (15 permissions) → User (7 permissions)
- **Granular permissions system** with 19 distinct permissions across resources
- **Dynamic UI adaptation** based on user permissions and role capabilities
- **Secure API endpoints** with comprehensive permission-based authorization guards
- **Real-time permission validation** on both frontend components and backend services

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
- **Framework**: NestJS (Node.js, TypeScript)
- **Database**: MySQL (Prisma ORM)
- **Authentication**: JWT (Passport.js, refresh token)
- **Validation**: class-validator, Joi (DTO validation)
- **Documentation**: Swagger/OpenAPI (`/api`)
- **Security**: bcryptjs, CORS, helmet
- **RBAC**: Dynamic permission system, permission checks in both controller and service
- **Prisma Models**: users, roles, permissions, userRoles, projects, tasks, projectMembers, refreshTokens
- **Scripts**: `start`, `start:dev`, `start:prod`, `start:debug`, `build`, `lint`, `format`, `prisma generate`, `prisma migrate`, `prisma db seed`

### Frontend
- **Framework**: React 19, TypeScript
- **State Management**: Redux Toolkit, RTK Query
- **Routing**: React Router v7 (protected routes)
- **UI Components**: Ant Design 5, custom components
- **HTTP Client**: Axios (interceptors, error handling)
- **Build Tool**: Vite
- **Scripts**: `dev`, `build`, `lint`, `preview`

### DevOps & Production
- **Database Migrations**: Prisma migrate, seed, reset
- **Environment Management**: dotenv
- **Code Quality**: ESLint, Prettier, TypeScript strict
- **Production Build**: Optimized frontend/backend, clear scripts

## � Role-Based Access Control (RBAC) System

### 📊 Role Hierarchy & Permissions

TodoApp implements a comprehensive three-tier RBAC system with granular permissions:

| Role | Permission Count | Key Capabilities | Access Level |
|------|------------------|------------------|--------------|
| **👑 Admin** | **19 permissions** | Complete system administration | Full Access |
| **👔 Manager** | **15 permissions** | Project & team management | Limited Admin |
| **👤 User** | **7 permissions** | Basic task & profile management | Restricted |

### 🎯 Detailed Permission Matrix

#### **👑 Admin Role (19 Permissions)**
**Full system access with all administrative capabilities:**

| Category | Permissions | Description |
|----------|-------------|-------------|
| **Task Management** | `task:create`, `task:read`, `task:update`, `task:delete`, `task:read_all` | Complete task CRUD operations |
| **Project Management** | `project:create`, `project:read`, `project:update`, `project:delete`, `project:read_all`, `project:manage_members` | Full project lifecycle management |
| **User Administration** | `user:create`, `user:read`, `user:update`, `user:delete`, `user:read_all`, `user:manage_roles` | Complete user management |
| **Role Management** | `role:assign`, `role:remove` | System-wide role assignment capabilities |

#### **👔 Manager Role (15 Permissions)**
**Project and team management with restricted user administration:**

| Category | Permissions | Description |
|----------|-------------|-------------|
| **Task Management** | `task:create`, `task:read`, `task:update`, `task:delete`, `task:read_all` | Complete task CRUD operations |
| **Project Management** | `project:create`, `project:read`, `project:update`, `project:delete`, `project:read_all`, `project:manage_members` | Full project lifecycle management |
| **Limited User Access** | `user:read`, `user:update`, `user:read_all`, `user:manage_roles` | View and edit users, view roles only |
| **❌ Restricted** | ~~`user:create`~~, ~~`user:delete`~~, ~~`role:assign`~~, ~~`role:remove`~~ | Cannot create/delete users or assign roles |

#### **👤 User Role (7 Permissions)**
**Basic task management and profile access:**

| Category | Permissions | Description |
|----------|-------------|-------------|
| **Task Management** | `task:create`, `task:read`, `task:update`, `task:delete` | Personal task CRUD operations |
| **Project Viewing** | `project:read` | Read-only access to assigned projects |
| **Profile Management** | `user:read`, `user:update` | View and update own profile |
| **❌ Restricted** | ~~All admin/manager permissions~~ | No user management or project creation |

### 🔑 Default User Accounts

The system comes pre-configured with test accounts for each role:

```bash
# Admin Account (19 permissions - Full system access)
Email: admin@example.com
Password: admin123
Capabilities: Complete system administration, user management, role assignment

# Manager Account (15 permissions - Project/team management)
Email: manager@example.com
Password: manager123
Capabilities: Project management, team collaboration, limited user access

# Regular User Account (7 permissions - Basic access)
Email: user@example.com
Password: user123
Capabilities: Task management, project viewing, profile management
```

### 🛡️ Security Implementation

#### **Frontend Permission Guards**
- **Dynamic UI Rendering**: Components show/hide based on user permissions
- **Route Protection**: Unauthorized routes redirect to appropriate pages
- **Button/Action Guards**: Administrative actions hidden for restricted users
- **Real-time Validation**: Permission checks on every user interaction

#### **Backend Authorization**
- **JWT Token Integration**: Permissions embedded in authentication tokens
- **API Endpoint Protection**: Every endpoint validates required permissions
- **Database-level Security**: Role-based data access restrictions
- **Middleware Guards**: Automatic permission validation on all requests

#### **Permission Validation Examples**
```typescript
// Frontend Component Permission Check
{hasPermission('user:create') && (
  <Button onClick={handleCreateUser}>Create User</Button>
)}

// Backend API Endpoint Protection
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequirePermissions('user:create')
@Post()
async createUser(@Body() dto: CreateUserDto) {
  return this.usersService.create(dto);
}
```

## �🚀 Getting Started

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
- **Admin user**: `admin@example.com` / `admin123` (19 permissions - Full system access)
- **Manager user**: `manager@example.com` / `manager123` (15 permissions - Project/team management)
- **Regular user**: `user@example.com` / `user123` (7 permissions - Basic task management)
- **RBAC system**: 3 roles with 19 granular permissions
- **Sample data**: Projects and tasks for testing functionality

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

#### 👥 User Management
- `GET /users` - Get all users with roles and permissions (Admin/Manager only)
- `POST /users` - Create new user account (Admin only)
- `GET /users/:id` - Get specific user details (Admin/Manager only)
- `PUT /users/:id` - Update user information (Admin/Manager only)
- `DELETE /users/:id` - Delete user account (Admin only)
- `GET /users/profile` - Get current user profile
- `PUT /users/profile` - Update user profile

#### 🔐 Role & Permission Management
- `GET /roles` - Get all available roles (Admin/Manager only)
- `POST /users/:id/roles` - Assign role to user (Admin only)
- `DELETE /users/:id/roles/:roleId` - Remove role from user (Admin only)
- `GET /users/:id/permissions` - Get user's effective permissions
- `GET /permissions` - Get all available permissions (Admin only)

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

### 🎯 Permission-Based API Access

#### **👑 Admin Access (19 Permissions)**
- **Complete system control**: All endpoints accessible
- **User administration**: Create, read, update, delete users
- **Role management**: Assign and remove roles from users
- **System-wide visibility**: Access to all projects, tasks, and users

#### **👔 Manager Access (15 Permissions)**
- **Project leadership**: Create, manage, and delete projects
- **Team collaboration**: Add/remove project members
- **Limited user access**: View and edit users, but cannot create/delete
- **Task oversight**: Full task management across assigned projects

#### **👤 User Access (7 Permissions)**
- **Personal productivity**: Create and manage own tasks
- **Project participation**: View assigned projects and contribute
- **Profile management**: Update own profile and password
- **Restricted scope**: No administrative or user management capabilities

todoapp/
## 📁 Project Structure

```
todoapp/
├── backend/                    # NestJS Backend
│   ├── src/
│   │   ├── app.*               # App bootstrap
│   │   ├── auth/               # Authentication, JWT, refresh token, Passport strategies
│   │   ├── users/              # User management, DTO, entities
│   │   ├── task/               # Task management, DTO, entities
│   │   ├── project/            # Project management, DTO, entities
│   │   ├── rbac/               # Role, permission, entities
│   │   ├── common/             # Decorators, guards, filters, shared DTOs
│   │   ├── config/             # Configuration, env, validation
│   │   ├── prisma/             # Prisma service
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   ├── migrations/         # Database migrations
│   │   └── seed.ts             # Seed sample data
│   └── package.json
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/         # UI components, PermissionGuard, Layout
│   │   ├── pages/              # Pages: Login, Projects, Tasks, Profile, ...
│   │   ├── redux/              # Store, slice, hooks
│   │   ├── hooks/              # Custom hooks
│   │   ├── config/             # API config, axios
│   │   ├── types/              # TypeScript types
│   │   └── utils/              # Helper, error handler
│   └── package.json
└── README.md
```

## 🎯 Feature Showcase

### 🔐 Authentication & Security
- **Secure Registration**: Email validation with password strength requirements
- **JWT Authentication**: Access and refresh token implementation
- **Password Security**: bcrypt hashing with salt rounds
- **Session Management**: Automatic token refresh and logout

### 👥 RBAC Role Implementation

#### **👑 Admin Role (19 Permissions)**
**Full system administration, unrestricted:**
- ✅ User management: create, view, update, delete users
- ✅ Assign/remove roles for users
- ✅ RBAC management: create permissions, assign permissions to roles
- ✅ Manage all projects and tasks in the system
- ✅ Access all data and system configuration

#### **👔 Manager Role (15 Permissions)**
**Project and team management, no admin rights:**
- ✅ Create, update, delete, view projects
- ✅ Add/remove project members
- ✅ Manage tasks in projects they manage
- ✅ View/update user info (cannot create/delete users)
- ❌ Cannot assign/remove roles, cannot create/delete users

#### **👤 User Role (7 Permissions)**
**Basic user, personal actions only:**
- ✅ Create, view, update, delete own tasks
- ✅ View assigned projects
- ✅ View/update own profile
- ❌ No user management, cannot create projects

### 📊 Project Management Workflow
1. **Project Creation**: Managers create projects with descriptions and status
2. **Team Building**: Add members with specific roles (Member/Manager)
3. **Task Assignment**: Create and assign tasks within project context
4. **Progress Tracking**: Monitor project and task completion status
5. **Collaboration**: Team members collaborate on shared objectives

### ✅ Advanced Task Features
- **Task-project association**: Tasks are always linked to a project
- **Status workflow**: Pending → In Progress → Completed
- **Ownership tracking**: Track task ownership
- **Project context**: Tasks are organized within project structure

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

npx prisma migrate reset
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

### 🔧 RBAC Troubleshooting

#### **Common Issues & Solutions**

**🚨 User Cannot Login After Creation**
```bash
# Problem: Admin-created users may not have proper RBAC roles assigned
# Solution: Verify user has roles assigned in database
npx prisma studio
# Check userRoles table for the user ID

# Or assign role via API:
curl -X POST http://localhost:3000/users/{userId}/roles \
  -H "Authorization: Bearer {admin-token}" \
  -d '{"roleId": 3}' # 3 = user role
```

**🚨 Permission Denied Errors**
```bash
# Problem: User lacks required permissions for action
# Solution: Check user's effective permissions
curl -X GET http://localhost:3000/users/{userId}/permissions \
  -H "Authorization: Bearer {token}"

# Verify role assignments:
curl -X GET http://localhost:3000/users/{userId} \
  -H "Authorization: Bearer {admin-token}"
```

**🚨 UI Elements Not Showing/Hiding Correctly**
```typescript
// Problem: Frontend permission checks not working
// Solution: Verify usePermissions hook implementation
const { hasPermission } = usePermissions();
console.log('User permissions:', hasPermission('user:create'));

// Check JWT token contains permissions:
// Decode token at jwt.io and verify 'permissions' array
```

**🚨 Database Seeding Issues**
```bash
# Problem: RBAC roles/permissions not created properly
# Solution: Reset and re-seed database
npx prisma migrate reset --force
npx prisma db seed

# Verify seed data:
npx prisma studio
# Check: roles, permissions, rolePermissions, userRoles, projects, tasks, projectMembers, refreshTokens
```

#### **Permission Verification Commands**
```bash
# Test admin login and permissions
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Test manager login and permissions
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@example.com","password":"manager123"}'

# Test user login and permissions
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"user123"}'
```

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

**Built with ❤️ using modern web technologies for enterprise-grade project management with comprehensive RBAC security.**
