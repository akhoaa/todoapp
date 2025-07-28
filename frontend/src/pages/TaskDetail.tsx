import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Card, 
  Typography, 
  Breadcrumb, 
  Space, 
  Tag, 
  Button, 
  Descriptions,
  Row,
  Col,
  message,
  Popconfirm,
  Select,
  Modal,
  Form,
  Input
} from 'antd';
import { 
  HomeOutlined, 
  CheckSquareOutlined, 
  EditOutlined, 
  DeleteOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  ProjectOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { callGetTaskById, callDeleteTask, callUpdateTask, callGetUsers } from '@/config/api';
import { usePermissions } from '@/hooks/usePermissions';
import { useAppDispatch } from '@/redux/hooks';
import { removeTaskFromList, updateTaskInList } from '@/redux/slice/taskSlice';
import type { ITask, IUser, IUpdateTask } from '@/types/backend';

const { Title, Text } = Typography;
const { TextArea } = Input;

const TaskDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { hasPermission } = usePermissions();
  const dispatch = useAppDispatch();
  
  const [task, setTask] = useState<ITask | null>(null);
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (id) {
      fetchTaskData(parseInt(id));
    }
  }, [id]);

  const fetchTaskData = async (taskId: number) => {
    setLoading(true);
    try {
      const response = await callGetTaskById(taskId);
      setTask(response.data);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to fetch task data';
      message.error(errorMessage);
      navigate('/tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await callGetUsers();
      setUsers(response.data);
    } catch (error) {
      message.error('Failed to fetch users');
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    
    try {
      await callDeleteTask(task.id);
      message.success('Task deleted successfully');
      dispatch(removeTaskFromList(task.id));
      navigate('/tasks');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to delete task';
      message.error(errorMessage);
    }
  };

  const handleEdit = () => {
    if (!task) return;
    
    form.setFieldsValue({
      title: task.title,
      description: task.description,
      status: task.status,
    });
    setEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    if (!task) return;
    
    try {
      const values = await form.validateFields();
      const updateData: IUpdateTask = values;
      
      const response = await callUpdateTask(task.id, updateData);
      const updatedTask = response.data;
      
      setTask(updatedTask);
      dispatch(updateTaskInList(updatedTask));
      setEditModalVisible(false);
      message.success('Task updated successfully');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to update task';
      message.error(errorMessage);
    }
  };

  const handleAssign = async () => {
    if (!hasPermission('task:assign')) {
      message.error('You do not have permission to assign tasks');
      return;
    }
    
    await fetchUsers();
    setAssignModalVisible(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'IN_PROGRESS':
        return <SyncOutlined spin style={{ color: '#faad14' }} />;
      case 'PENDING':
        return <ClockCircleOutlined style={{ color: '#f5222d' }} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'IN_PROGRESS':
        return 'processing';
      case 'PENDING':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleBack = () => {
    if (task?.project?.id) {
      navigate(`/projects/${task.project.id}`);
    } else {
      navigate('/tasks');
    }
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
        Loading task details...
      </div>
    );
  }

  if (!task) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px',
        fontSize: '16px'
      }}>
        Task not found
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
          <CheckSquareOutlined />
          <span onClick={() => navigate('/tasks')} style={{ cursor: 'pointer' }}>
            Tasks
          </span>
        </Breadcrumb.Item>
        {task.project && (
          <Breadcrumb.Item>
            <ProjectOutlined />
            <span 
              onClick={() => navigate(`/projects/${task.project!.id}`)} 
              style={{ cursor: 'pointer' }}
            >
              {task.project.name}
            </span>
          </Breadcrumb.Item>
        )}
        <Breadcrumb.Item>
          {task.title}
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
              Back
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              Task Details
            </Title>
          </Space>
        </Col>
        <Col>
          <Space>
            {hasPermission('task:assign') && (
              <Button
                icon={<UserOutlined />}
                onClick={handleAssign}
              >
                Assign User
              </Button>
            )}
            {hasPermission('task:update') && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleEdit}
              >
                Edit Task
              </Button>
            )}
            {hasPermission('task:delete') && (
              <Popconfirm
                title="Delete Task"
                description="Are you sure you want to delete this task? This action cannot be undone."
                onConfirm={handleDelete}
                okText="Yes"
                cancelText="No"
                okType="danger"
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                >
                  Delete
                </Button>
              </Popconfirm>
            )}
          </Space>
        </Col>
      </Row>

      {/* Task Information Card */}
      <Card>
        <Row gutter={24}>
          <Col xs={24} md={16}>
            <div style={{ marginBottom: 24 }}>
              <Title level={3} style={{ marginBottom: 8 }}>
                {task.title}
              </Title>
              {task.description && (
                <Text style={{ fontSize: '16px', color: '#666' }}>
                  {task.description}
                </Text>
              )}
            </div>
            
            <Descriptions column={1} size="middle">
              <Descriptions.Item label="Status">
                <Tag 
                  color={getStatusColor(task.status)} 
                  icon={getStatusIcon(task.status)}
                  style={{ fontSize: '14px', padding: '4px 12px' }}
                >
                  {task.status.replace('_', ' ')}
                </Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="Project">
                {task.project ? (
                  <Space>
                    <Tag 
                      color="blue" 
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/projects/${task.project!.id}`)}
                    >
                      {task.project.name}
                    </Tag>
                    <Text type="secondary">({task.project.status})</Text>
                  </Space>
                ) : (
                  <Text type="secondary">No project assigned</Text>
                )}
              </Descriptions.Item>
              
              <Descriptions.Item label="Owner">
                {task.user ? (
                  <Space>
                    <Text strong>{task.user.name || task.user.email}</Text>
                    <Text type="secondary">({task.user.email})</Text>
                  </Space>
                ) : (
                  <Text type="secondary">No owner assigned</Text>
                )}
              </Descriptions.Item>
              
              <Descriptions.Item label="Created">
                {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'Unknown'}
              </Descriptions.Item>
              
              <Descriptions.Item label="Last Updated">
                {task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : 'Unknown'}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>

      {/* Edit Task Modal */}
      <Modal
        title="Edit Task"
        open={editModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => setEditModalVisible(false)}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: 'Please enter task title' }]}
          >
            <Input placeholder="Enter task title" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
          >
            <TextArea
              rows={4}
              placeholder="Enter task description (optional)"
            />
          </Form.Item>

          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: 'Please select task status' }]}
          >
            <Select>
              <Select.Option value="PENDING">Pending</Select.Option>
              <Select.Option value="IN_PROGRESS">In Progress</Select.Option>
              <Select.Option value="COMPLETED">Completed</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Assign User Modal */}
      <Modal
        title="Assign Task to User"
        open={assignModalVisible}
        onCancel={() => setAssignModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setAssignModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="assign" type="primary" disabled>
            Assign (Coming Soon)
          </Button>
        ]}
      >
        <Select
          placeholder="Select a user to assign this task"
          style={{ width: '100%' }}
          disabled
        >
          {users.map(user => (
            <Select.Option key={user.id} value={user.id}>
              {user.name || user.email} ({user.email})
            </Select.Option>
          ))}
        </Select>
        <div style={{ marginTop: 16, color: '#666', fontSize: '14px' }}>
          Task assignment functionality will be implemented in the next update.
        </div>
      </Modal>
    </div>
  );
};

export default TaskDetail;
