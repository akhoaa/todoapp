import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsOptional, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class UserParamDto {
  @ApiProperty({ example: 1, description: 'User ID' })
  @Type(() => Number)
  @IsNumber({}, { message: 'User ID must be a number' })
  @IsPositive({ message: 'User ID must be a positive number' })
  @IsNotEmpty({ message: 'User ID is required' })
  userId: number;
}

export class TaskParamDto {
  @ApiProperty({ example: 1, description: 'Task ID' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Task ID must be a number' })
  @IsPositive({ message: 'Task ID must be a positive number' })
  @IsNotEmpty({ message: 'Task ID is required' })
  id: number;
}

export class TaskQueryDto {
  @ApiProperty({ example: 'PENDING', required: false, enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'], description: 'Filter by task status' })
  @IsOptional()
  @IsString()
  @IsIn(['PENDING', 'IN_PROGRESS', 'COMPLETED'], { message: 'Status must be one of: PENDING, IN_PROGRESS, COMPLETED' })
  status?: string;
}
