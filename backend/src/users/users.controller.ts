import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @ApiOperation({ summary: 'Get system statistics (admin only)' })
  @ApiResponse({ status: 200, description: 'System statistics.' })
  @Roles('admin')
  @Get('statistics')
  getStatistics() {
    return this.usersService.getStatistics();
  }

  @ApiOperation({ summary: 'Get all users with roles (admin only)' })
  @ApiResponse({ status: 200, description: 'List all users with their roles.' })
  @RequirePermissions('user:read_all')
  @Get()
  findAll() {
    return this.usersService.findAllWithRoles();
  }

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile.' })
  @RequirePermissions('user:read')
  @Get('profile')
  getProfile(@CurrentUser('userId') userId: number) {
    return this.usersService.findOne(userId);
  }

  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated.' })
  @RequirePermissions('user:update')
  @Put('profile')
  updateProfile(@CurrentUser('userId') userId: number, @Body() dto: UpdateUserDto) {
    return this.usersService.update(userId, dto);
  }

  @ApiOperation({ summary: 'Change password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully.' })
  @Roles('user', 'admin')
  @Put('change-password')
  changePassword(@CurrentUser('userId') userId: number, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(userId, dto);
  }

  @ApiOperation({ summary: 'Get user by id (admin only)' })
  @ApiResponse({ status: 200, description: 'User detail.' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'number' })
  @Roles('admin')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @ApiOperation({ summary: 'Create a new user (anyone)' })
  @ApiResponse({ status: 201, description: 'User created.' })
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @ApiOperation({ summary: 'Update a user (admin only)' })
  @ApiResponse({ status: 200, description: 'User updated.' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'number' })
  @Roles('admin')
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete a user (admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted.' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'number' })
  @RequirePermissions('user:delete')
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.delete(id);
  }

  // RBAC Endpoints
  @ApiOperation({ summary: 'Get user roles' })
  @ApiResponse({ status: 200, description: 'User roles with permissions.' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'number' })
  @RequirePermissions('user:read')
  @Get(':id/roles')
  getUserRoles(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUserRoles(id);
  }

  @ApiOperation({ summary: 'Assign role to user (admin only)' })
  @ApiResponse({ status: 200, description: 'Role assigned successfully.' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'number' })
  @RequirePermissions('user:manage_roles')
  @Post(':id/roles')
  assignRole(@Param('id', ParseIntPipe) id: number, @Body() dto: AssignRoleDto) {
    return this.usersService.assignRole(id, dto);
  }

  @ApiOperation({ summary: 'Remove role from user (admin only)' })
  @ApiResponse({ status: 200, description: 'Role removed successfully.' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'number' })
  @ApiParam({ name: 'roleId', description: 'Role ID', type: 'number' })
  @RequirePermissions('user:manage_roles')
  @Delete(':id/roles/:roleId')
  removeRole(
    @Param('id', ParseIntPipe) id: number,
    @Param('roleId', ParseIntPipe) roleId: number
  ) {
    return this.usersService.removeRole(id, roleId);
  }
}