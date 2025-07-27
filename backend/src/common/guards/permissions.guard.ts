import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RbacService } from '../../rbac/rbac.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rbacService: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check for required permissions
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Check for any permissions requirement
    const anyPermissions = this.reflector.getAllAndOverride<string[]>('permissions_any', [
      context.getHandler(),
      context.getClass(),
    ]);

    // Check for all permissions requirement
    const allPermissions = this.reflector.getAllAndOverride<string[]>('permissions_all', [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no permissions are required, allow access
    if (!requiredPermissions && !anyPermissions && !allPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      throw new ForbiddenException('User not authenticated');
    }

    try {
      // Check required permissions (legacy support)
      if (requiredPermissions && requiredPermissions.length > 0) {
        const hasPermission = await this.rbacService.hasAnyPermission(user.id, requiredPermissions);
        if (!hasPermission) {
          throw new ForbiddenException('Insufficient permissions');
        }
      }

      // Check any permissions requirement
      if (anyPermissions && anyPermissions.length > 0) {
        const hasAnyPermission = await this.rbacService.hasAnyPermission(user.id, anyPermissions);
        if (!hasAnyPermission) {
          throw new ForbiddenException('Insufficient permissions');
        }
      }

      // Check all permissions requirement
      if (allPermissions && allPermissions.length > 0) {
        const hasAllPermissions = await this.rbacService.hasAllPermissions(user.id, allPermissions);
        if (!hasAllPermissions) {
          throw new ForbiddenException('Insufficient permissions');
        }
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new ForbiddenException('Permission check failed');
    }
  }
}
