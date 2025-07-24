import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 201, description: 'Login successful, returns JWT.' })
  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  @ApiOperation({ summary: 'User register' })
  @ApiResponse({ status: 201, description: 'Register successful, returns user.' })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user info.' })
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    return user;
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logout successful.' })
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@CurrentUser() user: any) {
    return { message: 'Logout successful (client hãy xoá token ở phía client).' };
  }

  @ApiOperation({ summary: 'Forgot password' })
  @ApiResponse({ status: 200, description: 'If email exists, send reset link.' })
  @Post('forgot-password')
  forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body.email);
  }

  @ApiOperation({ summary: 'Refresh token' })
  @ApiResponse({ status: 200, description: 'Return new access token if refresh token is valid.' })
  @Post('refresh')
  refresh(@Body() body: RefreshTokenDto) {
    return this.authService.refreshToken(body.refreshToken);
  }
}
