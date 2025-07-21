import { Injectable, InternalServerErrorException, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async findAll() {
    try {
      const users = await this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          roles: true,
          // Exclude password from response
        },
      });
      return users;
    } catch (error) {
      throw new InternalServerErrorException('Error fetching users');
    }
  }

  async findOne(id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          roles: true,
          tasks: {
            select: {
              id: true,
              title: true,
              description: true,
              status: true,
              createdAt: true,
            },
          },
          // Exclude password from response
        },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error finding user');
    }
  }

  async findByEmail(email: string) {
    try {
      return await this.prisma.user.findUnique({ where: { email } });
    } catch (error) {
      throw new InternalServerErrorException('Error finding user by email');
    }
  }

  async create(dto: CreateUserDto) {
    try {
      // Hash password if provided
      const hashedPassword = dto.password ? await bcrypt.hash(dto.password, 10) : undefined;

      const userData = {
        ...dto,
        password: hashedPassword || dto.password,
        roles: dto.roles || 'user', // Default role
      };

      const user = await this.prisma.user.create({
        data: userData,
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          roles: true,
          // Exclude password from response
        },
      });

      return user;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Email already exists');
      }
      throw new InternalServerErrorException('Error creating user');
    }
  }

  async update(id: number, dto: UpdateUserDto) {
    try {
      // Check if user exists
      const existingUser = await this.prisma.user.findUnique({ where: { id } });
      if (!existingUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      // Hash password if provided
      const updateData = { ...dto };
      if (dto.password) {
        updateData.password = await bcrypt.hash(dto.password, 10);
      }

      const user = await this.prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          roles: true,
          // Exclude password from response
        },
      });

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error.code === 'P2002') {
        throw new BadRequestException('Email already exists');
      }
      throw new InternalServerErrorException('Error updating user');
    }
  }

  async delete(id: number) {
    try {
      // Check if user exists
      const existingUser = await this.prisma.user.findUnique({ where: { id } });
      if (!existingUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      // Delete user (this will cascade delete tasks due to foreign key)
      await this.prisma.user.delete({ where: { id } });

      return { message: `User with ID ${id} has been deleted successfully` };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error deleting user');
    }
  }

  async getStatistics() {
    try {
      const [totalUsers, totalTasks, usersByRole, tasksByStatus] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.task.count(),
        this.prisma.user.groupBy({
          by: ['roles'],
          _count: {
            roles: true,
          },
        }),
        this.prisma.task.groupBy({
          by: ['status'],
          _count: {
            status: true,
          },
        }),
      ]);

      return {
        totalUsers,
        totalTasks,
        usersByRole: usersByRole.reduce((acc, item) => {
          acc[item.roles] = item._count.roles;
          return acc;
        }, {}),
        tasksByStatus: tasksByStatus.reduce((acc, item) => {
          acc[item.status] = item._count.status;
          return acc;
        }, {}),
      };
    } catch (error) {
      throw new InternalServerErrorException('Error fetching statistics');
    }
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    try {
      // Get user with password
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(dto.currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new UnauthorizedException('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(dto.newPassword, 10);

      // Update password
      await this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      });

      return { message: 'Password changed successfully' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Error changing password');
    }
  }
}