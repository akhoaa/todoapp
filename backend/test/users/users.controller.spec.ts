import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../../src/users/users.controller';
import { UsersService } from '../../src/users/users.service';
import { CreateUserDto } from '../../src/users/dto/create-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            findByEmail: jest.fn(),
            update: jest.fn(),
            changePassword: jest.fn(),
            remove: jest.fn(),
            getStatistics: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 1,
        email: createUserDto.email,
        password: 'hashed-password',
        name: null,
        avatar: null,
        roles: 'user',
      };

      jest.spyOn(service, 'create').mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);
      expect(result).toEqual(mockUser);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers = [
        {
          id: 1,
          email: 'user1@example.com',
          name: 'User 1',
          avatar: null,
          roles: 'user',
        },
        {
          id: 2,
          email: 'user2@example.com',
          name: 'User 2',
          avatar: null,
          roles: 'admin',
        },
      ];

      jest.spyOn(service, 'findAll').mockResolvedValue(mockUsers);

      const result = await controller.findAll();
      expect(result).toEqual(mockUsers);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const userId = 1;
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        avatar: null,
        roles: 'user',
        tasks: [],
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockUser);

      const result = await controller.findOne(userId);
      expect(result).toEqual(mockUser);
      expect(service.findOne).toHaveBeenCalledWith(userId);
    });
  });
}); 