import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/auth/auth.service';
import { UsersService } from '../../src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user when credentials are valid', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Test User',
        avatar: null,
        roles: 'user',
      };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

      const result = await service.validateUser('test@example.com', 'password123');
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        avatar: mockUser.avatar,
        roles: mockUser.roles,
      });
    });

    it('should return null when user not found', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      const result = await service.validateUser('test@example.com', 'password123');
      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Test User',
        avatar: null,
        roles: 'user',
      };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      const result = await service.validateUser('test@example.com', 'wrongpassword');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token and refresh token and user', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Test User',
        avatar: null,
        roles: 'user',
      };

      const mockAccessToken = 'access-token';
      const mockRefreshToken = 'refresh-token';

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
      jest.spyOn(jwtService, 'sign')
        .mockReturnValueOnce(mockAccessToken)
        .mockReturnValueOnce(mockRefreshToken);

      const result = await service.login('test@example.com', 'password123');
      expect(result).toEqual(expect.objectContaining({
        access_token: mockAccessToken,
        refresh_token: mockRefreshToken,
        user: expect.objectContaining({
          id: 1,
          email: 'test@example.com',
        }),
      }));
    });
  });

  describe('register', () => {
    it('should create new user and return user data', async () => {
      const registerDto = {
        email: 'new@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 2,
        email: registerDto.email,
        name: null,
        password: 'hashed-password',
        avatar: null,
        roles: 'user',
      };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashed-password'));
      jest.spyOn(usersService, 'create').mockResolvedValue(mockUser);

      const result = await service.register(registerDto);
      expect(result).toEqual(expect.objectContaining({
        user: expect.objectContaining({
          email: 'new@example.com',
        }),
      }));
    });
  });
}); 