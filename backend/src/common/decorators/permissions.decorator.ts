import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator to require specific permissions for a route
 * @param permissions - Array of permission names required
 */
export const RequirePermissions = (...permissions: string[]) => 
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * Decorator to require any of the specified permissions for a route
 * @param permissions - Array of permission names, user needs at least one
 */
export const RequireAnyPermission = (...permissions: string[]) => 
  SetMetadata('permissions_any', permissions);

/**
 * Decorator to require all of the specified permissions for a route
 * @param permissions - Array of permission names, user needs all
 */
export const RequireAllPermissions = (...permissions: string[]) => 
  SetMetadata('permissions_all', permissions);
