import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('TaskController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let userId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    await prisma.task.deleteMany();
    await prisma.user.deleteMany();
  });

  beforeEach(async () => {
    // Create a user and get auth token for protected routes
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `test${Date.now()}@example.com`,
        password: 'password123',
      });

    if (registerResponse.status !== 201) {
      console.error('Register failed:', registerResponse.body);
      throw new Error('Failed to register user for test');
    }

    authToken = registerResponse.body.access_token;
    userId = registerResponse.body.user.id;
  });

  afterAll(async () => {
    await prisma.task.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
    await app.close();
  });

  describe('/tasks (POST)', () => {
    it('should create a new task', () => {
      return request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Task',
          description: 'Test Description',
          status: 'PENDING',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe('Test Task');
          expect(res.body.description).toBe('Test Description');
          expect(res.body.status).toBe('PENDING');
          expect(res.body.userId).toBe(userId);
        });
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .post('/tasks')
        .send({
          title: 'Test Task',
          description: 'Test Description',
          status: 'PENDING',
        })
        .expect(401);
    });

    it('should return 400 if required fields are missing', () => {
      return request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Test Description',
          // missing title
        })
        .expect(400);
    });
  });

  describe('/tasks (GET)', () => {
    beforeEach(async () => {
      // Create some tasks for the user
      await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Task 1',
          description: 'Description 1',
          status: 'PENDING',
        });

      await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Task 2',
          description: 'Description 2',
          status: 'COMPLETED',
        });
    });

    it('should return all tasks for the authenticated user', () => {
      return request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(2);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('title');
          expect(res.body[0]).toHaveProperty('userId');
          expect(res.body[0].userId).toBe(userId);
        });
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .get('/tasks')
        .expect(401);
    });
  });

  describe('/tasks/:id (GET)', () => {
    let taskId: number;

    beforeEach(async () => {
      // Create a task
      const createResponse = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Task',
          description: 'Test Description',
          status: 'PENDING',
        });

      taskId = createResponse.body.id;
    });

    it('should return a single task', () => {
      return request(app.getHttpServer())
        .get(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(taskId);
          expect(res.body.title).toBe('Test Task');
          expect(res.body.userId).toBe(userId);
        });
    });

    it('should return 404 for non-existent task', () => {
      return request(app.getHttpServer())
        .get('/tasks/999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .get(`/tasks/${taskId}`)
        .expect(401);
    });
  });

  describe('/tasks/:id (PUT)', () => {
    let taskId: number;

    beforeEach(async () => {
      // Create a task
      const createResponse = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Task',
          description: 'Test Description',
          status: 'PENDING',
        });

      taskId = createResponse.body.id;
    });

    it('should update a task', () => {
      return request(app.getHttpServer())
        .put(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Task',
          status: 'COMPLETED',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(taskId);
          expect(res.body.title).toBe('Updated Task');
          expect(res.body.status).toBe('COMPLETED');
          expect(res.body.userId).toBe(userId);
        });
    });

    it('should return 404 for non-existent task', () => {
      return request(app.getHttpServer())
        .put('/tasks/999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Task',
        })
        .expect(404);
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .put(`/tasks/${taskId}`)
        .send({
          title: 'Updated Task',
        })
        .expect(401);
    });
  });

  describe('/tasks/:id (DELETE)', () => {
    let taskId: number;

    beforeEach(async () => {
      // Create a task
      const createResponse = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Task',
          description: 'Test Description',
          status: 'PENDING',
        });

      taskId = createResponse.body.id;
    });

    it('should delete a task', () => {
      return request(app.getHttpServer())
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(taskId);
        });
    });

    it('should return 404 for non-existent task', () => {
      return request(app.getHttpServer())
        .delete('/tasks/999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .delete(`/tasks/${taskId}`)
        .expect(401);
    });
  });
}); 