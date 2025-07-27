import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RbacService {
  constructor(private prisma: PrismaService) { }

  /**
   * Get user roles with permissions
   */
  async getUserRolesWithPermissions(userId: number) {
    try {
      if (!userId || userId <= 0) {
        throw new BadRequestException('Valid user ID is required');
      }

      return await this.prisma.userRole.findMany({
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
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error fetching user roles with permissions');
    }
  }

  /**
   * Get all permissions for a user
   */
  async getUserPermissions(userId: number): Promise<string[]> {
    try {
      if (!userId || userId <= 0) {
        throw new BadRequestException('Valid user ID is required');
      }

      const userRoles = await this.getUserRolesWithPermissions(userId);
      const permissions = new Set<string>();

      userRoles.forEach(userRole => {
        userRole.role.rolePermissions.forEach(rolePermission => {
          permissions.add(rolePermission.permission.name);
        });
      });

      return Array.from(permissions);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error fetching user permissions');
    }
  }

  /**
   * Check if user has specific permission
   */
  async hasPermission(userId: number, permissionName: string): Promise<boolean> {
    try {
      if (!userId || userId <= 0) {
        throw new BadRequestException('Valid user ID is required');
      }
      if (!permissionName || typeof permissionName !== 'string') {
        throw new BadRequestException('Valid permission name is required');
      }

      const permissions = await this.getUserPermissions(userId);
      return permissions.includes(permissionName);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error checking user permission');
    }
  }

  /**
   * Check if user has any of the specified permissions
   */
  async hasAnyPermission(userId: number, permissionNames: string[]): Promise<boolean> {
    try {
      if (!userId || userId <= 0) {
        throw new BadRequestException('Valid user ID is required');
      }
      if (!Array.isArray(permissionNames) || permissionNames.length === 0) {
        throw new BadRequestException('Valid permission names array is required');
      }

      const permissions = await this.getUserPermissions(userId);
      return permissionNames.some(permission => permissions.includes(permission));
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error checking user permissions');
    }
  }

  /**
   * Check if user has all of the specified permissions
   */
  async hasAllPermissions(userId: number, permissionNames: string[]): Promise<boolean> {
    try {
      if (!userId || userId <= 0) {
        throw new BadRequestException('Valid user ID is required');
      }
      if (!Array.isArray(permissionNames) || permissionNames.length === 0) {
        throw new BadRequestException('Valid permission names array is required');
      }

      const permissions = await this.getUserPermissions(userId);
      return permissionNames.every(permission => permissions.includes(permission));
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error checking user permissions');
    }
  }

  /**
   * Get user roles
   */
  async getUserRoles(userId: number): Promise<string[]> {
    try {
      if (!userId || userId <= 0) {
        throw new BadRequestException('Valid user ID is required');
      }

      const userRoles = await this.prisma.userRole.findMany({
        where: { userId },
        include: { role: true },
      });

      return userRoles.map(userRole => userRole.role.name);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error fetching user roles');
    }
  }

  /**
   * Check if user has specific role
   */
  async hasRole(userId: number, roleName: string): Promise<boolean> {
    try {
      if (!userId || userId <= 0) {
        throw new BadRequestException('Valid user ID is required');
      }
      if (!roleName || typeof roleName !== 'string') {
        throw new BadRequestException('Valid role name is required');
      }

      const roles = await this.getUserRoles(userId);
      return roles.includes(roleName);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error checking user role');
    }
  }

  /**
   * Check if user has any of the specified roles
   */
  async hasAnyRole(userId: number, roleNames: string[]): Promise<boolean> {
    try {
      if (!userId || userId <= 0) {
        throw new BadRequestException('Valid user ID is required');
      }
      if (!Array.isArray(roleNames) || roleNames.length === 0) {
        throw new BadRequestException('Valid role names array is required');
      }

      const roles = await this.getUserRoles(userId);
      return roleNames.some(role => roles.includes(role));
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error checking user roles');
    }
  }

  /**
   * Assign role to user
   */
  async assignRoleToUser(userId: number, roleId: number) {
    try {
      if (!userId || userId <= 0) {
        throw new BadRequestException('Valid user ID is required');
      }
      if (!roleId || roleId <= 0) {
        throw new BadRequestException('Valid role ID is required');
      }

      // Verify user and role exist
      const [user, role] = await Promise.all([
        this.prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
        this.prisma.role.findUnique({ where: { id: roleId }, select: { id: true } })
      ]);

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      if (!role) {
        throw new NotFoundException(`Role with ID ${roleId} not found`);
      }

      return this.prisma.userRole.upsert({
        where: {
          userId_roleId: {
            userId,
            roleId,
          },
        },
        update: {},
        create: {
          userId,
          roleId,
        },
      });
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      if (error.code === 'P2003') {
        throw new BadRequestException('Invalid user or role reference');
      }
      throw new InternalServerErrorException('Error assigning role to user');
    }
  }

  /**
   * Remove role from user
   */
  async removeRoleFromUser(userId: number, roleId: number) {
    try {
      if (!userId || userId <= 0) {
        throw new BadRequestException('Valid user ID is required');
      }
      if (!roleId || roleId <= 0) {
        throw new BadRequestException('Valid role ID is required');
      }

      return this.prisma.userRole.delete({
        where: {
          userId_roleId: {
            userId,
            roleId,
          },
        },
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('User role assignment not found');
      }
      throw new InternalServerErrorException('Error removing role from user');
    }
  }

  /**
   * Get all roles
   */
  async getAllRoles() {
    try {
      return this.prisma.role.findMany({
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Error fetching all roles');
    }
  }

  /**
   * Get all permissions
   */
  async getAllPermissions() {
    try {
      return this.prisma.permission.findMany();
    } catch (error) {
      throw new InternalServerErrorException('Error fetching all permissions');
    }
  }

  /**
   * Get role by name
   */
  async getRoleByName(name: string) {
    try {
      if (!name || typeof name !== 'string') {
        throw new BadRequestException('Valid role name is required');
      }

      return this.prisma.role.findUnique({
        where: { name },
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error fetching role by name');
    }
  }

  /**
   * Get permission by name
   */
  async getPermissionByName(name: string) {
    try {
      if (!name || typeof name !== 'string') {
        throw new BadRequestException('Valid permission name is required');
      }

      return this.prisma.permission.findUnique({
        where: { name },
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error fetching permission by name');
    }
  }
}
