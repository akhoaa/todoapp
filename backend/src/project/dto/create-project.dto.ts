import { IsString, IsOptional, IsEnum, MaxLength, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export class CreateProjectDto {
  @ApiProperty({ example: 'Website Redesign', description: 'Project name' })
  @IsNotEmpty({ message: 'Project name is required' })
  @IsString({ message: 'Project name must be a string' })
  @MinLength(1, { message: 'Project name cannot be empty' })
  @MaxLength(255, { message: 'Project name cannot exceed 255 characters' })
  name: string;

  @ApiProperty({
    example: 'Complete redesign of the company website',
    description: 'Project description',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Project description must be a string' })
  @MaxLength(1000, { message: 'Project description cannot exceed 1000 characters' })
  description?: string;

  @ApiProperty({
    example: 'ACTIVE',
    description: 'Project status',
    enum: ProjectStatus,
    required: false,
    default: 'ACTIVE'
  })
  @IsOptional()
  @IsEnum(ProjectStatus, { message: 'Status must be one of: ACTIVE, COMPLETED, ARCHIVED' })
  status?: ProjectStatus;
}
