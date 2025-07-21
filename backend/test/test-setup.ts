import { PrismaClient } from '@prisma/client';

// Global test setup
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'mysql://root:password@localhost:3306/todo_test';
});

// Global test teardown
afterAll(async () => {
  // Clean up any global resources
});

// Helper function to clean database
export async function cleanDatabase() {
  const prisma = new PrismaClient();
  try {
    await prisma.task.deleteMany();
    await prisma.user.deleteMany();
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to create test user
export async function createTestUser(prisma: PrismaClient, userData = {}) {
  const defaultUser = {
    email: 'test@example.com',
    password: '$2b$10$test.hash',
    name: 'Test User',
    ...userData,
  };

  return await prisma.user.create({
    data: defaultUser,
  });
}

// Helper function to create test task
export async function createTestTask(prisma: PrismaClient, taskData = {}) {
  const defaultTask = {
    title: 'Test Task',
    description: 'Test Description',
    status: 'PENDING',
    userId: 1,
    ...taskData,
  };

  return await prisma.task.create({
    data: defaultTask,
  });
} 