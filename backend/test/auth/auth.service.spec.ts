import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/auth/auth.service';
import { UsersService } from '../../src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../src/prisma/prisma.service';
import { ConfigService } from '../../src/config/config.service';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let configService: ConfigService;

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
        {
          provide: ConfigService,
          useValue: {
            jwt: {
              secret: 'test-secret',
              expiresIn: '1h',
              refreshSecret: 'test-refresh-secret',
              refreshExpiresIn: '7d',
            },
            isDevelopment: true,
            nodeEnv: 'test',
            port: 3000,
            database: {
              url: 'test-database-url',
            },
            api: {
              prefix: 'api',
              version: '1.0',
            },
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
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
        name: 'New User',
      };

      const mockUser = {
        id: 2,
        email: registerDto.email,
        name: registerDto.name,
        avatar: null,
        roles: 'user',
      };

      const mockAccessToken = 'access-token';
      const mockRefreshToken = 'refresh-token';

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashed-password'));
      jest.spyOn(usersService, 'create').mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'sign')
        .mockReturnValueOnce(mockAccessToken)
        .mockReturnValueOnce(mockRefreshToken);

      const result = await service.register(registerDto);
      expect(result).toEqual(expect.objectContaining({
        access_token: mockAccessToken,
        refresh_token: mockRefreshToken,
        user: expect.objectContaining({
          id: 2,
          email: 'new@example.com',
          name: 'New User',
        }),
      }));
    });

    it('should throw BadRequestException when email already exists', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'password123',
      };

      const existingUser = {
        id: 1,
        email: registerDto.email,
        password: 'hashed-password',
        name: 'Existing User',
        avatar: null,
        roles: 'user',
      };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(existingUser);

      await expect(service.register(registerDto)).rejects.toThrow('Email already exists');
    });
  });
}); 