import { useAppSelector } from '@/redux/hooks';

/**
 * Custom hook for checking user permissions and roles
 */
export const usePermissions = () => {
  const user = useAppSelector(state => state.account.user);
  const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);

  /**
   * Check if user has specific permission
   */
  const hasPermission = (permission: string): boolean => {
    if (!isAuthenticated || !user) return false;
    const userPermissions = user.permissions || [];
    return userPermissions.includes(permission);
  };

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!isAuthenticated || !user) return false;
    const userPermissions = user.permissions || [];
    return permissions.some(permission => userPermissions.includes(permission));
  };

  /**
   * Check if user has all of the specified permissions
   */
  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!isAuthenticated || !user) return false;
    const userPermissions = user.permissions || [];
    return permissions.every(permission => userPermissions.includes(permission));
  };

  /**
   * Check if user has specific role (legacy or RBAC)
   */
  const hasRole = (role: string): boolean => {
    if (!isAuthenticated || !user) return false;
    const userRoles = [
      user.roles, // Legacy role
      ...(user.rbacRoles?.map(r => r.name) || []) // RBAC roles
    ].filter(Boolean);
    return userRoles.includes(role);
  };

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = (roles: string[]): boolean => {
    if (!isAuthenticated || !user) return false;
    const userRoles = [
      user.roles, // Legacy role
      ...(user.rbacRoles?.map(r => r.name) || []) // RBAC roles
    ].filter(Boolean);
    return roles.some(role => userRoles.includes(role));
  };

  /**
   * Check if user has all of the specified roles
   */
  const hasAllRoles = (roles: string[]): boolean => {
    if (!isAuthenticated || !user) return false;
    const userRoles = [
      user.roles, // Legacy role
      ...(user.rbacRoles?.map(r => r.name) || []) // RBAC roles
    ].filter(Boolean);
    return roles.every(role => userRoles.includes(role));
  };

  /**
   * Check if user is admin (legacy or RBAC)
   */
  const isAdmin = (): boolean => {
    return hasRole('admin');
  };

  /**
   * Check if user is manager (legacy or RBAC)
   */
  const isManager = (): boolean => {
    return hasRole('manager');
  };

  /**
   * Get all user permissions
   */
  const getUserPermissions = (): string[] => {
    if (!isAuthenticated || !user) return [];
    return user.permissions || [];
  };

  /**
   * Get all user roles
   */
  const getUserRoles = (): string[] => {
    if (!isAuthenticated || !user) return [];
    return [
      user.roles, // Legacy role
      ...(user.rbacRoles?.map(r => r.name) || []) // RBAC roles
    ].filter(Boolean);
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isAdmin,
    isManager,
    getUserPermissions,
    getUserRoles,
    user,
    isAuthenticated,
  };
};
