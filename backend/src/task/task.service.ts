import { Injectable, NotFoundException, BadRequestException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from './dto';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) { }

  async create(userId: number, dto: CreateTaskDto) {
    try {
      // Check if user exists
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new BadRequestException('User does not exist');
      }

      return await this.prisma.task.create({
        data: {
          ...dto,
          userId,
        },
      });
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Error creating task');
    }
  }

  async findAll(user: any, status?: string) {
    try {
      if (!user || !user.userId) {
        throw new BadRequestException('User information is required');
      }

      const where: any = {};

      // Admin users can see all tasks, regular users only see their own
      if (user.roles !== 'admin') {
        where.userId = user.userId;
      }

      if (status) {
        where.status = status;
      }

      return await this.prisma.task.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Error fetching tasks');
    }
  }

  async findOne(id: number) {
    try {
      const task = await this.prisma.task.findUnique({
        where: { id },
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
      return await this.prisma.task.update({ where: { id }, data: dto });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Task with ID ${id} not found`);
      }
      throw error;
    }
  }

  async updateWithOwnershipCheck(id: number, dto: UpdateTaskDto, user: any) {
    try {
      const task = await this.prisma.task.findUnique({ where: { id } });
      if (!task) throw new NotFoundException('Task not found');
      if (user.roles !== 'admin' && task.userId !== user.userId) {
        throw new ForbiddenException('You can only update your own tasks');
      }
      return await this.prisma.task.update({ where: { id }, data: dto });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) throw error;
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
