import React, { useEffect, useState } from 'react';
import {
  Card,
  Button,
  Space,
  Input,
  Select,
  Typography,
  Row,
  Col,
  message
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  fetchUsers,
  setFilters,
  setPagination,
} from '@/redux/slice/userSlice';
import { callDeleteUser } from '@/config/api';
import { usePermissions } from '@/hooks/usePermissions';
import UserTable from '@/components/UserTable';
import RoleSelector from '@/components/RoleSelector';
import type { IUser } from '@/types/backend';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const Users: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { hasPermission } = usePermissions();

  const { users, loading, filters, pagination } = useAppSelector(state => state.users);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [selectedUserForRoles, setSelectedUserForRoles] = useState<IUser | null>(null);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleSearch = (value: string) => {
    dispatch(setFilters({ search: value }));
  };

  const handleRoleFilter = (role: string) => {
    dispatch(setFilters({ role }));
  };

  const handleRefresh = () => {
    dispatch(fetchUsers());
  };

  const handleCreateUser = () => {
    navigate('/users/new');
  };

  const handleEditUser = (user: IUser) => {
    navigate(`/users/${user.id}/edit`);
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      await callDeleteUser(userId);
      message.success('User deleted successfully');
      dispatch(fetchUsers());
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to delete user';
      message.error(errorMessage);
    }
  };

  const handleManageRoles = (user: IUser) => {
    setSelectedUserForRoles(user);
    setRoleModalVisible(true);
  };

  const handlePaginationChange = (page: number, pageSize: number) => {
    dispatch(setPagination({ current: page, pageSize }));
  };

  // Filter users based on current filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = !filters.search ||
      user.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.email.toLowerCase().includes(filters.search.toLowerCase());

    const matchesRole = !filters.role ||
      user.rbacRoles?.some(role => role.name === filters.role) ||
      user.roles === filters.role;

    return matchesSearch && matchesRole;
  });

  // Get paginated users
  const startIndex = (pagination.current - 1) * pagination.pageSize;
  const endIndex = startIndex + pagination.pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  return (
    <div>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            User Management
          </Title>
        </Col>
        <Col>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}
            >
              Refresh
            </Button>
            {hasPermission('user:create') && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateUser}
              >
                Create User
              </Button>
            )}
          </Space>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Search by name or email"
              allowClear
              onSearch={handleSearch}
              onChange={(e) => !e.target.value && handleSearch('')}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by role"
              allowClear
              onChange={handleRoleFilter}
              style={{ width: '100%' }}
              prefix={<FilterOutlined />}
            >
              <Option value="admin">Admin</Option>
              <Option value="manager">Manager</Option>
              <Option value="user">User</Option>
            </Select>
          </Col>
          <Col xs={24} md={10}>
            <Space>
              <span style={{ color: '#666' }}>
                Total: {filteredUsers.length} users
              </span>
              {(filters.search || filters.role) && (
                <Button
                  size="small"
                  onClick={() => dispatch(setFilters({ search: '', role: '' }))}
                >
                  Clear Filters
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Users Table */}
      <Card>
        <UserTable
          users={paginatedUsers}
          loading={loading}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          onManageRoles={handleManageRoles}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: filteredUsers.length,
            onChange: handlePaginationChange,
          }}
        />
      </Card>

      {/* Role Management Modal */}
      <RoleSelector
        visible={roleModalVisible}
        user={selectedUserForRoles}
        onClose={() => {
          setRoleModalVisible(false);
          setSelectedUserForRoles(null);
        }}
      />
    </div>
  );
};

export default Users;
