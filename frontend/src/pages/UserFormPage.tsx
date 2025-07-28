import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Typography, Breadcrumb, message } from 'antd';
import { HomeOutlined, UserOutlined } from '@ant-design/icons';
import { useAppDispatch } from '@/redux/hooks';
import { fetchUsers } from '@/redux/slice/userSlice';
import { callCreateUser, callUpdateUser, callGetUserById } from '@/config/api';
import UserForm from '@/components/UserForm';
import type { IUser, IRegisterRequest, IUpdateProfileRequest } from '@/types/backend';

const { Title } = Typography;

const UserFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  const isEditing = !!id;

  useEffect(() => {
    if (isEditing && id) {
      fetchUserData(parseInt(id));
    }
  }, [id, isEditing]);

  const fetchUserData = async (userId: number) => {
    setInitialLoading(true);
    try {
      const response = await callGetUserById(userId);
      setUser(response.data.data || null);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to fetch user data';
      message.error(errorMessage);
      navigate('/users');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (data: IRegisterRequest | IUpdateProfileRequest) => {
    setLoading(true);
    try {
      if (isEditing && id) {
        // Update existing user
        await callUpdateUser(parseInt(id), data as IUpdateProfileRequest);
        message.success('User updated successfully');
      } else {
        // Create new user
        await callCreateUser(data as IRegisterRequest);
        message.success('User created successfully');
      }

      // Refresh users list
      dispatch(fetchUsers());
      navigate('/users');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message ||
        `Failed to ${isEditing ? 'update' : 'create'} user`;
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/users');
  };

  if (initialLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px',
        fontSize: '16px'
      }}>
        Loading user data...
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
          {isEditing ? 'Edit User' : 'Create User'}
        </Breadcrumb.Item>
      </Breadcrumb>

      {/* Page Title */}
      <Title level={2} style={{ marginBottom: 24 }}>
        {isEditing ? 'Edit User' : 'Create New User'}
      </Title>

      {/* User Form */}
      <div style={{ maxWidth: 600 }}>
        <UserForm
          user={user}
          loading={loading}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default UserFormPage;
