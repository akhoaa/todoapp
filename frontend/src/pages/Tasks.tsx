import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import { TaskStatus } from '../types';
import { 
  Plus, 
  Filter, 
  Search,
  Clock,
  PlayCircle,
  CheckCircle2,
  Edit,
  Trash2,
  MoreVertical
} from 'lucide-react';
import TaskModal from '../components/TaskModal';

const Tasks: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState<number | null>(null);

  const { tasks, loading, error, createTask, updateTask, deleteTask, setFilters } = useTasks();

  // Handle URL params
  useEffect(() => {
    const status = searchParams.get('status') as TaskStatus;
    const action = searchParams.get('action');
    
    if (status) {
      setStatusFilter(status);
      setFilters({ status });
    }
    
    if (action === 'create') {
      setIsModalOpen(true);
      // Remove action param
      searchParams.delete('action');
      setSearchParams(searchParams);
    }
  }, [searchParams, setFilters, setSearchParams]);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusFilterChange = (status: TaskStatus | '') => {
    setStatusFilter(status);
    if (status) {
      setFilters({ status });
      setSearchParams({ status });
    } else {
      setFilters({});
      setSearchParams({});
    }
  };

  const handleCreateTask = async (data: any) => {
    try {
      await createTask(data);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleUpdateTask = async (data: any) => {
    if (!editingTask) return;
    
    try {
      await updateTask(editingTask.id, data);
      setEditingTask(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: TaskStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100';
      case 'IN_PROGRESS':
        return 'text-blue-600 bg-blue-100';
      case 'COMPLETED':
        return 'text-green-600 bg-green-100';
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'IN_PROGRESS':
        return <PlayCircle className="h-4 w-4" />;
      case 'COMPLETED':
        return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your tasks and track your progress
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value as TaskStatus | '')}
            className="input pl-10 pr-8"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || statusFilter 
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by creating your first task'
            }
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Task</span>
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTasks.map((task) => (
            <div key={task.id} className="card p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {getStatusIcon(task.status)}
                      <span className="ml-1">{task.status.replace('_', ' ')}</span>
                    </span>
                  </div>
                  
                  {task.description && (
                    <p className="text-gray-600 mb-3">{task.description}</p>
                  )}
                  
                  <p className="text-sm text-gray-500">
                    Created {new Date(task.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(showDropdown === task.id ? null : task.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>

                  {showDropdown === task.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                      <button
                        onClick={() => {
                          setEditingTask(task);
                          setIsModalOpen(true);
                          setShowDropdown(null);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                      
                      {task.status !== 'COMPLETED' && (
                        <button
                          onClick={() => {
                            handleStatusChange(task.id, 'COMPLETED');
                            setShowDropdown(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Mark Complete</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          handleDeleteTask(task.id);
                          setShowDropdown(null);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        task={editingTask}
      />
    </div>
  );
};

export default Tasks;
