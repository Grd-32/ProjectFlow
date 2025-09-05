import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTask } from '../contexts/TaskContext';
import { useUser } from '../contexts/UserContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { 
  CheckSquare, 
  Target, 
  FileText, 
  TrendingUp,
  Clock,
  AlertCircle,
  Users,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';

const Dashboard = () => {
  const navigate = useNavigate();
  const { tasks, goals } = useTask();
  const { hasPermission } = useUser();
  const { currentWorkspace } = useWorkspace();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const completedTasks = tasks.filter(task => task.status === 'Complete').length;
  const inProgressTasks = tasks.filter(task => task.status === 'In progress').length;
  const blockedTasks = tasks.filter(task => task.status === 'Blocked').length;
  const activeGoals = goals.filter(goal => goal.status === 'Active').length;

  const recentTasks = tasks
    .filter(task => !currentWorkspace || currentWorkspace.projects.includes(task.projectId))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const upcomingDeadlines = tasks
    .filter(task => !currentWorkspace || currentWorkspace.projects.includes(task.projectId))
    .filter(task => task.status !== 'Complete')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  const stats = [
    {
      title: 'Total Tasks',
      value: tasks.length,
      icon: CheckSquare,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'In Progress',
      value: inProgressTasks,
      icon: Clock,
      color: 'bg-purple-500',
      change: '+8%'
    },
    {
      title: 'Completed',
      value: completedTasks,
      icon: TrendingUp,
      color: 'bg-green-500',
      change: '+23%'
    },
    {
      title: 'Active Goals',
      value: activeGoals,
      icon: Target,
      color: 'bg-orange-500',
      change: '+5%'
    }
  ];

  return (
    <div className={`${isMobile ? 'p-4 space-y-4' : 'p-6 space-y-6'}`}>
      {/* Header */}
      <div>
        <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 dark:text-white`}>Dashboard</h1>
        <p className={`text-gray-600 dark:text-gray-400 mt-1 ${isMobile ? 'text-sm' : ''}`}>
          Welcome back! Here's what's happening in {currentWorkspace?.name || 'your workspace'}.
        </p>
      </div>

      {/* Stats Grid */}
      <div className={`grid grid-cols-1 ${isMobile ? 'sm:grid-cols-2 gap-4' : 'md:grid-cols-2 lg:grid-cols-4 gap-6'}`}>
        {stats.map((stat, index) => (
          <div key={index} className={`bg-white dark:bg-gray-800 rounded-lg ${isMobile ? 'p-4' : 'p-6'} border border-gray-200 dark:border-gray-700`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-600 dark:text-gray-400`}>{stat.title}</p>
                <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 dark:text-white mt-2`}>{stat.value}</p>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-green-600 dark:text-green-400 mt-1`}>{stat.change} from last month</p>
              </div>
              <div className={`${isMobile ? 'p-2' : 'p-3'} rounded-lg ${stat.color}`}>
                <stat.icon className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-white`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'lg:grid-cols-2 gap-6'}`}>
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className={`${isMobile ? 'p-4' : 'p-6'} border-b border-gray-200 dark:border-gray-700`}>
            <h2 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-900 dark:text-white`}>Recent Activity</h2>
          </div>
          <div className={isMobile ? 'p-4' : 'p-6'}>
            <div className="space-y-4">
              {recentTasks.map((task) => (
                <div key={task.id} className="flex items-center space-x-3">
                  <div className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white text-xs font-medium">{task.assignee.initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-900 dark:text-white truncate`}>
                      {task.name}
                    </p>
                    <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500 dark:text-gray-400`}>
                      Updated {format(new Date(task.updatedAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    task.status === 'Complete' 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                      : task.status === 'In progress'
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                      : task.status === 'Blocked'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                  }`}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Deadlines</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingDeadlines.map((task) => (
                <div key={task.id} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {task.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Due {format(new Date(task.dueDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center">
                    {task.priority === 'High' && (
                      <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-400">{task.project}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Goals Progress */}
      {hasPermission('view_analytics') && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Goals Progress</h2>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {goals.slice(0, 3).map((goal) => (
              <div key={goal.id}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">{goal.title}</h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {goal.category === 'Growth' 
                      ? `${goal.progress.toLocaleString()} / ${goal.target.toLocaleString()}`
                      : `${Math.round((goal.progress / goal.target) * 100)}%`
                    }
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min((goal.progress / goal.target) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Due {format(new Date(goal.dueDate), 'MMM d, yyyy')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default Dashboard;