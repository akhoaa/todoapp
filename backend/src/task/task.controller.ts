import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { TaskService } from './task.service';
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) { }

  @ApiOperation({ summary: 'Get all tasks (admin sees all, users see own)' })
  @ApiResponse({ status: 200, description: 'List all tasks based on user role.' })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'], description: 'Filter by task status' })
  @RequirePermissions('task:read')
  @Get()
  findAll(@CurrentUser() user: any, @Query('status') status?: string) {
    return this.taskService.findAll(user, status);
  }

  @ApiOperation({ summary: 'Get a task by id (user or admin)' })
  @ApiResponse({ status: 200, description: 'Task detail.' })
  @ApiParam({ name: 'id', description: 'Task ID', type: 'number' })
  @RequirePermissions('task:read')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.taskService.findOne(id);
  }

  @ApiOperation({ summary: 'Create a new task (user or admin)' })
  @ApiResponse({ status: 201, description: 'Task created.' })
  @RequirePermissions('task:create')
  @Post()
  create(@Body() dto: CreateTaskDto, @CurrentUser('userId') userId: number) {
    return this.taskService.create(userId, dto);
  }

  @ApiOperation({ summary: 'Update a task (user or admin)' })
  @ApiResponse({ status: 200, description: 'Task updated.' })
  @ApiParam({ name: 'id', description: 'Task ID', type: 'number' })
  @RequirePermissions('task:update')
  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTaskDto, @CurrentUser() user: any) {
    return this.taskService.updateWithOwnershipCheck(id, dto, user);
  }

  @ApiOperation({ summary: 'Delete a task (user or admin)' })
  @ApiResponse({ status: 200, description: 'Task deleted.' })
  @ApiParam({ name: 'id', description: 'Task ID', type: 'number' })
  @RequirePermissions('task:delete')
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.taskService.deleteWithOwnershipCheck(id, user);
  }
}
