import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchProjects } from '@/redux/slice/projectSlice';
import { callCreateTask, callUpdateTask, callGetTaskById } from '@/config/api';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import type { ICreateTask, IUpdateTask, ITask } from '@/types/backend';

const TaskForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { projects } = useAppSelector(state => state.project);
  const { handleApiResponse, showErrorMessage } = useErrorHandler();

  const isEditing = Boolean(id);
  const projectIdFromUrl = searchParams.get('projectId');

  const [formData, setFormData] = useState<ICreateTask>({
    title: '',
    description: '',
    status: 'PENDING',
    projectId: projectIdFromUrl ? parseInt(projectIdFromUrl) : undefined
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTask, setCurrentTask] = useState<ITask | null>(null);

  // Fetch projects for dropdown
  useEffect(() => {
    if (projects.length === 0) {
      console.log('🔍 TaskForm: Fetching projects for dropdown...');
      dispatch(fetchProjects());
    }
  }, [dispatch, projects.length]);

  // Debug logging
  useEffect(() => {
    console.log('🔍 TaskForm Debug:', {
      isEditing,
      projectIdFromUrl,
      projectsCount: projects.length,
      formData,
      currentTask: currentTask?.id
    });
  }, [isEditing, projectIdFromUrl, projects.length, formData, currentTask]);

  // Fetch task data if editing
  useEffect(() => {
    if (isEditing && id) {
      const fetchTask = async () => {
        try {
          const response = await callGetTaskById(parseInt(id));
          const task = response.data;
          setCurrentTask(task);
          setFormData({
            title: task.title,
            description: task.description || '',
            status: task.status,
            projectId: task.projectId || undefined
          });
        } catch (error) {
          showErrorMessage(error);
          navigate('/tasks');
        }
      };
      fetchTask();
    }
  }, [isEditing, id, showErrorMessage, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isEditing && id) {
        // Update existing task
        const updateData: IUpdateTask = formData;
        await handleApiResponse(
          () => callUpdateTask(parseInt(id), updateData),
          {
            successTitle: 'Task Updated',
            successDescription: `"${formData.title}" has been updated successfully.`,
            onSuccess: () => {
              if (formData.projectId) {
                navigate(`/projects/${formData.projectId}`);
              } else {
                navigate('/tasks');
              }
            }
          }
        );
      } else {
        // Create new task
        const createData: ICreateTask = formData;
        await handleApiResponse(
          () => callCreateTask(createData),
          {
            successTitle: 'Task Created',
            successDescription: `"${formData.title}" has been created successfully.`,
            onSuccess: () => {
              if (formData.projectId) {
                navigate(`/projects/${formData.projectId}`);
              } else {
                navigate('/tasks');
              }
            }
          }
        );
      }
    } catch (error) {
      showErrorMessage(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (formData.projectId) {
      navigate(`/projects/${formData.projectId}`);
    } else {
      navigate('/tasks');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={handleCancel}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '10px'
          }}
        >
          ← Back
        </button>
        <h1>{isEditing ? 'Edit Task' : 'Create New Task'}</h1>
        {formData.projectId && (
          <p style={{ color: '#666' }}>
            Creating task for project: {projects.find(p => p.id === formData.projectId)?.name || 'Loading...'}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
            placeholder="Enter task title"
            required
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Description
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px',
              minHeight: '100px',
              resize: 'vertical'
            }}
            placeholder="Enter task description (optional)"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' })}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          >
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Project (Optional)
          </label>
          <select
            value={formData.projectId || ''}
            onChange={(e) => setFormData({ ...formData, projectId: e.target.value ? parseInt(e.target.value) : undefined })}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          >
            <option value="">-- No Project --</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name} ({project.status})
              </option>
            ))}
          </select>
          {projects.length === 0 && (
            <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
              Loading projects...
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={handleCancel}
            style={{
              padding: '12px 24px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !formData.title.trim()}
            style={{
              padding: '12px 24px',
              backgroundColor: isSubmitting || !formData.title.trim() ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isSubmitting || !formData.title.trim() ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            {isSubmitting ? 'Saving...' : (isEditing ? 'Update Task' : 'Create Task')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
