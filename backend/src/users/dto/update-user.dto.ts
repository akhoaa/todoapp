import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, IsIn, MaxLength, IsUrl, IsNotEmpty } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'user@example.com', description: 'User email' })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(255, { message: 'Email cannot exceed 255 characters' })
  email?: string;

  @ApiPropertyOptional({ example: 'password123', description: 'User password (minimum 6 characters)' })
  @IsOptional()
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password cannot be empty when provided' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(128, { message: 'Password cannot exceed 128 characters' })
  password?: string;

  @ApiPropertyOptional({ example: 'John Doe', description: 'User full name' })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name cannot be empty when provided' })
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