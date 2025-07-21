import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ApiPropertyOptional({ example: 'Buy bread', description: 'Task title' })
  title?: string;

  @ApiPropertyOptional({ example: 'Buy 1 loaf of bread', required: false, description: 'Task description' })
  description?: string;

  @ApiPropertyOptional({ example: 'COMPLETED', required: false, description: 'Task status' })
  status?: string;
}
