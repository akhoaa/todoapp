import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from '../../src/task/task.controller';
import { TaskService } from '../../src/task/task.service';
import { CreateTaskDto } from '../../src/task/dto/create-task.dto';
import { UpdateTaskDto } from '../../src/task/dto/update-task.dto';

describe('TaskController', () => {
  let controller: TaskController;
  let service: TaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            updateWithOwnershipCheck: jest.fn(),
            deleteWithOwnershipCheck: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TaskController>(TaskController);
    service = module.get<TaskService>(TaskService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new task', async () => {
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
        userId: 1,
        createdAt: new Date(),
      };

      jest.spyOn(service, 'create').mockResolvedValue(mockTask);
      const userId = 1;
      const result = await controller.create(createTaskDto, userId);
      expect(result).toEqual(mockTask);
      expect(service.create).toHaveBeenCalledWith(userId, createTaskDto);
    });
  });

  describe('findAll', () => {
    it('should return all tasks for the authenticated user', async () => {
      const mockTasks = [
        {
          id: 1,
          title: 'Task 1',
          description: 'Description 1',
          status: 'PENDING',
          userId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
          },
        },
        {
          id: 2,
          title: 'Task 2',
          description: 'Description 2',
          status: 'COMPLETED',
          userId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
          },
        },
      ];

      jest.spyOn(service, 'findAll').mockResolvedValue(mockTasks);
      const mockUser = { userId: 1, roles: 'user' };
      const result = await controller.findAll(mockUser);
      expect(result).toEqual(mockTasks);
      expect(service.findAll).toHaveBeenCalledWith(mockUser, undefined);
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
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'updateWithOwnershipCheck').mockResolvedValue(mockTask);
      const mockUser = { userId: 1, roles: 'user' };

      const result = await controller.update(taskId, updateTaskDto, mockUser);
      expect(result).toEqual(mockTask);
      expect(service.updateWithOwnershipCheck).toHaveBeenCalledWith(taskId, updateTaskDto, mockUser);
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
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'deleteWithOwnershipCheck').mockResolvedValue(mockTask);
      const mockUser = { userId: 1, roles: 'user' };

      const result = await controller.delete(taskId, mockUser);
      expect(result).toEqual(mockTask);
      expect(service.deleteWithOwnershipCheck).toHaveBeenCalledWith(taskId, mockUser);
    });
  });
}); 