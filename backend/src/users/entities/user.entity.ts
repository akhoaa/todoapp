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

  @ApiProperty({ example: 'user', description: 'User role' })
  roles: string;
} 