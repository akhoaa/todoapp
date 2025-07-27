import { Injectable, NotFoundException, ForbiddenException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto, AddMemberDto } from './dto';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) { }

  async create(createProjectDto: CreateProjectDto, ownerId: number) {
    try {
      // Verify owner exists
      const owner = await this.prisma.user.findUnique({
        where: { id: ownerId },
        select: { id: true }
      });

      if (!owner) {
        throw new BadRequestException('Owner user does not exist');
      }

      // Create project with validated data
      const project = await this.prisma.project.create({
        data: {
          name: createProjectDto.name,
          description: createProjectDto.description,
          status: createProjectDto.status || 'ACTIVE',
          ownerId,
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
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
              userId: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

      return project;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error.code === 'P2003') {
        throw new BadRequestException('Invalid owner reference');
      }
      throw new InternalServerErrorException('Error creating project');
    }
  }

  async findAll(userId: number, userRoles: string[]) {
    try {
      // Admin can see all projects
      if (userRoles.includes('admin')) {
        return this.prisma.project.findMany({
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
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
                userId: true,
                createdAt: true,
                updatedAt: true,
              },
            },
            _count: {
              select: {
                tasks: true,
                members: true,
              },
            },
          },
          orderBy: {
            updatedAt: 'desc',
          },
        });
      }

      // Regular users can only see projects they own or are members of
      return this.prisma.project.findMany({
        where: {
          OR: [
            { ownerId: userId },
            {
              members: {
                some: {
                  userId: userId,
                },
              },
            },
          ],
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
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
              userId: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          _count: {
            select: {
              tasks: true,
              members: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Error fetching projects');
    }
  }

  async findOne(id: number, userId: number, userRoles: string[]) {
    try {
      const project = await this.prisma.project.findUnique({
        where: { id },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          tasks: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      if (!project) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }

      // Check if user has access to this project
      const hasAccess = userRoles.includes('admin') ||
        project.ownerId === userId ||
        project.members.some(member => member.userId === userId);

      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this project');
      }

      return project;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Error fetching project');
    }
  }

  async update(id: number, updateProjectDto: UpdateProjectDto, userId: number, userRoles: string[]) {
    try {
      const project = await this.prisma.project.findUnique({
        where: { id },
        include: {
          members: true,
        },
      });

      if (!project) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }

      // Check if user can update this project (owner, manager, or admin)
      const isOwner = project.ownerId === userId;
      const isManager = project.members.some(member => member.userId === userId && member.role === 'MANAGER');
      const isAdmin = userRoles.includes('admin');

      if (!isOwner && !isManager && !isAdmin) {
        throw new ForbiddenException('You do not have permission to update this project');
      }

      const updatedProject = await this.prisma.project.update({
        where: { id },
        data: updateProjectDto,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
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
              userId: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

      return updatedProject;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Error updating project');
    }
  }

  async remove(id: number, userId: number, userRoles: string[]) {
    try {
      const project = await this.prisma.project.findUnique({
        where: { id },
      });

      if (!project) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }

      // Only owner or admin can delete project
      if (project.ownerId !== userId && !userRoles.includes('admin')) {
        throw new ForbiddenException('You do not have permission to delete this project');
      }

      await this.prisma.project.delete({
        where: { id },
      });

      return { message: `Project with ID ${id} has been deleted successfully` };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Error deleting project');
    }
  }

  // Member Management Methods
  async addMember(projectId: number, addMemberDto: AddMemberDto, userId: number, userRoles: string[]) {
    try {
      // Fetch project with members for validation
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
        include: {
          members: {
            select: {
              userId: true,
              role: true,
            },
          },
        },
      });

      if (!project) {
        throw new NotFoundException(`Project with ID ${projectId} not found`);
      }

      // Verify user has permission to manage members (owner, manager, or admin)
      const isOwner = project.ownerId === userId;
      const isManager = project.members.some(member => member.userId === userId && member.role === 'MANAGER');
      const isAdmin = userRoles.includes('admin');

      if (!isOwner && !isManager && !isAdmin) {
        throw new ForbiddenException('You do not have permission to manage project members');
      }

      // Verify target user exists
      const targetUser = await this.prisma.user.findUnique({
        where: { id: addMemberDto.userId },
        select: { id: true, email: true, name: true },
      });

      if (!targetUser) {
        throw new NotFoundException(`User with ID ${addMemberDto.userId} not found`);
      }

      // Check if user is already a member
      const existingMember = project.members.find(member => member.userId === addMemberDto.userId);
      if (existingMember) {
        throw new BadRequestException('User is already a member of this project');
      }

      // Create project member with validated data
      const member = await this.prisma.projectMember.create({
        data: {
          projectId,
          userId: addMemberDto.userId,
          role: addMemberDto.role || 'MEMBER',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return { message: 'Member added successfully', member };
    } catch (error) {
      if (error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException) {
        throw error;
      }
      if (error.code === 'P2002') {
        throw new BadRequestException('User is already a member of this project');
      }
      if (error.code === 'P2003') {
        throw new BadRequestException('Invalid project or user reference');
      }
      throw new InternalServerErrorException('Error adding member to project');
    }
  }

  async removeMember(projectId: number, memberId: number, userId: number, userRoles: string[]) {
    try {
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
        include: {
          members: true,
        },
      });

      if (!project) {
        throw new NotFoundException(`Project with ID ${projectId} not found`);
      }

      // Check if user can manage members (owner, manager, or admin)
      const isOwner = project.ownerId === userId;
      const isManager = project.members.some(member => member.userId === userId && member.role === 'MANAGER');
      const isAdmin = userRoles.includes('admin');

      if (!isOwner && !isManager && !isAdmin) {
        throw new ForbiddenException('You do not have permission to manage project members');
      }

      // Find the member to remove
      const member = await this.prisma.projectMember.findUnique({
        where: { id: memberId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!member || member.projectId !== projectId) {
        throw new NotFoundException('Member not found in this project');
      }

      await this.prisma.projectMember.delete({
        where: { id: memberId },
      });

      return { message: `Member ${member.user.name} removed from project successfully` };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Error removing member from project');
    }
  }

  async getMembers(projectId: number, userId: number, userRoles: string[]) {
    try {
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
        include: {
          members: true,
        },
      });

      if (!project) {
        throw new NotFoundException(`Project with ID ${projectId} not found`);
      }

      // Check if user has access to this project
      const hasAccess = userRoles.includes('admin') ||
        project.ownerId === userId ||
        project.members.some(member => member.userId === userId);

      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this project');
      }

      const members = await this.prisma.projectMember.findMany({
        where: { projectId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      return members;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Error fetching project members');
    }
  }
}
