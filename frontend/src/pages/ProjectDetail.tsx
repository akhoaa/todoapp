import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchProjectById, fetchProjectMembers, addProjectMember, removeProjectMember, fetchUsers } from '@/redux/slice/projectSlice';
import PermissionGuard from '@/components/PermissionGuard';
import type { IAddProjectMember } from '@/types/backend';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentProject, projectMembers, availableUsers, isLoading, isLoadingUsers } = useAppSelector(state => state.project);

  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberData, setNewMemberData] = useState<IAddProjectMember>({
    userId: 0,
    role: 'MEMBER'
  });

  useEffect(() => {
    if (id) {
      const projectId = parseInt(id);
      dispatch(fetchProjectById(projectId));
      dispatch(fetchProjectMembers(projectId));
    }
  }, [id, dispatch]);

  // Refresh project data when returning from task creation
  useEffect(() => {
    const handleFocus = () => {
      if (id) {
        const projectId = parseInt(id);
        dispatch(fetchProjectById(projectId));
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [id, dispatch]);

  // Fetch users when Add Member form is shown
  useEffect(() => {
    if (showAddMember && availableUsers.length === 0) {
      console.log('🔍 Fetching users for member selection...');
      dispatch(fetchUsers());
    }
  }, [showAddMember, availableUsers.length, dispatch]);

  // Debug logging
  useEffect(() => {
    console.log('🔍 ProjectDetail Debug:', {
      projectId: id,
      currentProject: currentProject?.name,
      membersCount: projectMembers.length,
      availableUsersCount: availableUsers.length,
      showAddMember,
      isLoadingUsers
    });
  }, [id, currentProject, projectMembers.length, availableUsers.length, showAddMember, isLoadingUsers]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (id && newMemberData.userId > 0) {
      try {
        await dispatch(addProjectMember({
          projectId: parseInt(id),
          data: newMemberData
        })).unwrap();

        // Refresh members list
        dispatch(fetchProjectMembers(parseInt(id)));

        // Reset form
        setShowAddMember(false);
        setNewMemberData({ userId: 0, role: 'MEMBER' });
      } catch (error) {
        console.error('Failed to add member:', error);
        alert('Failed to add member. Please try again.');
      }
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (id && window.confirm('Are you sure you want to remove this member?')) {
      try {
        await dispatch(removeProjectMember({
          projectId: parseInt(id),
          memberId
        })).unwrap();

        // Refresh members list
        dispatch(fetchProjectMembers(parseInt(id)));
      } catch (error) {
        console.error('Failed to remove member:', error);
        alert('Failed to remove member. Please try again.');
      }
    }
  };

  // Get available users (exclude current members)
  const getAvailableUsers = () => {
    const memberUserIds = projectMembers.map(member => member.user.id);
    return availableUsers.filter(user => !memberUserIds.includes(user.id));
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
        Loading project...
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Project not found</h2>
        <button onClick={() => navigate('/projects')}>Back to Projects</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <button
            onClick={() => navigate('/projects')}
            style={{ marginRight: '10px', padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            ← Back
          </button>
          <h1 style={{ display: 'inline', marginLeft: '10px' }}>{currentProject.name}</h1>
          <span
            style={{
              marginLeft: '15px',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 'bold',
              color: 'white',
              backgroundColor: getStatusColor(currentProject.status)
            }}
          >
            {currentProject.status}
          </span>
        </div>

        <PermissionGuard permissions={['project:update']}>
          <button
            onClick={() => navigate(`/projects/${currentProject.id}/edit`)}
            style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Edit Project
          </button>
        </PermissionGuard>
      </div>

      {/* Project Info */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: 'white' }}>
        <h3>Project Information</h3>
        {currentProject.description && (
          <p style={{ color: '#666', marginBottom: '15px' }}>{currentProject.description}</p>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <strong>Owner:</strong> {currentProject.owner?.name || 'Unknown'}
          </div>
          <div>
            <strong>Created:</strong> {new Date(currentProject.createdAt).toLocaleDateString()}
          </div>
          <div>
            <strong>Last Updated:</strong> {new Date(currentProject.updatedAt).toLocaleDateString()}
          </div>
          <div>
            <strong>Tasks:</strong> {currentProject.tasks?.length || 0}
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3>Tasks</h3>
          <PermissionGuard permissions={['task:create']}>
            <button
              onClick={() => navigate(`/tasks/new?projectId=${currentProject.id}`)}
              style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              Add Task
            </button>
          </PermissionGuard>
        </div>

        {currentProject.tasks && currentProject.tasks.length > 0 ? (
          <div style={{ display: 'grid', gap: '10px' }}>
            {currentProject.tasks.map(task => (
              <div
                key={task.id}
                style={{
                  padding: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
                onClick={() => navigate(`/tasks/${task.id}`)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0 }}>{task.title}</h4>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    backgroundColor: task.status === 'COMPLETED' ? '#28a745' : task.status === 'IN_PROGRESS' ? '#ffc107' : '#6c757d',
                    color: 'white'
                  }}>
                    {task.status}
                  </span>
                </div>
                {task.description && (
                  <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '14px' }}>
                    {task.description.length > 100 ? `${task.description.substring(0, 100)}...` : task.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No tasks in this project yet.</p>
        )}
      </div>

      {/* Members Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3>Project Members</h3>
          <PermissionGuard permissions={['project:manage_members']}>
            <button
              onClick={() => setShowAddMember(true)}
              style={{ padding: '8px 16px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              Add Member
            </button>
          </PermissionGuard>
        </div>

        {/* Add Member Form */}
        {showAddMember && (
          <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
            <h4 style={{ marginTop: 0, marginBottom: '15px' }}>Add New Member</h4>

            {isLoadingUsers ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>Loading users...</div>
            ) : (
              <form onSubmit={handleAddMember}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'end', flexWrap: 'wrap' }}>
                  <div style={{ minWidth: '200px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Select User:</label>
                    <select
                      value={newMemberData.userId || ''}
                      onChange={(e) => setNewMemberData({ ...newMemberData, userId: parseInt(e.target.value) || 0 })}
                      style={{
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        width: '100%',
                        fontSize: '14px'
                      }}
                      required
                    >
                      <option value="">-- Select a user --</option>
                      {getAvailableUsers().map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name || user.email} ({user.email})
                        </option>
                      ))}
                    </select>
                    {getAvailableUsers().length === 0 && (
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                        All users are already members of this project
                      </div>
                    )}
                  </div>

                  <div style={{ minWidth: '120px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Role:</label>
                    <select
                      value={newMemberData.role}
                      onChange={(e) => setNewMemberData({ ...newMemberData, role: e.target.value as 'MEMBER' | 'MANAGER' })}
                      style={{
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        width: '100%',
                        fontSize: '14px'
                      }}
                    >
                      <option value="MEMBER">Member</option>
                      <option value="MANAGER">Manager</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="submit"
                      disabled={!newMemberData.userId || getAvailableUsers().length === 0}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: newMemberData.userId && getAvailableUsers().length > 0 ? '#28a745' : '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: newMemberData.userId && getAvailableUsers().length > 0 ? 'pointer' : 'not-allowed',
                        fontSize: '14px'
                      }}
                    >
                      Add Member
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddMember(false);
                        setNewMemberData({ userId: 0, role: 'MEMBER' });
                      }}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Members List */}
        {projectMembers.length > 0 ? (
          <div style={{ display: 'grid', gap: '10px' }}>
            {projectMembers.map(member => (
              <div
                key={member.id}
                style={{
                  padding: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <strong>{member.user.name}</strong>
                  <div style={{ color: '#666', fontSize: '14px' }}>{member.user.email}</div>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    backgroundColor: member.role === 'MANAGER' ? '#007bff' : '#6c757d',
                    color: 'white'
                  }}>
                    {member.role}
                  </span>
                </div>

                <PermissionGuard permissions={['project:manage_members']}>
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  >
                    Remove
                  </button>
                </PermissionGuard>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No members in this project yet.</p>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
