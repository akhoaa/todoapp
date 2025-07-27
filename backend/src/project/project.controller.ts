import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ProjectService } from './project.service';
import { CreateProjectDto, UpdateProjectDto, AddMemberDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';

@ApiTags('projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({ status: 201, description: 'Project created successfully.' })
  @RequirePermissions('project:create')
  @Post()
  create(
    @Body() createProjectDto: CreateProjectDto,
    @CurrentUser('userId') userId: number
  ) {
    return this.projectService.create(createProjectDto, userId);
  }

  @ApiOperation({ summary: 'Get all projects' })
  @ApiResponse({ status: 200, description: 'List of projects.' })
  @RequirePermissions('project:read')
  @Get()
  findAll(
    @CurrentUser('userId') userId: number,
    @CurrentUser('rbacRoles') userRoles: string[]
  ) {
    return this.projectService.findAll(userId, userRoles || []);
  }

  @ApiOperation({ summary: 'Get project by ID' })
  @ApiResponse({ status: 200, description: 'Project details.' })
  @ApiParam({ name: 'id', description: 'Project ID', type: 'number' })
  @RequirePermissions('project:read')
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId') userId: number,
    @CurrentUser('rbacRoles') userRoles: string[]
  ) {
    return this.projectService.findOne(id, userId, userRoles || []);
  }

  @ApiOperation({ summary: 'Update project' })
  @ApiResponse({ status: 200, description: 'Project updated successfully.' })
  @ApiParam({ name: 'id', description: 'Project ID', type: 'number' })
  @RequirePermissions('project:update')
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentUser('userId') userId: number,
    @CurrentUser('rbacRoles') userRoles: string[]
  ) {
    return this.projectService.update(id, updateProjectDto, userId, userRoles || []);
  }

  @ApiOperation({ summary: 'Delete project' })
  @ApiResponse({ status: 200, description: 'Project deleted successfully.' })
  @ApiParam({ name: 'id', description: 'Project ID', type: 'number' })
  @RequirePermissions('project:delete')
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId') userId: number,
    @CurrentUser('rbacRoles') userRoles: string[]
  ) {
    return this.projectService.remove(id, userId, userRoles || []);
  }

  // Member Management Endpoints
  @ApiOperation({ summary: 'Get project members' })
  @ApiResponse({ status: 200, description: 'List of project members.' })
  @ApiParam({ name: 'id', description: 'Project ID', type: 'number' })
  @RequirePermissions('project:read')
  @Get(':id/members')
  getMembers(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId') userId: number,
    @CurrentUser('rbacRoles') userRoles: string[]
  ) {
    return this.projectService.getMembers(id, userId, userRoles || []);
  }

  @ApiOperation({ summary: 'Add member to project' })
  @ApiResponse({ status: 201, description: 'Member added successfully.' })
  @ApiParam({ name: 'id', description: 'Project ID', type: 'number' })
  @RequirePermissions('project:manage_members')
  @Post(':id/members')
  addMember(
    @Param('id', ParseIntPipe) id: number,
    @Body() addMemberDto: AddMemberDto,
    @CurrentUser('userId') userId: number,
    @CurrentUser('rbacRoles') userRoles: string[]
  ) {
    return this.projectService.addMember(id, addMemberDto, userId, userRoles || []);
  }

  @ApiOperation({ summary: 'Remove member from project' })
  @ApiResponse({ status: 200, description: 'Member removed successfully.' })
  @ApiParam({ name: 'id', description: 'Project ID', type: 'number' })
  @ApiParam({ name: 'memberId', description: 'Member ID', type: 'number' })
  @RequirePermissions('project:manage_members')
  @Delete(':id/members/:memberId')
  removeMember(
    @Param('id', ParseIntPipe) id: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @CurrentUser('userId') userId: number,
    @CurrentUser('rbacRoles') userRoles: string[]
  ) {
    return this.projectService.removeMember(id, memberId, userId, userRoles || []);
  }
}
