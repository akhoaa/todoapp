import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Hash password
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);
  const managerPassword = await bcrypt.hash('manager123', 10);

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrator with full system access',
    },
  });

  const managerRole = await prisma.role.upsert({
    where: { name: 'manager' },
    update: {},
    create: {
      name: 'manager',
      description: 'Manager with project and team management access',
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      name: 'user',
      description: 'Regular user with basic access',
    },
  });

  // Create permissions
  const permissions = [
    // Task permissions
    { name: 'task:create', resource: 'task', action: 'create', description: 'Create tasks' },
    { name: 'task:read', resource: 'task', action: 'read', description: 'Read tasks' },
    { name: 'task:update', resource: 'task', action: 'update', description: 'Update tasks' },
    { name: 'task:delete', resource: 'task', action: 'delete', description: 'Delete tasks' },
    { name: 'task:read_all', resource: 'task', action: 'read_all', description: 'Read all tasks' },

    // Project permissions
    { name: 'project:create', resource: 'project', action: 'create', description: 'Create projects' },
    { name: 'project:read', resource: 'project', action: 'read', description: 'Read projects' },
    { name: 'project:update', resource: 'project', action: 'update', description: 'Update projects' },
    { name: 'project:delete', resource: 'project', action: 'delete', description: 'Delete projects' },
    { name: 'project:read_all', resource: 'project', action: 'read_all', description: 'Read all projects' },
    { name: 'project:manage_members', resource: 'project', action: 'manage_members', description: 'Manage project members' },

    // User permissions
    { name: 'user:read', resource: 'user', action: 'read', description: 'Read user profiles' },
    { name: 'user:update', resource: 'user', action: 'update', description: 'Update user profiles' },
    { name: 'user:read_all', resource: 'user', action: 'read_all', description: 'Read all users' },
    { name: 'user:manage_roles', resource: 'user', action: 'manage_roles', description: 'Manage user roles' },
  ];

  const createdPermissions: any[] = [];
  for (const perm of permissions) {
    const permission = await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
    createdPermissions.push(permission);
  }

  // Assign permissions to roles
  // Admin gets all permissions
  for (const permission of createdPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Manager gets project and task management permissions
  const managerPermissions = createdPermissions.filter(p =>
    p.name.includes('project:') ||
    p.name.includes('task:') ||
    p.name === 'user:read' ||
    p.name === 'user:read_all'
  );
  for (const permission of managerPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: managerRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: managerRole.id,
        permissionId: permission.id,
      },
    });
  }

  // User gets basic permissions
  const userPermissions = createdPermissions.filter(p =>
    ['task:create', 'task:read', 'task:update', 'task:delete', 'project:read', 'user:read', 'user:update'].includes(p.name)
  );
  for (const permission of userPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: userRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: userRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Seed users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Admin',
      roles: 'admin',
      avatar: null,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@example.com' },
    update: {},
    create: {
      email: 'manager@example.com',
      password: managerPassword,
      name: 'Manager',
      roles: 'manager',
      avatar: null,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: userPassword,
      name: 'User',
      roles: 'user',
      avatar: null,
    },
  });

  // Assign roles to users
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: admin.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      roleId: adminRole.id,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: manager.id,
        roleId: managerRole.id,
      },
    },
    update: {},
    create: {
      userId: manager.id,
      roleId: managerRole.id,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: user.id,
        roleId: userRole.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      roleId: userRole.id,
    },
  });

  // Create sample projects
  const project1 = await prisma.project.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Website Redesign',
      description: 'Complete redesign of the company website',
      status: 'ACTIVE',
      ownerId: manager.id,
    },
  });

  const project2 = await prisma.project.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Mobile App Development',
      description: 'Development of a new mobile application',
      status: 'ACTIVE',
      ownerId: admin.id,
    },
  });

  // Add project members
  await prisma.projectMember.upsert({
    where: {
      projectId_userId: {
        projectId: project1.id,
        userId: user.id,
      },
    },
    update: {},
    create: {
      projectId: project1.id,
      userId: user.id,
      role: 'MEMBER',
    },
  });

  await prisma.projectMember.upsert({
    where: {
      projectId_userId: {
        projectId: project2.id,
        userId: manager.id,
      },
    },
    update: {},
    create: {
      projectId: project2.id,
      userId: manager.id,
      role: 'MANAGER',
    },
  });

  // Seed tasks with project associations
  await prisma.task.deleteMany({}); // Clear existing tasks
  await prisma.task.createMany({
    data: [
      {
        title: 'Design Homepage',
        description: 'Create wireframes and mockups for the new homepage',
        status: 'PENDING',
        userId: user.id,
        projectId: project1.id,
      },
      {
        title: 'Setup Development Environment',
        description: 'Configure development tools and environment',
        status: 'COMPLETED',
        userId: manager.id,
        projectId: project1.id,
      },
      {
        title: 'API Design',
        description: 'Design REST API for mobile app',
        status: 'IN_PROGRESS',
        userId: admin.id,
        projectId: project2.id,
      },
      {
        title: 'Personal Task',
        description: 'This is a personal task not associated with any project',
        status: 'PENDING',
        userId: user.id,
        projectId: null,
      },
    ],
  });

  console.log('✅ Seed data created successfully!');
  console.log('👤 Users created:');
  console.log('   - admin@example.com (password: admin123)');
  console.log('   - manager@example.com (password: manager123)');
  console.log('   - user@example.com (password: user123)');
  console.log('🏢 Projects created: Website Redesign, Mobile App Development');
  console.log('📋 Tasks created with project associations');
  console.log('🔐 RBAC system initialized with roles and permissions');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 