import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  AuthResponseDto,
  RefreshResponseDto,
  LogoutResponseDto,
  UserResponseDto
} from './dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 201, description: 'Login successful, returns JWT.', type: AuthResponseDto })
  @Post('login')
  login(@Body() body: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(body.email, body.password);
  }

  @ApiOperation({ summary: 'User register' })
  @ApiResponse({ status: 201, description: 'Register successful, returns user.', type: AuthResponseDto })
  @Post('register')
  register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user info.', type: UserResponseDto })
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    return user;
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logout successful.', type: LogoutResponseDto })
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@CurrentUser() user: any): LogoutResponseDto {
    return { message: 'Logout successful. Please remove the token from client storage.' };
  }


  @ApiOperation({ summary: 'Reset password' })
  @ApiResponse({ status: 200, description: 'Password reset successful.' })
  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body);
  }

  @ApiOperation({ summary: 'Refresh token' })
  @ApiResponse({ status: 200, description: 'Return new access token if refresh token is valid.', type: RefreshResponseDto })
  @Post('refresh')
  refresh(@Body() body: RefreshTokenDto): Promise<RefreshResponseDto> {
    return this.authService.refreshToken(body.refreshToken);
  }
}
