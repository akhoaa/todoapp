
import { Injectable, UnauthorizedException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '../config/config.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto, AuthResponseDto, RefreshResponseDto, ForgotPasswordResponseDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  async login(email: string, password: string): Promise<AuthResponseDto> {
    try {
      const user = await this.userService.findByEmail(email);
      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new UnauthorizedException('Invalid credentials');
      }
      // Generate access token and refresh token
      // Ensure user.roles exists, fallback to 'user' if not present
      const payload = { sub: user.id, userId: user.id, roles: user.roles || 'user' };
      const access_token = this.jwtService.sign(payload);
      const refresh_token = this.jwtService.sign(payload, {
        secret: this.configService.jwt.refreshSecret,
        expiresIn: this.configService.jwt.refreshExpiresIn
      });

      // User object already excludes password from validateUser()
      return { access_token, refresh_token, user };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException('Error during login');
    }
  }

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    try {
      const existing = await this.userService.findByEmail(dto.email);
      if (existing) {
        throw new BadRequestException('Email already exists');
      }

      const user = await this.userService.create({
        email: dto.email,
        password: dto.password, // Let UserService handle password hashing
        name: dto.name
      });

      // Generate access token and refresh token
      const payload = { sub: user.id, userId: user.id, roles: user.roles || 'user' };
      const access_token = this.jwtService.sign(payload);
      const refresh_token = this.jwtService.sign(payload, {
        secret: this.configService.jwt.refreshSecret,
        expiresIn: this.configService.jwt.refreshExpiresIn
      });

      // User object already excludes password from UsersService.create()
      return { access_token, refresh_token, user };
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Error during registration');
    }
  }

  forgotPassword(email: string): ForgotPasswordResponseDto {
    return { message: `If email ${email} exists, a reset link will be sent.` };
  }

  refreshToken(refreshToken: string): RefreshResponseDto {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.jwt.refreshSecret
      });
      // Additional validation could be added here (user existence, token revocation status)
      const access_token = this.jwtService.sign({ sub: payload.sub, roles: payload.roles });
      return { access_token };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      // Exclude password from response for security
      const { password: userPassword, ...result } = user;
      return result;
    }
    return null;
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,  // Map sub to userId for application use
      roles: payload.roles
    };
  }
}
