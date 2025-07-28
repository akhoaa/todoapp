import { Injectable, InternalServerErrorException, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
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
          userRoles: {
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
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

      // Transform RBAC data for frontend
      const rbacRoles = user.userRoles.map(userRole => ({
        id: userRole.role.id,
        name: userRole.role.name,
        description: userRole.role.description,
      }));

      // Collect all permissions from all roles
      const permissions = new Set<string>();
      user.userRoles.forEach(userRole => {
        userRole.role.rolePermissions.forEach(rolePermission => {
          permissions.add(rolePermission.permission.name);
        });
      });

      // Return user with RBAC data
      const { userRoles, ...userWithoutUserRoles } = user;
      return {
        ...userWithoutUserRoles,
        rbacRoles,
        permissions: Array.from(permissions),
      };
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
      // Hash password securely
      const hashedPassword = await bcrypt.hash(dto.password, 10);

      // Create user with validated and processed data
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          name: dto.name,
          roles: dto.roles || 'user', // Default role
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          roles: true,
          // Exclude password from response
        },
      });

      // Assign default RBAC role to the new user
      const defaultRoleName = dto.roles || 'user';
      const defaultRole = await this.prisma.role.findUnique({
        where: { name: defaultRoleName }
      });

      if (defaultRole) {
        await this.prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: defaultRole.id,
          },
        });
      }

      return user;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error.code === 'P2002') {
        throw new BadRequestException('Email already exists');
      }
      throw new InternalServerErrorException('Error creating user');
    }
  }

  async update(id: number, dto: UpdateUserDto) {
    try {
      // Verify user exists
      const existingUser = await this.prisma.user.findUnique({
        where: { id },
        select: { id: true }
      });
      if (!existingUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      // Prepare update data with password hashing if needed
      const updateData: any = {
        email: dto.email,
        name: dto.name,
        avatar: dto.avatar,
        roles: dto.roles,
      };

      // Hash password if provided
      if (dto.password) {
        updateData.password = await bcrypt.hash(dto.password, 10);
      }

      // Update user with validated data
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
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error.code === 'P2002') {
        throw new BadRequestException('Email already exists');
      }
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with ID ${id} not found`);
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
      // Fetch user with password for verification
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, password: true }
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Verify current password matches
      const isCurrentPasswordValid = await bcrypt.compare(dto.currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new UnauthorizedException('Current password is incorrect');
      }

      // Prevent setting the same password
      const isSamePassword = await bcrypt.compare(dto.newPassword, user.password);
      if (isSamePassword) {
        throw new BadRequestException('New password must be different from current password');
      }

      // Hash new password securely
      const hashedNewPassword = await bcrypt.hash(dto.newPassword, 10);

      // Update password in database
      await this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      });

      return { message: 'Password changed successfully' };
    } catch (error) {
      if (error instanceof NotFoundException ||
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error changing password');
    }
  }

  // RBAC Methods
  async assignRole(userId: number, dto: AssignRoleDto) {
    try {
      // Check if user exists
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Check if role exists
      const role = await this.prisma.role.findUnique({ where: { id: dto.roleId } });
      if (!role) {
        throw new NotFoundException(`Role with ID ${dto.roleId} not found`);
      }

      // Assign role to user
      const userRole = await this.prisma.userRole.upsert({
        where: {
          userId_roleId: {
            userId,
            roleId: dto.roleId,
          },
        },
        update: {},
        create: {
          userId,
          roleId: dto.roleId,
        },
        include: {
          role: true,
        },
      });

      return { message: `Role '${role.name}' assigned to user successfully`, userRole };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error assigning role to user');
    }
  }

  async removeRole(userId: number, roleId: number) {
    try {
      // Check if user exists
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Check if role assignment exists
      const userRole = await this.prisma.userRole.findUnique({
        where: {
          userId_roleId: {
            userId,
            roleId,
          },
        },
        include: { role: true },
      });

      if (!userRole) {
        throw new NotFoundException('Role assignment not found');
      }

      // Remove role from user
      await this.prisma.userRole.delete({
        where: {
          userId_roleId: {
            userId,
            roleId,
          },
        },
      });

      return { message: `Role '${userRole.role.name}' removed from user successfully` };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error removing role from user');
    }
  }

  async getUserRoles(userId: number) {
    try {
      const userRoles = await this.prisma.userRole.findMany({
        where: { userId },
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      return userRoles.map(ur => ({
        id: ur.role.id,
        name: ur.role.name,
        description: ur.role.description,
        permissions: ur.role.rolePermissions.map(rp => ({
          id: rp.permission.id,
          name: rp.permission.name,
          description: rp.permission.description,
          resource: rp.permission.resource,
          action: rp.permission.action,
        })),
        assignedAt: ur.createdAt,
      }));
    } catch (error) {
      throw new InternalServerErrorException('Error fetching user roles');
    }
  }

  async findAllWithRoles() {
    try {
      const users = await this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          roles: true,
          userRoles: {
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
          createdAt: true,
          updatedAt: true,
        },
      });

      return users.map(user => {
        // Extract RBAC roles
        const rbacRoles = user.userRoles.map(ur => ur.role);

        // Extract all permissions from all roles
        const permissions = user.userRoles.reduce((allPermissions, userRole) => {
          const rolePermissions = userRole.role.rolePermissions.map(rp => rp.permission.name);
          return [...allPermissions, ...rolePermissions];
        }, []);

        // Remove duplicate permissions
        const uniquePermissions = [...new Set(permissions)];

        return {
          ...user,
          rbacRoles,
          permissions: uniquePermissions,
        };
      });
    } catch (error) {
      throw new InternalServerErrorException('Error fetching users with roles');
    }
  }
}