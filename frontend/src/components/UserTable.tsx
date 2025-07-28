import React from 'react';
import { Table, Tag, Space, Button, Avatar, Tooltip, Popconfirm } from 'antd';
import { UserOutlined, EditOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import type { IUser } from '@/types/backend';
import { usePermissions } from '@/hooks/usePermissions';

interface UserTableProps {
  users: IUser[];
  loading: boolean;
  onEdit: (user: IUser) => void;
  onDelete: (userId: number) => void;
  onManageRoles: (user: IUser) => void;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  loading,
  onEdit,
  onDelete,
  onManageRoles,
  pagination,
}) => {
  const { hasPermission } = usePermissions();

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

  const columns = [
    {
      title: 'User',
      dataIndex: 'name',
      key: 'user',
      render: (name: string, record: IUser) => (
        <Space>
          <Avatar
            size="small"
            src={record.avatar}
            icon={<UserOutlined />}
          />
          <div>
            <div style={{ fontWeight: 500 }}>
              {name || 'No Name'}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.email}
            </div>
          </div>
        </Space>
      ),
      sorter: (a: IUser, b: IUser) => (a.name || '').localeCompare(b.name || ''),
    },
    {
      title: 'Roles',
      dataIndex: 'rbacRoles',
      key: 'roles',
      render: (rbacRoles: IUser['rbacRoles'], record: IUser) => {
        const roles = rbacRoles || [];
        const legacyRole = record.roles;

        return (
          <Space wrap>
            {roles.length > 0 ? (
              roles.map(role => (
                <Tag key={role.id} color={getRoleColor(role.name)}>
                  {role.name}
                </Tag>
              ))
            ) : legacyRole ? (
              <Tag color={getRoleColor(legacyRole)}>
                {legacyRole}
              </Tag>
            ) : (
              <Tag color="default">No Role</Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Permissions',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: string[]) => (
        <Tooltip
          title={permissions?.length ? permissions.join(', ') : 'No permissions'}
        >
          <Tag color="blue">
            {permissions?.length || 0} permissions
          </Tag>
        </Tooltip>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : 'N/A',
      sorter: (a: IUser, b: IUser) =>
        new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: IUser) => (
        <Space>
          {hasPermission('user:update') && (
            <Tooltip title="Edit User">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => onEdit(record)}
              />
            </Tooltip>
          )}

          {hasPermission('role:assign') && (
            <Tooltip title="Manage Roles">
              <Button
                type="text"
                size="small"
                icon={<SettingOutlined />}
                onClick={() => onManageRoles(record)}
              />
            </Tooltip>
          )}

          {hasPermission('user:delete') && (
            <Popconfirm
              title="Delete User"
              description="Are you sure you want to delete this user? This action cannot be undone."
              onConfirm={() => onDelete(record.id)}
              okText="Yes"
              cancelText="No"
              okType="danger"
            >
              <Tooltip title="Delete User">
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={users}
      loading={loading}
      rowKey="id"
      pagination={pagination ? {
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        onChange: pagination.onChange,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} users`,
      } : false}
      scroll={{ x: 800 }}
      size="middle"
    />
  );
};

export default UserTable;
