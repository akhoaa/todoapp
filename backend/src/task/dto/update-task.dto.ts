import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNotEmpty, IsIn, MaxLength, MinLength, IsInt, IsPositive } from 'class-validator';
import { CreateTaskDto } from './create-task.dto';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ApiPropertyOptional({ example: 'Buy bread', description: 'Task title' })
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title cannot be empty' })
  @MinLength(1, { message: 'Title cannot be empty' })
  @MaxLength(255, { message: 'Title cannot exceed 255 characters' })
  title?: string;

  @ApiPropertyOptional({ example: 'Buy 1 loaf of bread', required: false, description: 'Task description' })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(1000, { message: 'Description cannot exceed 1000 characters' })
  description?: string;

  @ApiPropertyOptional({ example: 'COMPLETED', required: false, enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'], description: 'Task status' })
  @IsOptional()
  @IsString({ message: 'Status must be a string' })
  @IsIn(['PENDING', 'IN_PROGRESS', 'COMPLETED'], { message: 'Status must be one of: PENDING, IN_PROGRESS, COMPLETED' })
  status?: string;

  @ApiPropertyOptional({ example: 1, required: false, description: 'Project ID to associate task with' })
  @IsOptional()
  @IsInt({ message: 'Project ID must be an integer' })
  @IsPositive({ message: 'Project ID must be a positive number' })
  projectId?: number;
}
