import React, { useState, useEffect } from 'react';
import { Button, Form, Input, Card, Typography, Divider, Row, Col } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setUserLoginInfo } from '@/redux/slice/accountSlice';
import { callLogin } from '@/config/api';
import type { ILoginRequest } from '@/types/backend';
import { useErrorHandler } from '@/hooks/useErrorHandler';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const [form] = Form.useForm();
  const [isSubmit, setIsSubmit] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);
  const {
    handleApiResponse,
    showErrorMessage,
    getErrorDetails
  } = useErrorHandler({
    showDetails: import.meta.env.DEV
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const onFinish = async (values: ILoginRequest) => {
    setIsSubmit(true);

    // Use the enhanced error handler with automatic success/error display
    await handleApiResponse(
      () => callLogin(values.email, values.password),
      {
        successMessage: 'Login successful! Welcome back.',
        errorOptions: {
          showDetails: import.meta.env.DEV
        },
        onSuccess: (res) => {
          if (res && res.data && res.data.access_token) {
            localStorage.setItem('access_token', res.data.access_token);
            localStorage.setItem('refresh_token', res.data.refresh_token);
            dispatch(setUserLoginInfo(res.data.user));
            navigate('/dashboard');
          } else {
            showErrorMessage(new Error('Login response missing required data'));
          }
        },
        onError: (error) => {
          // Additional debug logging for development
          if (import.meta.env.DEV) {
            const errorDetails = getErrorDetails(error);
            console.group('🔍 Login Error Analysis');
            console.log('Error Type:', errorDetails.type);
            console.log('Status Code:', errorDetails.statusCode);
            console.log('Message:', errorDetails.message);
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
                Welcome Back
              </Title>
              <Text type="secondary">Sign in to your account</Text>
            </div>

            <Form
              form={form}
              name="login"
              onFinish={onFinish}
              autoComplete="off"
              layout="vertical"
              size="large"
            >
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Please input your email!' },
                  { type: 'email', message: 'Please enter a valid email!' }
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Enter your email"
                  autoComplete="email"
                  type="email"
                />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: 'Please input your password!' }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Enter your password"
                  autoComplete="current-password"
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
                  Sign In
                </Button>
              </Form.Item>
            </Form>

            <Divider>
              <Text type="secondary">New to Todo App?</Text>
            </Divider>

            <div style={{ textAlign: 'center' }}>
              <Text>
                Don't have an account? <Link to="/register">Sign up now</Link>
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Login;
