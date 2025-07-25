import React, { useEffect, useState } from 'react';
import {
  Card,
  Button,
  Table,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  Typography,
  Row,
  Col
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { fetchTasks, addTask, updateTask, removeTask } from '@/redux/slice/taskSlice';
import { callCreateTask, callUpdateTask, callDeleteTask } from '@/config/api';
import type { ITask, ICreateTask, IUpdateTask } from '@/types/backend';
import dayjs from 'dayjs';
import { useErrorHandler } from '@/hooks/useErrorHandler';

const { Title } = Typography;
const { TextArea } = Input;

const Tasks: React.FC = () => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const { tasks, isLoading } = useAppSelector(state => state.task);
  const {
    handleApiResponse,
    showErrorMessage,
    showSuccessMessage,
    showSuccessNotification
  } = useErrorHandler({
    showDetails: import.meta.env.DEV
  });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<ITask | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    dispatch(fetchTasks(statusFilter || undefined));
  }, [dispatch, statusFilter]);

  const handleCreateTask = () => {
    setEditingTask(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditTask = (task: ITask) => {
    setEditingTask(task);
    form.setFieldsValue({
      title: task.title,
      description: task.description,
      status: task.status,
    });
    setIsModalVisible(true);
  };

  const handleDeleteTask = async (taskId: number) => {
    await handleApiResponse(
      () => callDeleteTask(taskId),
      {
        successMessage: 'Task deleted successfully',
        onSuccess: () => {
          dispatch(removeTask(taskId));
        },
        onError: (error) => {
          console.error('Delete task error:', error);
        }
      }
    );
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);

      if (editingTask) {
        // Update existing task
        const updateData: IUpdateTask = values;
        await handleApiResponse(
          () => callUpdateTask(editingTask.id, updateData),
          {
            successTitle: 'Task Updated',
            successDescription: `"${values.title}" has been updated successfully.`,
            errorOptions: {
              useNotification: true, // Show detailed validation errors
              showDetails: import.meta.env.DEV
            },
            onSuccess: (res) => {
              if (res && res.data) {
                dispatch(updateTask(res.data));
                setIsModalVisible(false);
                form.resetFields();
                setEditingTask(null);
              }
            }
          }
        );
      } else {
        // Create new task
        const createData: ICreateTask = values;
        await handleApiResponse(
          () => callCreateTask(createData),
          {
            successTitle: 'Task Created',
            successDescription: `"${values.title}" has been created successfully.`,
            errorOptions: {
              useNotification: true, // Show detailed validation errors
              showDetails: import.meta.env.DEV
            },
            onSuccess: (res) => {
              if (res && res.data) {
                dispatch(addTask(res.data));
                setIsModalVisible(false);
                form.resetFields();
              }
            }
          }
        );
      }
    } catch (error: any) {
      // Form validation errors
      showErrorMessage(error, 'Please check the form fields');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingTask(null);
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

  const user = useAppSelector(state => state.account.user);
  const isAdmin = user?.roles === 'admin';

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => text || '-',
    },
    ...(isAdmin ? [{
      title: 'Owner',
      dataIndex: 'user',
      key: 'owner',
      render: (user: any) => user ? `${user.name} (${user.email})` : '-',
    }] : []),
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status.replace('_', ' ')}
        </Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ITask) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditTask(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this task?"
            onConfirm={() => handleDeleteTask(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Title level={2}>Tasks</Title>
        </Col>
        <Col>
          <Space>
            <Select
              placeholder="Filter by status"
              style={{ width: 150 }}
              allowClear
              value={statusFilter || undefined}
              onChange={setStatusFilter}
            >
              <Select.Option value="PENDING">Pending</Select.Option>
              <Select.Option value="IN_PROGRESS">In Progress</Select.Option>
              <Select.Option value="COMPLETED">Completed</Select.Option>
            </Select>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateTask}
            >
              New Task
            </Button>
          </Space>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={tasks}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} tasks`,
          }}
        />
      </Card>

      <Modal
        title={editingTask ? 'Edit Task' : 'Create New Task'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={isSubmitting}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: 'PENDING' }}
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
    </div>
  );
};

export default Tasks;
