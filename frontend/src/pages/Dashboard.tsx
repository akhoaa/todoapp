import React, { useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography, Button } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, SyncOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { fetchTasks } from '@/redux/slice/taskSlice';

const { Title, Paragraph } = Typography;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { tasks } = useAppSelector(state => state.task);
  const user = useAppSelector(state => state.account.user);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const completedTasks = tasks.filter(task => task.status === 'COMPLETED').length;
  const inProgressTasks = tasks.filter(task => task.status === 'IN_PROGRESS').length;
  const pendingTasks = tasks.filter(task => task.status === 'PENDING').length;
  const totalTasks = tasks.length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Dashboard</Title>
        <Paragraph type="secondary">
          Welcome back, {user?.name || user?.email}! Here's an overview of your tasks.
        </Paragraph>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Tasks"
              value={totalTasks}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Completed"
              value={completedTasks}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="In Progress"
              value={inProgressTasks}
              prefix={<SyncOutlined spin />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending"
              value={pendingTasks}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Completion Rate" style={{ height: '200px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '120px'
            }}>
              <Statistic
                value={completionRate}
                suffix="%"
                valueStyle={{
                  fontSize: '48px',
                  color: completionRate >= 70 ? '#52c41a' : completionRate >= 40 ? '#faad14' : '#f5222d'
                }}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Quick Actions" style={{ height: '200px' }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              height: '120px',
              justifyContent: 'center'
            }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={() => navigate('/tasks')}
                block
              >
                Create New Task
              </Button>
              <Button
                size="large"
                onClick={() => navigate('/tasks')}
                block
              >
                View All Tasks
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {totalTasks === 0 && (
        <Card style={{ marginTop: '24px', textAlign: 'center' }}>
          <div style={{ padding: '40px 0' }}>
            <CheckCircleOutlined style={{ fontSize: '64px', color: '#d9d9d9', marginBottom: '16px' }} />
            <Title level={3} type="secondary">No tasks yet</Title>
            <Paragraph type="secondary">
              Get started by creating your first task!
            </Paragraph>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => navigate('/tasks')}
            >
              Create Your First Task
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
