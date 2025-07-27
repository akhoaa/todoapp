import { ApiProperty } from '@nestjs/swagger';

export class Project {
  @ApiProperty({ example: 1, description: 'Project ID' })
  id: number;

  @ApiProperty({ example: 'Website Redesign', description: 'Project name' })
  name: string;

  @ApiProperty({ example: 'Complete redesign of the company website', description: 'Project description', required: false })
  description?: string;

  @ApiProperty({ example: 'ACTIVE', description: 'Project status', enum: ['ACTIVE', 'COMPLETED', 'ARCHIVED'] })
  status: string;

  @ApiProperty({ example: 1, description: 'Project owner ID' })
  ownerId: number;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z', description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z', description: 'Last update date' })
  updatedAt: Date;

  @ApiProperty({ 
    example: { id: 1, name: 'John Doe', email: 'john@example.com' }, 
    description: 'Project owner',
    required: false 
  })
  owner?: {
    id: number;
    name: string;
    email: string;
  };

  @ApiProperty({ 
    example: [{ id: 1, title: 'Task 1', status: 'PENDING' }], 
    description: 'Project tasks',
    required: false 
  })
  tasks?: Array<{
    id: number;
    title: string;
    description?: string;
    status: string;
    userId: number;
    createdAt: Date;
    updatedAt: Date;
  }>;

  @ApiProperty({ 
    example: [{ id: 1, userId: 2, role: 'MEMBER', user: { id: 2, name: 'Jane Doe', email: 'jane@example.com' } }], 
    description: 'Project members',
    required: false 
  })
  members?: Array<{
    id: number;
    userId: number;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    user: {
      id: number;
      name: string;
      email: string;
    };
  }>;
}
