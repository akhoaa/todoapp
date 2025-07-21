import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from '../../src/task/task.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { CreateTaskDto } from '../../src/task/dto/create-task.dto';
import { UpdateTaskDto } from '../../src/task/dto/update-task.dto';

describe('TaskService', () => {
  let service: TaskService;
  let prisma: any;

  beforeEach(async () => {
    const mockPrisma = {
      task: {
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findUnique: jest.fn(),
      },
      user: {
        findUnique: jest.fn().mockResolvedValue({ id: 1, email: 'test@example.com' }),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();
    service = module.get<TaskService>(TaskService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const userId = 1;
      const createTaskDto: CreateTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
        status: 'PENDING',
      };

      const mockTask = {
        id: 1,
        title: createTaskDto.title,
        description: createTaskDto.description || null,
        status: createTaskDto.status || 'PENDING',
        userId: userId,
        createdAt: new Date(),
      };

      jest.spyOn(prisma.task, 'create').mockResolvedValue(mockTask);

      const result = await service.create(userId, createTaskDto);
      expect(result).toEqual(mockTask);
      expect(prisma.task.create).toHaveBeenCalledWith({
        data: {
          ...createTaskDto,
          userId,
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return all tasks for a user', async () => {
      const userId = 1;
      const mockTasks = [
        {
          id: 1,
          title: 'Task 1',
          description: 'Description 1',
          status: 'PENDING',
          userId: 1,
          createdAt: new Date(),
        },
        {
          id: 2,
          title: 'Task 2',
          description: 'Description 2',
          status: 'COMPLETED',
          userId: 1,
          createdAt: new Date(),
        },
      ];

      jest.spyOn(prisma.task, 'findMany').mockResolvedValue(mockTasks);

      const result = await service.findAll(userId);
      expect(result).toEqual(mockTasks);
      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { userId },
      });
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const taskId = 1;
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
        status: 'COMPLETED',
      };

      const mockTask = {
        id: taskId,
        title: updateTaskDto.title || 'Test Task',
        description: 'Test Description',
        status: updateTaskDto.status || 'PENDING',
        userId: 1,
        createdAt: new Date(),
      };

      jest.spyOn(prisma.task, 'update').mockResolvedValue(mockTask);

      const result = await service.update(taskId, updateTaskDto);
      expect(result).toEqual(mockTask);
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: taskId },
        data: updateTaskDto,
      });
    });
  });

  describe('delete', () => {
    it('should delete a task', async () => {
      const taskId = 1;
      const mockTask = {
        id: taskId,
        title: 'Test Task',
        description: 'Test Description',
        status: 'PENDING',
        userId: 1,
        createdAt: new Date(),
      };

      jest.spyOn(prisma.task, 'delete').mockResolvedValue(mockTask);

      const result = await service.delete(taskId);
      expect(result).toEqual(mockTask);
      expect(prisma.task.delete).toHaveBeenCalledWith({
        where: { id: taskId },
      });
    });
  });
}); 