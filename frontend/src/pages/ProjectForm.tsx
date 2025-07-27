import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { createProject, updateProject, fetchProjectById } from '@/redux/slice/projectSlice';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import type { ICreateProject, IUpdateProject } from '@/types/backend';

const ProjectForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentProject, isCreating, isUpdating } = useAppSelector(state => state.project);
  const { handleError } = useErrorHandler();

  const isEditing = Boolean(id);
  const [formData, setFormData] = useState<ICreateProject>({
    name: '',
    description: '',
    status: 'ACTIVE'
  });

  useEffect(() => {
    if (isEditing && id) {
      dispatch(fetchProjectById(parseInt(id)));
    }
  }, [isEditing, id, dispatch]);

  useEffect(() => {
    if (isEditing && currentProject) {
      setFormData({
        name: currentProject.name,
        description: currentProject.description || '',
        status: currentProject.status as 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'
      });
    }
  }, [isEditing, currentProject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing && id) {
        const updateData: IUpdateProject = formData;
        await dispatch(updateProject({ id: parseInt(id), data: updateData })).unwrap();
        navigate(`/projects/${id}`);
      } else {
        const result = await dispatch(createProject(formData)).unwrap();
        navigate(`/projects/${result.id}`);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => navigate(isEditing ? `/projects/${id}` : '/projects')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            marginRight: '10px'
          }}
        >
          ← Back
        </button>
        <h1 style={{ display: 'inline' }}>
          {isEditing ? 'Edit Project' : 'Create New Project'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', border: '1px solid #ddd' }}>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Project Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
            placeholder="Enter project name"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="description" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px',
              resize: 'vertical'
            }}
            placeholder="Enter project description"
          />
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label htmlFor="status" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          >
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => navigate(isEditing ? `/projects/${id}` : '/projects')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isCreating || isUpdating}
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: 'pointer',
              opacity: (isCreating || isUpdating) ? 0.6 : 1
            }}
          >
            {isCreating || isUpdating
              ? (isEditing ? 'Updating...' : 'Creating...')
              : (isEditing ? 'Update Project' : 'Create Project')
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;
