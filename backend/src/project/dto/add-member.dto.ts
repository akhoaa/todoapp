import { IsInt, IsPositive, IsEnum, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ProjectMemberRole {
  MEMBER = 'MEMBER',
  MANAGER = 'MANAGER',
}

export class AddMemberDto {
  @ApiProperty({ example: 1, description: 'User ID to add as project member' })
  @IsNotEmpty({ message: 'User ID is required' })
  @IsInt({ message: 'User ID must be an integer' })
  @IsPositive({ message: 'User ID must be a positive number' })
  userId: number;

  @ApiProperty({
    example: 'MEMBER',
    description: 'Member role in the project',
    enum: ProjectMemberRole,
    required: false,
    default: 'MEMBER'
  })
  @IsOptional()
  @IsEnum(ProjectMemberRole, { message: 'Role must be one of: MEMBER, MANAGER' })
  role?: ProjectMemberRole;
}
