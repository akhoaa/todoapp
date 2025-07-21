import { IsNotEmpty, IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ example: 'Buy milk', description: 'Task title' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'Buy 2 liters of milk', required: false, description: 'Task description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'PENDING', required: false, enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'], description: 'Task status' })
  @IsOptional()
  @IsString()
  @IsIn(['PENDING', 'IN_PROGRESS', 'COMPLETED'])
  status?: string;
}
