import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  Typography,
  Breadcrumb,
  Space,
  Tag,
  Button,
  Avatar,
  Descriptions,
  Row,
  Col,
  message,
} from 'antd';
import {
  HomeOutlined,
  UserOutlined,
  EditOutlined,
  SettingOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { callGetUserById } from '@/config/api';
import { usePermissions } from '@/hooks/usePermissions';
import type { IUser } from '@/types/backend';
import RoleSelector from '@/components/RoleSelector';

const { Title, Text } = Typography;

const UserDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { hasPermission } = usePermissions();

  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleModalVisible, setRoleModalVisible] = useState(false);

  useEffect(() => {
    if (id) {
      fetchUserData(parseInt(id));
    }
  }, [id]);

  const fetchUserData = async (userId: number) => {
    setLoading(true);
    try {
      const response = await callGetUserById(userId);
      setUser(response.data.data || null);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to fetch user data';
      message.error(errorMessage);
      navigate('/users');
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'admin':
        return 'red';
      case 'manager':
        return 'orange';
      case 'user':
        return 'blue';
      default:
        return 'default';
    }
  };

  const handleEdit = () => {
    navigate(`/users/${id}/edit`);
  };

  const handleManageRoles = () => {
    setRoleModalVisible(true);
  };

  const handleBack = () => {
    navigate('/users');
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px',
        fontSize: '16px'
      }}>
        Loading user details...
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px',
        fontSize: '16px'
      }}>
        User not found
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: 24 }}>
        <Breadcrumb.Item>
          <HomeOutlined />
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <UserOutlined />
          <span onClick={() => navigate('/users')} style={{ cursor: 'pointer' }}>
            Users
          </span>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          {user.name || user.email}
        </Breadcrumb.Item>
      </Breadcrumb>

      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
            >
              Back to Users
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              User Details
            </Title>
          </Space>
        </Col>
        <Col>
          <Space>
            {hasPermission('user:update') && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleEdit}
              >
                Edit User
              </Button>
            )}
            {(hasPermission('role:assign') || hasPermission('user:manage_roles')) && (
              <Button
                icon={<SettingOutlined />}
                onClick={handleManageRoles}
              >
                Manage Roles
              </Button>
            )}
          </Space>
        </Col>
      </Row>

      {/* User Information Card */}
      <Card>
        <Row gutter={24}>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar
                size={120}
                src={user.avatar}
                icon={<UserOutlined />}
                style={{ marginBottom: 16 }}
              />
              <div>
                <Title level={3} style={{ margin: 0 }}>
                  {user.name || 'No Name'}
                </Title>
                <Text type="secondary" style={{ fontSize: '16px' }}>
                  {user.email}
                </Text>
              </div>
            </div>
          </Col>

          <Col xs={24} md={16}>
            <Descriptions column={1} size="middle">
              <Descriptions.Item label="User ID">
                {user.id}
              </Descriptions.Item>

              <Descriptions.Item label="Email">
                {user.email}
              </Descriptions.Item>

              <Descriptions.Item label="Full Name">
                {user.name || 'Not provided'}
              </Descriptions.Item>

              <Descriptions.Item label="Roles">
                <Space wrap>
                  {user.rbacRoles && user.rbacRoles.length > 0 ? (
                    user.rbacRoles.map(role => (
                      <Tag key={role.id} color={getRoleColor(role.name)}>
                        {role.name}
                      </Tag>
                    ))
                  ) : user.roles ? (
                    <Tag color={getRoleColor(user.roles)}>
                      {user.roles}
                    </Tag>
                  ) : (
                    <Text type="secondary">No roles assigned</Text>
                  )}
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Permissions">
                <div>
                  {user.permissions && user.permissions.length > 0 ? (
                    <Space wrap>
                      {user.permissions.map(permission => (
                        <Tag key={permission} color="blue" style={{ marginBottom: 4 }}>
                          {permission}
                        </Tag>
                      ))}
                    </Space>
                  ) : (
                    <Text type="secondary">No permissions assigned</Text>
                  )}
                </div>
              </Descriptions.Item>

              <Descriptions.Item label="Created">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
              </Descriptions.Item>

              <Descriptions.Item label="Last Updated">
                {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Unknown'}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>

      {/* Role Management Modal */}
      <RoleSelector
        visible={roleModalVisible}
        user={user}
        onClose={() => {
          setRoleModalVisible(false);
          // Refresh user data after role changes
          if (id) {
            fetchUserData(parseInt(id));
          }
        }}
      />
    </div>
  );
};

export default UserDetail;
