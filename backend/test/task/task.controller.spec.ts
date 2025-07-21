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
            update: jest.fn(),
            delete: jest.fn(),
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
      const mockReq = { user: { userId: 1 } };
      const result = await controller.create(createTaskDto, mockReq);
      expect(result).toEqual(mockTask);
      expect(service.create).toHaveBeenCalledWith(1, createTaskDto);
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

      jest.spyOn(service, 'findAll').mockResolvedValue(mockTasks);
      const mockReq = { user: { userId: 1 } };
      const result = await controller.findAll(mockReq);
      expect(result).toEqual(mockTasks);
      expect(service.findAll).toHaveBeenCalledWith(1);
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

      jest.spyOn(service, 'update').mockResolvedValue(mockTask);

      const result = await controller.update(taskId.toString(), updateTaskDto);
      expect(result).toEqual(mockTask);
      expect(service.update).toHaveBeenCalledWith(taskId, updateTaskDto);
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

      jest.spyOn(service, 'delete').mockResolvedValue(mockTask);

      const result = await controller.delete(taskId.toString());
      expect(result).toEqual(mockTask);
      expect(service.delete).toHaveBeenCalledWith(taskId);
    });
  });
}); 