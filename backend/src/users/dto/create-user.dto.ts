import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsIn, MaxLength, IsUrl } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @MaxLength(255, { message: 'Email cannot exceed 255 characters' })
  email: string;

  @ApiProperty({ example: 'password123', description: 'User password (minimum 6 characters)' })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(128, { message: 'Password cannot exceed 128 characters' })
  password: string;

  @ApiPropertyOptional({ example: 'John Doe', description: 'User full name' })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(1, { message: 'Name cannot be empty when provided' })
  @MaxLength(255, { message: 'Name cannot exceed 255 characters' })
  name?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.png', description: 'User avatar URL' })
  @IsOptional()
  @IsString({ message: 'Avatar must be a string' })
  @IsUrl({}, { message: 'Avatar must be a valid URL' })
  @MaxLength(500, { message: 'Avatar URL cannot exceed 500 characters' })
  avatar?: string;

  @ApiPropertyOptional({ example: 'user', description: 'User role', enum: ['user', 'manager', 'admin'] })
  @IsOptional()
  @IsString({ message: 'Role must be a string' })
  @IsIn(['user', 'manager', 'admin'], { message: 'Role must be one of: user, manager, admin' })
  roles?: string;
}