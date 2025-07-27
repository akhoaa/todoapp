import React from 'react';
import { useAppSelector } from '@/redux/hooks';

interface PermissionGuardProps {
  children: React.ReactNode;
  permissions?: string[];
  roles?: string[];
  requireAll?: boolean; // If true, user must have ALL permissions/roles. If false, user needs ANY
  fallback?: React.ReactNode;
}

/**
 * Component that conditionally renders children based on user permissions and roles
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permissions = [],
  roles = [],
  requireAll = false,
  fallback = null,
}) => {
  const user = useAppSelector(state => state.account.user);
  const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);

  // If not authenticated, don't render
  if (!isAuthenticated || !user) {
    return <>{fallback}</>;
  }

  // Check permissions
  if (permissions.length > 0) {
    const userPermissions = user.permissions || [];
    const hasPermissions = requireAll
      ? permissions.every(permission => userPermissions.includes(permission))
      : permissions.some(permission => userPermissions.includes(permission));

    if (!hasPermissions) {
      return <>{fallback}</>;
    }
  }

  // Check roles (both legacy and RBAC)
  if (roles.length > 0) {
    const userRoles = [
      user.roles, // Legacy role
      ...(user.rbacRoles?.map(role => role.name) || []) // RBAC roles
    ].filter(Boolean);

    const hasRoles = requireAll
      ? roles.every(role => userRoles.includes(role))
      : roles.some(role => userRoles.includes(role));

    if (!hasRoles) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};

export default PermissionGuard;
