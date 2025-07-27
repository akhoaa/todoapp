import { IsInt, IsPositive, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRoleDto {
  @ApiProperty({ example: 1, description: 'Role ID to assign to the user' })
  @IsNotEmpty({ message: 'Role ID is required' })
  @IsInt({ message: 'Role ID must be an integer' })
  @IsPositive({ message: 'Role ID must be a positive number' })
  roleId: number;
}
