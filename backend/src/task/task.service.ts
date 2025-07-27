import { Injectable, NotFoundException, BadRequestException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from './dto';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) { }

  async create(userId: number, dto: CreateTaskDto) {
    try {
      // Verify user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true }
      });
      if (!user) {
        throw new BadRequestException('User does not exist');
      }

      // If projectId is provided, verify project exists and user has access
      if (dto.projectId) {
        const project = await this.prisma.project.findUnique({
          where: { id: dto.projectId },
          include: {
            members: {
              select: { userId: true }
            },
          },
        });

        if (!project) {
          throw new BadRequestException('Project does not exist');
        }

        // Verify user has access to the project (owner or member)
        const hasAccess = project.ownerId === userId ||
          project.members.some(member => member.userId === userId);

        if (!hasAccess) {
          throw new ForbiddenException('You do not have access to this project');
        }
      }

      // Create task with validated data
      const task = await this.prisma.task.create({
        data: {
          title: dto.title,
          description: dto.description,
          status: dto.status || 'PENDING',
          userId,
          projectId: dto.projectId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          project: dto.projectId ? {
            select: {
              id: true,
              name: true,
              status: true,
            },
          } : undefined,
        },
      });

      return task;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }
      if (error.code === 'P2003') {
        throw new BadRequestException('Invalid project or user reference');
      }
      throw new InternalServerErrorException('Error creating task');
    }
  }

  async findAll(user: any, status?: string) {
    try {
      // Validate user information (should be handled by guards, but defensive programming)
      if (!user?.userId) {
        throw new BadRequestException('User information is required');
      }

      // Build query conditions
      const where: any = {};

      // Apply role-based filtering: admin sees all, others see only their own
      if (user.roles !== 'admin') {
        where.userId = user.userId;
      }

      // Apply status filter if provided
      if (status && ['PENDING', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
        where.status = status;
      }

      const tasks = await this.prisma.task.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          project: {
            select: {
              id: true,
              name: true,
              status: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
      });

      return tasks;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error fetching tasks');
    }
  }

  async findOne(id: number) {
    try {
      const task = await this.prisma.task.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
              status: true,
              ownerId: true,
            },
          },
        },
      });
      if (!task) {
        throw new NotFoundException(`Task with ID ${id} not found`);
      }
      return task;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error finding task');
    }
  }

  async update(id: number, dto: UpdateTaskDto) {
    try {
      // If projectId is being updated, verify project exists
      if (dto.projectId !== undefined && dto.projectId !== null) {
        const project = await this.prisma.project.findUnique({
          where: { id: dto.projectId },
          select: { id: true }
        });

        if (!project) {
          throw new BadRequestException('Project does not exist');
        }
      }

      const updatedTask = await this.prisma.task.update({
        where: { id },
        data: {
          title: dto.title,
          description: dto.description,
          status: dto.status,
          projectId: dto.projectId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
        },
      });

      return updatedTask;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error.code === 'P2025') {
        throw new NotFoundException(`Task with ID ${id} not found`);
      }
      if (error.code === 'P2003') {
        throw new BadRequestException('Invalid project reference');
      }
      throw new InternalServerErrorException('Error updating task');
    }
  }

  async updateWithOwnershipCheck(id: number, dto: UpdateTaskDto, user: any) {
    try {
      // Verify task exists and get ownership info
      const task = await this.prisma.task.findUnique({
        where: { id },
        select: { id: true, userId: true }
      });

      if (!task) {
        throw new NotFoundException('Task not found');
      }

      // Check ownership permissions
      if (user.roles !== 'admin' && task.userId !== user.userId) {
        throw new ForbiddenException('You can only update your own tasks');
      }

      // Update task with validated data
      const updatedTask = await this.prisma.task.update({
        where: { id },
        data: {
          title: dto.title,
          description: dto.description,
          status: dto.status,
          projectId: dto.projectId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
        },
      });

      return updatedTask;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      if (error.code === 'P2003') {
        throw new BadRequestException('Invalid project reference');
      }
      throw new InternalServerErrorException('Error updating task');
    }
  }

  async delete(id: number) {
    try {
      return await this.prisma.task.delete({ where: { id } });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Task with ID ${id} not found`);
      }
      throw new InternalServerErrorException('Error deleting task');
    }
  }

  async deleteWithOwnershipCheck(id: number, user: any) {
    try {
      const task = await this.prisma.task.findUnique({ where: { id } });
      if (!task) throw new NotFoundException('Task not found');
      if (user.roles !== 'admin' && task.userId !== user.userId) {
        throw new ForbiddenException('You can only delete your own tasks');
      }
      return await this.prisma.task.delete({ where: { id } });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException('Error deleting task');
    }
  }
}
