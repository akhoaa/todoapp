import { Injectable, UnauthorizedException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '../config/config.service';
import * as bcrypt from 'bcryptjs';
import { ApiProperty } from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';

export class AuthLoginDto {
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'password123' })
  password: string;
}

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  async login(email: string, password: string) {
    try {
      const user = await this.userService.findByEmail(email);
      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new UnauthorizedException('Invalid credentials');
      }
      // Tạo access token và refresh token
      // Ensure user.roles exists, fallback to empty array if not present
      const payload = { sub: user.id, userId: user.id, roles: (user as any).roles || [] };
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

  async register(dto: RegisterDto) {
    try {
      if (!dto.email || !dto.password) {
        throw new BadRequestException('Email and password are required');
      }

      const existing = await this.userService.findByEmail(dto.email);
      if (existing) {
        throw new BadRequestException('Email already exists');
      }

      const hashed = await bcrypt.hash(dto.password, 10);
      const user = await this.userService.create({
        email: dto.email,
        password: hashed
      });

      // Tạo access token và refresh token
      const payload = { sub: user.id, userId: user.id, roles: (user as any).roles || [] };
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

  forgotPassword(email: string) {
    return { message: `If email ${email} exists, a reset link will be sent.` };
  }

  refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.jwt.refreshSecret
      });
      // Có thể kiểm tra thêm user tồn tại, token có bị revoke không
      const access_token = this.jwtService.sign({ sub: payload.sub, roles: payload.roles });
      return { access_token };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      // Không trả về password!
      const { password: userPassword, ...result } = user;
      return result;
    }
    return null;
  }
}
