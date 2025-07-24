import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) { }

  @ApiOperation({ summary: 'Get all tasks (admin sees all, users see own)' })
  @ApiResponse({ status: 200, description: 'List all tasks based on user role.' })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'], description: 'Filter by task status' })
  @Roles('user', 'admin')
  @Get()
  findAll(@CurrentUser() user: any, @Query('status') status?: string) {
    return this.taskService.findAll(user, status);
  }

  @ApiOperation({ summary: 'Get a task by id (user or admin)' })
  @ApiResponse({ status: 200, description: 'Task detail.' })
  @Roles('user', 'admin')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.taskService.findOne(Number(id));
  }

  @ApiOperation({ summary: 'Create a new task (user or admin)' })
  @ApiResponse({ status: 201, description: 'Task created.' })
  @Roles('user', 'admin')
  @Post()
  create(@Body() dto: CreateTaskDto, @CurrentUser('userId') userId: number) {
    return this.taskService.create(userId, dto);
  }

  @ApiOperation({ summary: 'Update a task (user or admin)' })
  @ApiResponse({ status: 200, description: 'Task updated.' })
  @Roles('user', 'admin')
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTaskDto, @CurrentUser() user: any) {
    return this.taskService.updateWithOwnershipCheck(Number(id), dto, user);
  }

  @ApiOperation({ summary: 'Delete a task (user or admin)' })
  @ApiResponse({ status: 200, description: 'Task deleted.' })
  @Roles('user', 'admin')
  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.taskService.deleteWithOwnershipCheck(Number(id), user);
  }
}
