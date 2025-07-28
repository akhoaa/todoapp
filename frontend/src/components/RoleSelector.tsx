import React, { useState, useEffect } from 'react';
import { Modal, Select, Space, Tag, Button, Divider, Typography, Alert } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import type { IUser } from '@/types/backend';
import { useAppDispatch } from '@/redux/hooks';
import { assignUserRole, removeUserRole, fetchUsers } from '@/redux/slice/userSlice';

const { Title, Text } = Typography;
const { Option } = Select;

interface RoleSelectorProps {
  visible: boolean;
  user: IUser | null;
  onClose: () => void;
}

// Available roles in the system
const AVAILABLE_ROLES = [
  { id: 1, name: 'admin', description: 'Full system access' },
  { id: 2, name: 'manager', description: 'Project and team management' },
  { id: 3, name: 'user', description: 'Basic user access' },
];

const RoleSelector: React.FC<RoleSelectorProps> = ({
  visible,
  user,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const [selectedRoleId, setSelectedRoleId] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setSelectedRoleId(undefined);
    }
  }, [visible]);

  const handleAssignRole = async () => {
    if (!user || !selectedRoleId) return;

    setLoading(true);
    try {
      await dispatch(assignUserRole({
        userId: user.id,
        roleData: { roleId: selectedRoleId }
      })).unwrap();

      // Refresh users list to get updated role information
      dispatch(fetchUsers());
      setSelectedRoleId(undefined);
    } catch (error) {
      // Error is handled in the slice
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRole = async (roleId: number) => {
    if (!user) return;

    setLoading(true);
    try {
      await dispatch(removeUserRole({
        userId: user.id,
        roleId
      })).unwrap();

      // Refresh users list to get updated role information
      dispatch(fetchUsers());
    } catch (error) {
      // Error is handled in the slice
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

  const currentRoles = user?.rbacRoles || [];
  const currentRoleIds = currentRoles.map(role => role.id);
  const availableRoles = AVAILABLE_ROLES.filter(role => !currentRoleIds.includes(role.id));

  return (
    <Modal
      title={
        <Space>
          <Title level={4} style={{ margin: 0 }}>
            Manage Roles
          </Title>
          {user && (
            <Text type="secondary">
              for {user.name || user.email}
            </Text>
          )}
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      {user && (
        <div>
          {/* Current Roles Section */}
          <div style={{ marginBottom: 24 }}>
            <Title level={5}>Current Roles</Title>
            {currentRoles.length > 0 ? (
              <Space wrap>
                {currentRoles.map(role => (
                  <Tag
                    key={role.id}
                    color={getRoleColor(role.name)}
                    closable
                    onClose={() => handleRemoveRole(role.id)}
                    style={{ marginBottom: 8 }}
                  >
                    <Space>
                      {role.name}
                      <Button
                        type="text"
                        size="small"
                        icon={<MinusOutlined />}
                        onClick={() => handleRemoveRole(role.id)}
                        loading={loading}
                        style={{ padding: 0, minWidth: 'auto' }}
                      />
                    </Space>
                  </Tag>
                ))}
              </Space>
            ) : (
              <Alert
                message="No roles assigned"
                description="This user has no roles assigned. Assign a role to grant permissions."
                type="info"
                showIcon
              />
            )}
          </div>

          <Divider />

          {/* Assign New Role Section */}
          <div>
            <Title level={5}>Assign New Role</Title>
            {availableRoles.length > 0 ? (
              <Space.Compact style={{ width: '100%' }}>
                <Select
                  placeholder="Select a role to assign"
                  value={selectedRoleId}
                  onChange={setSelectedRoleId}
                  style={{ flex: 1 }}
                  disabled={loading}
                >
                  {availableRoles.map(role => (
                    <Option key={role.id} value={role.id}>
                      <Space>
                        <Tag color={getRoleColor(role.name)} style={{ margin: 0 }}>
                          {role.name}
                        </Tag>
                        <Text type="secondary">{role.description}</Text>
                      </Space>
                    </Option>
                  ))}
                </Select>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAssignRole}
                  disabled={!selectedRoleId}
                  loading={loading}
                >
                  Assign
                </Button>
              </Space.Compact>
            ) : (
              <Alert
                message="All roles assigned"
                description="This user has been assigned all available roles."
                type="success"
                showIcon
              />
            )}
          </div>

          {/* Role Descriptions */}
          <div style={{ marginTop: 24 }}>
            <Title level={5}>Role Descriptions</Title>
            <div style={{ background: '#fafafa', padding: 16, borderRadius: 6 }}>
              {AVAILABLE_ROLES.map(role => (
                <div key={role.id} style={{ marginBottom: 8 }}>
                  <Space>
                    <Tag color={getRoleColor(role.name)}>{role.name}</Tag>
                    <Text type="secondary">{role.description}</Text>
                  </Space>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default RoleSelector;
