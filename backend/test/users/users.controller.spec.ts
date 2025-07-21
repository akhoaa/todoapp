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
            findByEmail: jest.fn(),
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
    it('should return an empty array', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return an empty object', async () => {
      const result = await controller.findOne('1');
      expect(result).toEqual({});
    });
  });
}); 