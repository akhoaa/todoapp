import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../contexts/AuthContext';
import { 
  CheckSquare, 
  Clock, 
  PlayCircle, 
  CheckCircle2, 
  Plus,
  TrendingUp,
  Calendar
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { tasks, loading } = useTasks();

  const pendingTasks = tasks.filter(task => task.status === 'PENDING');
  const inProgressTasks = tasks.filter(task => task.status === 'IN_PROGRESS');
  const completedTasks = tasks.filter(task => task.status === 'COMPLETED');

  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  const recentTasks = tasks
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100';
      case 'IN_PROGRESS':
        return 'text-blue-600 bg-blue-100';
      case 'COMPLETED':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'IN_PROGRESS':
        return <PlayCircle className="h-4 w-4" />;
      case 'COMPLETED':
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name || user?.email}!
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Here's what's happening with your tasks today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckSquare className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{pendingTasks.length}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <PlayCircle className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{inProgressTasks.length}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{completionRate}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Tasks */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recent Tasks</h2>
            <Link
              to="/tasks"
              className="text-sm text-primary-600 hover:text-primary-500 font-medium"
            >
              View all
            </Link>
          </div>

          {recentTasks.length === 0 ? (
            <div className="text-center py-8">
              <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No tasks yet</p>
              <Link
                to="/tasks"
                className="btn-primary mt-4 inline-flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create your first task</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div key={task.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-1 rounded-full ${getStatusColor(task.status)}`}>
                    {getStatusIcon(task.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {task.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/tasks?action=create"
              className="btn-primary w-full justify-center py-3"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Task
            </Link>
            
            <Link
              to="/tasks?status=PENDING"
              className="btn-outline w-full justify-center py-3"
            >
              <Clock className="h-4 w-4 mr-2" />
              View Pending Tasks
            </Link>
            
            <Link
              to="/tasks?status=IN_PROGRESS"
              className="btn-outline w-full justify-center py-3"
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              View In Progress
            </Link>
            
            <Link
              to="/profile"
              className="btn-secondary w-full justify-center py-3"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Manage Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
