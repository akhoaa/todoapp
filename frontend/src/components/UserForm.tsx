import React, { useEffect } from 'react';
import { Form, Input, Button, Space, Card, Typography, Alert } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import type { IUser, IRegisterRequest, IUpdateProfileRequest } from '@/types/backend';

const { Title } = Typography;

interface UserFormProps {
  user?: IUser | null;
  loading: boolean;
  onSubmit: (data: IRegisterRequest | IUpdateProfileRequest) => void;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({
  user,
  loading,
  onSubmit,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const isEditing = !!user;

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
      });
    } else {
      form.resetFields();
    }
  }, [user, form]);

  const handleSubmit = (values: any) => {
    if (isEditing) {
      // For editing, only send name (email changes require special handling)
      const updateData: IUpdateProfileRequest = {
        name: values.name,
      };
      onSubmit(updateData);
    } else {
      // For creating, send all required fields
      const createData: IRegisterRequest = {
        email: values.email,
        password: values.password,
        name: values.name,
      };
      onSubmit(createData);
    }
  };

  const validatePassword = (_: any, value: string) => {
    if (!value && !isEditing) {
      return Promise.reject(new Error('Password is required'));
    }
    if (value && value.length < 6) {
      return Promise.reject(new Error('Password must be at least 6 characters'));
    }
    return Promise.resolve();
  };

  const validateConfirmPassword = (_: any, value: string) => {
    const password = form.getFieldValue('password');
    if (!value && !isEditing) {
      return Promise.reject(new Error('Please confirm your password'));
    }
    if (value && value !== password) {
      return Promise.reject(new Error('Passwords do not match'));
    }
    return Promise.resolve();
  };

  return (
    <Card>
      <Title level={3}>
        {isEditing ? 'Edit User' : 'Create New User'}
      </Title>

      {isEditing && (
        <Alert
          message="Note"
          description="Email changes require special verification and are not supported through this form. Contact system administrator for email changes."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
        size="large"
      >
        <Form.Item
          label="Full Name"
          name="name"
          rules={[
            { required: true, message: 'Please enter the full name' },
            { min: 2, message: 'Name must be at least 2 characters' },
            { max: 50, message: 'Name cannot exceed 50 characters' },
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Enter full name"
            disabled={loading}
          />
        </Form.Item>

        <Form.Item
          label="Email Address"
          name="email"
          rules={[
            { required: !isEditing, message: 'Please enter the email address' },
            { type: 'email', message: 'Please enter a valid email address' },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="Enter email address"
            disabled={loading || isEditing}
            type="email"
          />
        </Form.Item>

        {!isEditing && (
          <>
            <Form.Item
              label="Password"
              name="password"
              rules={[
                { validator: validatePassword },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter password (min 6 characters)"
                disabled={loading}
              />
            </Form.Item>

            <Form.Item
              label="Confirm Password"
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { validator: validateConfirmPassword },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm password"
                disabled={loading}
              />
            </Form.Item>
          </>
        )}

        <Form.Item style={{ marginBottom: 0, marginTop: 32 }}>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
            >
              {isEditing ? 'Update User' : 'Create User'}
            </Button>
            <Button
              onClick={onCancel}
              disabled={loading}
              size="large"
            >
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default UserForm;
