import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../src/auth/auth.controller';
import { AuthService } from '../../src/auth/auth.service';
import { RegisterDto } from '../../src/auth/dto/register.dto';
import { LoginDto } from '../../src/auth/dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            register: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should return access and refresh token with user', async () => {
      const loginDto: LoginDto = { email: 'test@example.com', password: 'password123' };
      const mockLoginResult = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        user: {
          id: 1,
          email: 'test@example.com',
          name: null,
          avatar: null,
          roles: 'user',
        },
      };
      jest.spyOn(authService, 'login').mockResolvedValue(mockLoginResult);
      const result = await controller.login(loginDto);
      expect(result).toEqual(mockLoginResult);
    });
  });

  describe('register', () => {
    it('should create new user and return user data', async () => {
      const registerDto: RegisterDto = { email: 'new@example.com', password: 'password123' };
      const mockRegisterResult = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        user: {
          id: 2,
          email: 'new@example.com',
          name: null,
          avatar: null,
          roles: 'user',
        },
      };
      jest.spyOn(authService, 'register').mockResolvedValue(mockRegisterResult);
      const result = await controller.register(registerDto);
      expect(result).toEqual(mockRegisterResult);
    });
  });
}); 