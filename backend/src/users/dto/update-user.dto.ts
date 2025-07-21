import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, IsIn } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'user@example.com', description: 'User email' })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @ApiPropertyOptional({ example: 'password123', description: 'User password (minimum 6 characters)' })
  @IsOptional()
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password?: string;

  @ApiPropertyOptional({ example: 'John Doe', description: 'User full name' })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  name?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.png', description: 'User avatar URL' })
  @IsOptional()
  @IsString({ message: 'Avatar must be a string' })
  avatar?: string;

  @ApiPropertyOptional({ example: 'user', description: 'User role', enum: ['user', 'admin'] })
  @IsOptional()
  @IsString({ message: 'Role must be a string' })
  @IsIn(['user', 'admin'], { message: 'Role must be either user or admin' })
  roles?: string;
}