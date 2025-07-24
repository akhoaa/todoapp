import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Row,
  Col,
  Avatar,

  message,
  Tabs
} from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { setUserLoginInfo } from '@/redux/slice/accountSlice';
import { callUpdateProfile, callChangePassword } from '@/config/api';
import type { IUpdateProfileRequest, IChangePasswordRequest } from '@/types/backend';

const { Title, Text } = Typography;

const Profile: React.FC = () => {
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.account.user);

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleUpdateProfile = async (values: IUpdateProfileRequest) => {
    setIsUpdatingProfile(true);
    try {
      const res = await callUpdateProfile(values);
      if (res && res.data) {
        dispatch(setUserLoginInfo(res.data));
        message.success('Profile updated successfully');
      }
    } catch (error: any) {
      message.error(error?.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (values: IChangePasswordRequest & { confirmPassword: string }) => {
    setIsChangingPassword(true);
    try {
      const { confirmPassword, ...passwordData } = values;
      await callChangePassword(passwordData);
      message.success('Password changed successfully');
      passwordForm.resetFields();
    } catch (error: any) {
      message.error(error?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const profileTab = (
    <Card>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Avatar size={80} icon={<UserOutlined />} style={{ marginBottom: '16px' }} />
        <Title level={4}>{user?.name || 'User'}</Title>
        <Text type="secondary">{user?.email}</Text>
      </div>

      <Form
        form={profileForm}
        layout="vertical"
        onFinish={handleUpdateProfile}
        initialValues={{
          name: user?.name,
          email: user?.email,
        }}
      >
        <Form.Item
          label="Full Name"
          name="name"
          rules={[{ required: true, message: 'Please enter your name' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Enter your full name" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
        >
          <Input
            prefix={<MailOutlined />}
            disabled
            placeholder="Email cannot be changed"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isUpdatingProfile}
            block
          >
            Update Profile
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );

  const passwordTab = (
    <Card>
      <Form
        form={passwordForm}
        layout="vertical"
        onFinish={handleChangePassword}
      >
        <Form.Item
          label="Current Password"
          name="currentPassword"
          rules={[{ required: true, message: 'Please enter your current password' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Enter current password"
          />
        </Form.Item>

        <Form.Item
          label="New Password"
          name="newPassword"
          rules={[
            { required: true, message: 'Please enter new password' },
            { min: 6, message: 'Password must be at least 6 characters' }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Enter new password"
          />
        </Form.Item>

        <Form.Item
          label="Confirm New Password"
          name="confirmPassword"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Please confirm your new password' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Passwords do not match'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Confirm new password"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isChangingPassword}
            block
          >
            Change Password
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );

  const tabItems = [
    {
      key: 'profile',
      label: 'Profile Information',
      children: profileTab,
    },
    {
      key: 'password',
      label: 'Change Password',
      children: passwordTab,
    },
  ];

  return (
    <div>
      <Title level={2} style={{ marginBottom: '24px' }}>Profile Settings</Title>

      <Row justify="center">
        <Col xs={24} sm={20} md={16} lg={12}>
          <Tabs items={tabItems} />
        </Col>
      </Row>
    </div>
  );
};

export default Profile;
