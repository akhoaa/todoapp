import { IsNotEmpty, IsString, IsOptional, IsIn, IsInt, IsPositive, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ example: 'Buy milk', description: 'Task title' })
  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be a string' })
  @MinLength(1, { message: 'Title cannot be empty' })
  @MaxLength(255, { message: 'Title cannot exceed 255 characters' })
  title: string;

  @ApiProperty({ example: 'Buy 2 liters of milk', required: false, description: 'Task description' })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(1000, { message: 'Description cannot exceed 1000 characters' })
  description?: string;

  @ApiProperty({ example: 'PENDING', required: false, enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'], description: 'Task status' })
  @IsOptional()
  @IsString({ message: 'Status must be a string' })
  @IsIn(['PENDING', 'IN_PROGRESS', 'COMPLETED'], { message: 'Status must be one of: PENDING, IN_PROGRESS, COMPLETED' })
  status?: string;

  @ApiProperty({ example: 1, required: false, description: 'Project ID to associate task with' })
  @IsOptional()
  @IsInt({ message: 'Project ID must be an integer' })
  @IsPositive({ message: 'Project ID must be a positive number' })
  projectId?: number;
}
