import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Hash password
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

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

  // Seed tasks
  await prisma.task.createMany({
    data: [
      {
        title: 'Admin Task',
        description: 'This is a sample task for admin',
        status: 'PENDING',
        userId: admin.id,
      },
      {
        title: 'User Task',
        description: 'This is a sample task for user',
        status: 'COMPLETED',
        userId: user.id,
      },
    ],
  });

  console.log('✅ Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 