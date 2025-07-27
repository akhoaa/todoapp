import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchProjects, deleteProject } from '@/redux/slice/projectSlice';
import PermissionGuard from '@/components/PermissionGuard';
import type { IProject } from '@/types/backend';

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { projects, isLoading, isDeleting } = useAppSelector(state => state.project);

  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    console.log('🔍 Projects page: Fetching projects...');
    dispatch(fetchProjects());
  }, [dispatch]);

  // Debug logging
  useEffect(() => {
    console.log('🔍 Projects state updated:', {
      projectsCount: projects.length,
      isLoading,
      projects: projects.map(p => ({ id: p.id, name: p.name, owner: p.owner?.email }))
    });
  }, [projects, isLoading]);

  const filteredProjects = projects.filter(project => {
    const matchesFilter = filter === 'ALL' || project.status === filter;
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleDeleteProject = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      await dispatch(deleteProject(id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '#28a745';
      case 'COMPLETED': return '#007bff';
      case 'ARCHIVED': return '#6c757d';
      default: return '#6c757d';
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        Loading projects...
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Projects</h1>
        <PermissionGuard permissions={['project:create']}>
          <button
            onClick={() => navigate('/projects/new')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Create Project
          </button>
        </PermissionGuard>
      </div>

      {/* Filters and Search */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            minWidth: '200px'
          }}
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        >
          <option value="ALL">All Projects</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          {searchTerm || filter !== 'ALL' ? 'No projects match your filters.' : 'No projects found. Create your first project!'}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {filteredProjects.map((project: IProject) => (
            <div
              key={project.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'transform 0.2s',
              }}
              onClick={() => navigate(`/projects/${project.id}`)}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <h3 style={{ margin: 0, color: '#333' }}>{project.name}</h3>
                <span
                  style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: 'white',
                    backgroundColor: getStatusColor(project.status)
                  }}
                >
                  {project.status}
                </span>
              </div>

              {project.description && (
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
                  {project.description.length > 100
                    ? `${project.description.substring(0, 100)}...`
                    : project.description}
                </p>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#888' }}>
                <div>
                  <div>Tasks: {project._count?.tasks || 0}</div>
                  <div>Members: {project._count?.members || 0}</div>
                </div>
                <div>
                  Owner: {project.owner?.name || 'Unknown'}
                </div>
              </div>

              <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                <PermissionGuard permissions={['project:update']}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/projects/${project.id}/edit`);
                    }}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Edit
                  </button>
                </PermissionGuard>

                <PermissionGuard permissions={['project:delete']}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project.id);
                    }}
                    disabled={isDeleting}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      opacity: isDeleting ? 0.6 : 1
                    }}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </PermissionGuard>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;
