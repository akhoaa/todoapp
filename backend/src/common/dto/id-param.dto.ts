import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class IdParamDto {
  @ApiProperty({ example: 1, description: 'Resource ID' })
  @Type(() => Number)
  @IsInt({ message: 'ID must be an integer' })
  @IsPositive({ message: 'ID must be a positive number' })
  @IsNotEmpty({ message: 'ID is required' })
  id: number;
}

export class UserIdParamDto {
  @ApiProperty({ example: 1, description: 'User ID' })
  @Type(() => Number)
  @IsInt({ message: 'User ID must be an integer' })
  @IsPositive({ message: 'User ID must be a positive number' })
  @IsNotEmpty({ message: 'User ID is required' })
  userId: number;
}

export class ProjectIdParamDto {
  @ApiProperty({ example: 1, description: 'Project ID' })
  @Type(() => Number)
  @IsInt({ message: 'Project ID must be an integer' })
  @IsPositive({ message: 'Project ID must be a positive number' })
  @IsNotEmpty({ message: 'Project ID is required' })
  projectId: number;
}

export class RoleIdParamDto {
  @ApiProperty({ example: 1, description: 'Role ID' })
  @Type(() => Number)
  @IsInt({ message: 'Role ID must be an integer' })
  @IsPositive({ message: 'Role ID must be a positive number' })
  @IsNotEmpty({ message: 'Role ID is required' })
  roleId: number;
}
