import { ApiProperty } from '@nestjs/swagger';

export class User {
  @ApiProperty({ example: 1, description: 'User ID' })
  id: number;

  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  email: string;

  @ApiProperty({ example: 'User Name', description: 'User name', required: false })
  name?: string;

  @ApiProperty({ example: 'https://example.com/avatar.png', description: 'User avatar', required: false })
  avatar?: string;

  @ApiProperty({ example: 'user', description: 'Legacy user role' })
  roles: string;

  @ApiProperty({
    example: [{ id: 1, name: 'user', description: 'Regular user' }],
    description: 'RBAC roles assigned to user',
    required: false
  })
  rbacRoles?: Array<{
    id: number;
    name: string;
    description?: string;
    permissions?: Array<{
      id: number;
      name: string;
      description?: string;
      resource: string;
      action: string;
    }>;
    assignedAt?: Date;
  }>;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z', description: 'Creation date', required: false })
  createdAt?: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z', description: 'Last update date', required: false })
  updatedAt?: Date;
}