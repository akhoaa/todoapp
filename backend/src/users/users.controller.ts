import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
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

  @ApiOperation({ summary: 'Get all users (admin only)' })
  @ApiResponse({ status: 200, description: 'List all users.' })
  @Roles('admin')
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile.' })
  @Roles('user', 'admin')
  @Get('profile')
  getProfile(@Req() req) {
    return this.usersService.findOne(req.user.userId);
  }

  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated.' })
  @Roles('user', 'admin')
  @Put('profile')
  updateProfile(@Req() req, @Body() dto: UpdateUserDto) {
    return this.usersService.update(req.user.userId, dto);
  }

  @ApiOperation({ summary: 'Change password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully.' })
  @Roles('user', 'admin')
  @Put('change-password')
  changePassword(@Req() req, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(req.user.userId, dto);
  }

  @ApiOperation({ summary: 'Get user by id (admin only)' })
  @ApiResponse({ status: 200, description: 'User detail.' })
  @Roles('admin')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(Number(id));
  }

  @ApiOperation({ summary: 'Create a new user (anyone)' })
  @ApiResponse({ status: 201, description: 'User created.' })
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @ApiOperation({ summary: 'Update a user (admin only)' })
  @ApiResponse({ status: 200, description: 'User updated.' })
  @Roles('admin')
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(Number(id), dto);
  }

  @ApiOperation({ summary: 'Delete a user (admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted.' })
  @Roles('admin')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.usersService.delete(Number(id));
  }
} 