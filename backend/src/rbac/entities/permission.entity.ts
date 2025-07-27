import { ApiProperty } from '@nestjs/swagger';

export class Permission {
  @ApiProperty({ example: 1, description: 'Permission ID' })
  id: number;

  @ApiProperty({ example: 'task:create', description: 'Permission name' })
  name: string;

  @ApiProperty({ example: 'Create tasks', description: 'Permission description', required: false })
  description?: string;

  @ApiProperty({ example: 'task', description: 'Resource type' })
  resource: string;

  @ApiProperty({ example: 'create', description: 'Action type' })
  action: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z', description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z', description: 'Last update date' })
  updatedAt: Date;
}
