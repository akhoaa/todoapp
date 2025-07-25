import React, { useState, useEffect } from 'react';
import { Button, Form, Input, Card, Typography, Divider, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setUserLoginInfo } from '@/redux/slice/accountSlice';
import { callRegister } from '@/config/api';
import type { IRegisterRequest } from '@/types/backend';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { debugRegistrationPayload, debugErrorResponse, debugApiCall } from '@/utils/debugHelper';

const { Title, Text } = Typography;

const Register: React.FC = () => {
  const [form] = Form.useForm();
  const [isSubmit, setIsSubmit] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);
  const {
    handleApiResponse,
    showErrorNotification,
    showSuccessMessage,
    getErrorDetails
  } = useErrorHandler({
    useNotification: true, // Use notifications for registration to show validation details
    showDetails: import.meta.env.DEV
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const onFinish = async (values: IRegisterRequest & { confirmPassword: string }) => {
    setIsSubmit(true);

    const { confirmPassword, ...registerData } = values;

    // Debug logging for development
    if (import.meta.env.DEV) {
      await debugApiCall('/auth/register', 'POST', registerData);
      debugRegistrationPayload(registerData);
    }

    // Use the enhanced error handler with automatic success/error display
    const result = await handleApiResponse(
      () => callRegister(registerData),
      {
        successTitle: 'Registration Successful!',
        successDescription: 'Welcome! You have been automatically logged in.',
        errorOptions: {
          useNotification: true, // Show detailed validation errors in notifications
          showDetails: import.meta.env.DEV
        },
        onSuccess: (res) => {
          if (res && res.data && res.data.access_token) {
            localStorage.setItem('access_token', res.data.access_token);
            localStorage.setItem('refresh_token', res.data.refresh_token);
            dispatch(setUserLoginInfo(res.data.user));
            navigate('/dashboard');
          } else {
            showErrorNotification(new Error('Registration response missing required data'));
          }
        },
        onError: (error) => {
          // Additional debug logging for development
          if (import.meta.env.DEV) {
            debugErrorResponse(error);
            const errorDetails = getErrorDetails(error);
            console.group('🔍 Registration Error Analysis');
            console.log('Error Type:', errorDetails.type);
            console.log('Status Code:', errorDetails.statusCode);
            console.log('Message:', errorDetails.message);
            console.log('Details:', errorDetails.details);
            console.groupEnd();
          }
        }
      }
    );

    setIsSubmit(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Row justify="center" style={{ width: '100%' }}>
        <Col xs={22} sm={16} md={12} lg={8} xl={6}>
          <Card
            style={{
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              border: 'none'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <Title level={2} style={{ color: '#1890ff', marginBottom: '8px' }}>
                Create Account
              </Title>
              <Text type="secondary">Join Todo App today</Text>
            </div>

            <Form
              form={form}
              name="register"
              onFinish={onFinish}
              autoComplete="off"
              layout="vertical"
              size="large"
            >
              <Form.Item
                label="Name"
                name="name"
                rules={[{ required: true, message: 'Please input your name!' }]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Enter your full name"
                  autoComplete="name"
                />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Please input your email!' },
                  { type: 'email', message: 'Please enter a valid email!' }
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Enter your email"
                  autoComplete="email"
                  type="email"
                />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: 'Please input your password!' },
                  { min: 6, message: 'Password must be at least 6 characters!' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Enter your password"
                  autoComplete="new-password"
                />
              </Form.Item>

              <Form.Item
                label="Confirm Password"
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Please confirm your password!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Passwords do not match!'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: '16px' }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isSubmit}
                  block
                  style={{ height: '48px', fontSize: '16px' }}
                >
                  Create Account
                </Button>
              </Form.Item>
            </Form>

            <Divider>
              <Text type="secondary">Already have an account?</Text>
            </Divider>

            <div style={{ textAlign: 'center' }}>
              <Text>
                <Link to="/login">Sign in here</Link>
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Register;
