import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

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

  describe('/auth/register (POST)', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `test${Date.now()}@example.com`,
          password: 'password123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user).not.toHaveProperty('password');
        });
    });

    it('should return 400 if email already exists', async () => {
      const email = `test${Date.now()}@example.com`;
      
      // First registration
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: email,
          password: 'password123',
        });

      // Second registration with same email
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: email,
          password: 'password123',
        })
        .expect(400);
    });

    it('should return 400 if required fields are missing', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          // missing password
        })
        .expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
    beforeEach(async () => {
      // Create a user for login tests
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `test${Date.now()}@example.com`,
          password: 'password123',
        });
    });

    it('should login with valid credentials', async () => {
      const email = `test${Date.now()}@example.com`;
      
      // Create user first
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: email,
          password: 'password123',
        });

      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: email,
          password: 'password123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe(email);
        });
    });

    it('should return 401 with invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should return 401 with non-existent email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);
    });
  });
}); 