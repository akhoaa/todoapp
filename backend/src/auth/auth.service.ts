
import { Injectable, UnauthorizedException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '../config/config.service';
import { RbacService } from '../rbac/rbac.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto, AuthResponseDto, RefreshResponseDto, ForgotPasswordResponseDto } from './dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private rbacService: RbacService,
  ) { }

  async login(email: string, password: string): Promise<AuthResponseDto> {
    try {
      // Find user by email
      const user = await this.userService.findByEmail(email);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Get user roles and permissions for JWT payload
      const userRoles = await this.rbacService.getUserRoles(user.id);
      const userPermissions = await this.rbacService.getUserPermissions(user.id);

      // Generate access token and refresh token with RBAC information
      const payload = {
        sub: user.id,
        userId: user.id,
        roles: user.roles || 'user', // Keep legacy role for backward compatibility
        rbacRoles: userRoles,
        permissions: userPermissions
      };

      const access_token = this.jwtService.sign(payload);
      const refresh_token = this.jwtService.sign(payload, {
        secret: this.configService.jwt.refreshSecret,
        expiresIn: this.configService.jwt.refreshExpiresIn
      });

      // Get user with RBAC data for login response
      const userWithRbac = await this.userService.findOne(user.id);

      return {
        access_token,
        refresh_token,
        user: userWithRbac
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Error during login process');
    }
  }

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    try {
      // Check if user already exists
      const existingUser = await this.userService.findByEmail(dto.email);
      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }

      // Create new user (UserService handles password hashing and validation)
      const user = await this.userService.create({
        email: dto.email,
        password: dto.password,
        name: dto.name
      });

      // Get user roles and permissions for JWT payload (new users get default 'user' role)
      const userRoles = await this.rbacService.getUserRoles(user.id);
      const userPermissions = await this.rbacService.getUserPermissions(user.id);

      // Generate access token and refresh token with RBAC information
      const payload = {
        sub: user.id,
        userId: user.id,
        roles: user.roles || 'user', // Keep legacy role for backward compatibility
        rbacRoles: userRoles,
        permissions: userPermissions
      };

      const access_token = this.jwtService.sign(payload);
      const refresh_token = this.jwtService.sign(payload, {
        secret: this.configService.jwt.refreshSecret,
        expiresIn: this.configService.jwt.refreshExpiresIn
      });

      // Get user with RBAC data for registration response
      const userWithRbac = await this.userService.findOne(user.id);

      return {
        access_token,
        refresh_token,
        user: userWithRbac
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error during registration process');
    }
  }


  /**
   * Reset password using token and new password
   * This is a simplified version. In production, you should verify the token, check expiry, etc.
   */
  async resetPassword(dto: ResetPasswordDto) {
    // TODO: Verify token, find user by token, check expiry, etc.
    // For demo, assume token is user's email (replace with real token logic)
    const user = await this.userService.findByEmail(dto.token);
    if (!user) {
      throw new BadRequestException('Invalid or expired token');
    }
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.userService.update(user.id, { password: dto.newPassword });
    return { message: 'Password reset successful.' };
  }

  async refreshToken(refreshToken: string): Promise<RefreshResponseDto> {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.jwt.refreshSecret
      });

      // Verify user still exists
      const user = await this.userService.findOne(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User no longer exists');
      }

      // Get fresh RBAC information for the user
      const userRoles = await this.rbacService.getUserRoles(payload.sub);
      const userPermissions = await this.rbacService.getUserPermissions(payload.sub);

      // Generate new access token with updated RBAC information
      const newPayload = {
        sub: payload.sub,
        userId: payload.sub,
        roles: payload.roles, // Keep legacy role for backward compatibility
        rbacRoles: userRoles,
        permissions: userPermissions
      };

      const access_token = this.jwtService.sign(newPayload);
      return { access_token };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.userService.findByEmail(email);
      if (user && await bcrypt.compare(password, user.password)) {
        // Exclude password from response for security
        const { password: userPassword, ...result } = user;
        return result;
      }
      return null;
    } catch (error) {
      throw new InternalServerErrorException('Error validating user credentials');
    }
  }

  async validate(payload: any) {
    try {
      return {
        id: payload.sub,      // Add id for RBAC service compatibility
        userId: payload.sub,  // Map sub to userId for application use
        roles: payload.roles, // Legacy role support
        rbacRoles: payload.rbacRoles || [],
        permissions: payload.permissions || []
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token payload');
    }
  }
}
