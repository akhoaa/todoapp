import React, { useEffect } from 'react';
import { Layout, Menu, Button, Dropdown, Avatar, Space } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined, HomeOutlined, CheckSquareOutlined, ProjectOutlined } from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { setLogoutAction, fetchAccount } from '@/redux/slice/accountSlice';
import { callLogout } from '@/config/api';
import { useMessage } from '@/hooks/useMessage';
import { usePermissions } from '@/hooks/usePermissions';

const { Header, Content, Sider } = Layout;

const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.account.user);
  const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);
  const message = useMessage();
  const { hasPermission } = usePermissions();

  // Ensure user profile is loaded with RBAC data
  useEffect(() => {
    if (isAuthenticated && user && (!user.permissions || user.permissions.length === 0)) {
      console.log('🔧 User missing permissions, fetching profile...');
      dispatch(fetchAccount());
    }
  }, [isAuthenticated, user, dispatch]);

  const handleLogout = async () => {
    try {
      await callLogout();
      dispatch(setLogoutAction());
      message.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      dispatch(setLogoutAction());
      navigate('/login');
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  // Debug permission checking
  const hasProjectReadPermission = hasPermission('project:read');

  console.log('🔍 Layout Debug:', {
    isAuthenticated,
    user: user ? {
      id: user.id,
      email: user.email,
      roles: user.roles,
      rbacRoles: user.rbacRoles,
      permissions: user.permissions,
      permissionsCount: user.permissions?.length || 0
    } : null,
    hasProjectRead: hasProjectReadPermission,
    permissionCheckResult: user?.permissions?.includes('project:read')
  });

  const sidebarItems = [
    {
      key: '/dashboard',
      icon: <HomeOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/dashboard'),
    },
    {
      key: '/tasks',
      icon: <CheckSquareOutlined />,
      label: 'Tasks',
      onClick: () => navigate('/tasks'),
    },
    // Only show Projects if user has permission
    ...(hasProjectReadPermission ? [{
      key: '/projects',
      icon: <ProjectOutlined />,
      label: 'Projects',
      onClick: () => navigate('/projects'),
    }] : []),
  ];

  const selectedKeys = [location.pathname];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} theme="dark">
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          Todo App
        </div>
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={selectedKeys}
          items={sidebarItems}
        />
      </Sider>
      <Layout>
        <Header style={{
          padding: '0 24px',
          background: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
            Welcome back, {user?.name || user?.email}!
          </div>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Button type="text" style={{ height: 'auto', padding: '4px 8px' }}>
              <Space>
                <Avatar size="small" icon={<UserOutlined />} />
                {user?.name || user?.email}
              </Space>
            </Button>
          </Dropdown>
        </Header>
        <Content style={{
          margin: '24px',
          padding: '24px',
          background: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
