import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) { }

  async create(userId: number, dto: CreateTaskDto) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    if (!dto.title) {
      throw new BadRequestException('Title is required');
    }
    // Kiểm tra userId có tồn tại không
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User does not exist');
    }
    return this.prisma.task.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  async findAll(userId: number, status?: string) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    return this.prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
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
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    if (user.roles !== 'admin' && task.userId !== user.userId) {
      throw new ForbiddenException('You can only update your own tasks');
    }
    return this.prisma.task.update({ where: { id }, data: dto });
  }

  async delete(id: number) {
    try {
      return await this.prisma.task.delete({ where: { id } });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Task with ID ${id} not found`);
      }
      throw error;
    }
  }

  async deleteWithOwnershipCheck(id: number, user: any) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    if (user.roles !== 'admin' && task.userId !== user.userId) {
      throw new ForbiddenException('You can only delete your own tasks');
    }
    return this.prisma.task.delete({ where: { id } });
  }
}
