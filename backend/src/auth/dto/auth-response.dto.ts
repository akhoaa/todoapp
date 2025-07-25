import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 1, description: 'User ID' })
  id: number;

  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  email: string;

  @ApiProperty({ example: 'John Doe', description: 'User name', required: false })
  name?: string | null;

  @ApiProperty({ example: 'https://example.com/avatar.png', description: 'User avatar', required: false })
  avatar?: string | null;

  @ApiProperty({ example: 'user', description: 'User role' })
  roles: string;
}

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'JWT access token' })
  access_token: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'JWT refresh token' })
  refresh_token: string;

  @ApiProperty({ type: UserResponseDto, description: 'User information' })
  user: UserResponseDto;
}

export class RefreshResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'New JWT access token' })
  access_token: string;
}

export class ForgotPasswordResponseDto {
  @ApiProperty({ example: 'If email user@example.com exists, a reset link will be sent.', description: 'Response message' })
  message: string;
}

export class LogoutResponseDto {
  @ApiProperty({ example: 'Logout successful. Please remove the token from client storage.', description: 'Logout message' })
  message: string;
}
