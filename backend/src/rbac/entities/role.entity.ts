import { ApiProperty } from '@nestjs/swagger';

export class Role {
  @ApiProperty({ example: 1, description: 'Role ID' })
  id: number;

  @ApiProperty({ example: 'admin', description: 'Role name' })
  name: string;

  @ApiProperty({ example: 'Administrator with full system access', description: 'Role description', required: false })
  description?: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z', description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z', description: 'Last update date' })
  updatedAt: Date;
}
