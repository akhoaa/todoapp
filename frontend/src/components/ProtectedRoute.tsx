import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/redux/hooks';
import { usePermissions } from '@/hooks/usePermissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  permissions?: string[];
  roles?: string[];
  requireAll?: boolean;
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  permissions = [],
  roles = [],
  requireAll = false,
  fallbackPath = '/login'
}) => {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);
  const isLoading = useAppSelector(state => state.account.isLoading);
  const { hasAnyPermission, hasAllPermissions, hasAnyRole, hasAllRoles } = usePermissions();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate(fallbackPath);
      return;
    }

    // Check permissions and roles if user is authenticated
    if (isAuthenticated && !isLoading) {
      let hasAccess = true;

      // Check permissions
      if (permissions.length > 0) {
        hasAccess = requireAll
          ? hasAllPermissions(permissions)
          : hasAnyPermission(permissions);
      }

      // Check roles if permissions check passed
      if (hasAccess && roles.length > 0) {
        hasAccess = requireAll
          ? hasAllRoles(roles)
          : hasAnyRole(roles);
      }

      if (!hasAccess) {
        navigate('/unauthorized');
      }
    }
  }, [isAuthenticated, isLoading, navigate, permissions, roles, requireAll, fallbackPath, hasAnyPermission, hasAllPermissions, hasAnyRole, hasAllRoles]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Final permission check before rendering
  if (permissions.length > 0 || roles.length > 0) {
    let hasAccess = true;

    if (permissions.length > 0) {
      hasAccess = requireAll
        ? hasAllPermissions(permissions)
        : hasAnyPermission(permissions);
    }

    if (hasAccess && roles.length > 0) {
      hasAccess = requireAll
        ? hasAllRoles(roles)
        : hasAnyRole(roles);
    }

    if (!hasAccess) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column'
        }}>
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
