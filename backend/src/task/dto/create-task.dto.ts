import { IsNotEmpty, IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ example: 'Buy milk', description: 'Task title' })
  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be a string' })
  title: string;

  @ApiProperty({ example: 'Buy 2 liters of milk', required: false, description: 'Task description' })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiProperty({ example: 'PENDING', required: false, enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'], description: 'Task status' })
  @IsOptional()
  @IsString({ message: 'Status must be a string' })
  @IsIn(['PENDING', 'IN_PROGRESS', 'COMPLETED'], { message: 'Status must be one of: PENDING, IN_PROGRESS, COMPLETED' })
  status?: string;
}
