import React, { useState } from 'react';
import { useTask } from '../contexts/TaskContext';
import { useUser } from '../contexts/UserContext';
import { useTimeTracking } from '../contexts/TimeTrackingContext';
import { 
  Users, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  BarChart3,
  User,
  Target,
  Activity
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';

interface WorkloadViewProps {
  selectedUsers?: string[];
  dateRange?: { start: Date; end: Date };
}

const WorkloadView: React.FC<WorkloadViewProps> = ({ 
  selectedUsers = [], 
  dateRange = { 
    start: startOfWeek(new Date()), 
    end: endOfWeek(new Date()) 
  } 
}) => {
  const { tasks } = useTask();
  const { users } = useUser();
  const { getUserTotalTime } = useTimeTracking();
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [selectedUser, setSelectedUser] = useState<string>('all');

  const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
  const displayUsers = selectedUsers.length > 0 
    ? users.filter(u => selectedUsers.includes(u.id))
    : users;

  const getUserWorkload = (userId: string) => {
    const userTasks = tasks.filter(task => task.assignee.name === users.find(u => u.id === userId)?.name);
    const totalTasks = userTasks.length;
    const completedTasks = userTasks.filter(task => task.status === 'Complete').length;
    const inProgressTasks = userTasks.filter(task => task.status === 'In progress').length;
    const overdueTasks = userTasks.filter(task => 
      task.status !== 'Complete' && new Date(task.dueDate) < new Date()
    ).length;
    const totalHours = getUserTotalTime(userId);
    const estimatedHours = userTasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      totalHours,
      estimatedHours,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      utilization: estimatedHours > 0 ? (totalHours / 60) / estimatedHours * 100 : 0
    };
  };

  const getTasksForUserAndDay = (userId: string, day: Date) => {
    const user = users.find(u => u.id === userId);
    if (!user) return [];
    
    return tasks.filter(task => 
      task.assignee.name === user.name && 
      isSameDay(new Date(task.dueDate), day)
    );
  };

  const getWorkloadColor = (utilization: number) => {
    if (utilization > 100) return 'bg-red-500';
    if (utilization > 80) return 'bg-yellow-500';
    if (utilization > 60) return 'bg-green-500';
    return 'bg-blue-500';
  };

  const getWorkloadLevel = (utilization: number) => {
    if (utilization > 100) return { level: 'Overloaded', color: 'text-red-600 dark:text-red-400' };
    if (utilization > 80) return { level: 'High', color: 'text-yellow-600 dark:text-yellow-400' };
    if (utilization > 60) return { level: 'Optimal', color: 'text-green-600 dark:text-green-400' };
    return { level: 'Light', color: 'text-blue-600 dark:text-blue-400' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Team Workload</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Visualize team capacity and task distribution</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
          >
            <option value="all">All Team Members</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                viewMode === 'week' 
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                viewMode === 'month' 
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Month
            </button>
          </div>
        </div>
      </div>

      {/* Team Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Team Members</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{displayUsers.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(displayUsers.reduce((sum, user) => sum + getUserWorkload(user.id).completionRate, 0) / displayUsers.length)}%
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overloaded Members</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {displayUsers.filter(user => getUserWorkload(user.id).utilization > 100).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Hours</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(displayUsers.reduce((sum, user) => sum + getUserWorkload(user.id).totalHours, 0) / 60)}h
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Workload Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Team Workload Distribution</h3>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {(selectedUser === 'all' ? displayUsers : displayUsers.filter(u => u.id === selectedUser)).map((user) => {
              const workload = getUserWorkload(user.id);
              const workloadLevel = getWorkloadLevel(workload.utilization);
              
              return (
                <div key={user.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">{user.initials}</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.department} • {user.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-medium ${workloadLevel.color}`}>
                        {workloadLevel.level}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {workload.utilization.toFixed(1)}% utilization
                      </p>
                    </div>
                  </div>

                  {/* Workload Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Capacity</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {Math.round(workload.totalHours / 60)}h / {workload.estimatedHours}h
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getWorkloadColor(workload.utilization)}`}
                        style={{ width: `${Math.min(workload.utilization, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Task Stats */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{workload.totalTasks}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total Tasks</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">{workload.completedTasks}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{workload.inProgressTasks}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">In Progress</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-red-600 dark:text-red-400">{workload.overdueTasks}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Overdue</p>
                    </div>
                  </div>

                  {/* Daily Schedule */}
                  {viewMode === 'week' && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">This Week's Schedule</h5>
                      <div className="grid grid-cols-7 gap-1">
                        {days.map((day, index) => {
                          const dayTasks = getTasksForUserAndDay(user.id, day);
                          const dayWorkload = dayTasks.length;
                          
                          return (
                            <div key={index} className="text-center">
                              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                {format(day, 'EEE')}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                {format(day, 'd')}
                              </div>
                              <div className={`w-full h-8 rounded flex items-center justify-center text-xs font-medium text-white ${
                                dayWorkload === 0 ? 'bg-gray-300 dark:bg-gray-600' :
                                dayWorkload <= 2 ? 'bg-green-500' :
                                dayWorkload <= 4 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}>
                                {dayWorkload}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Workload Recommendations */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Workload Recommendations</h3>
        
        <div className="space-y-3">
          {displayUsers.map((user) => {
            const workload = getUserWorkload(user.id);
            let recommendation = '';
            let icon = <CheckCircle className="h-4 w-4 text-green-600" />;
            let bgColor = 'bg-green-50 dark:bg-green-900/20';
            
            if (workload.utilization > 100) {
              recommendation = `${user.name} is overloaded (${workload.utilization.toFixed(1)}% capacity). Consider redistributing ${workload.overdueTasks} overdue tasks.`;
              icon = <AlertTriangle className="h-4 w-4 text-red-600" />;
              bgColor = 'bg-red-50 dark:bg-red-900/20';
            } else if (workload.utilization < 50) {
              recommendation = `${user.name} has available capacity (${(100 - workload.utilization).toFixed(1)}% free). Consider assigning additional tasks.`;
              icon = <TrendingUp className="h-4 w-4 text-blue-600" />;
              bgColor = 'bg-blue-50 dark:bg-blue-900/20';
            } else {
              recommendation = `${user.name} has optimal workload (${workload.utilization.toFixed(1)}% capacity). Current allocation is well-balanced.`;
            }

            return (
              <div key={user.id} className={`p-4 rounded-lg ${bgColor}`}>
                <div className="flex items-start space-x-3">
                  {icon}
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{recommendation}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{workload.totalTasks} tasks</span>
                      <span>{Math.round(workload.totalHours / 60)}h logged</span>
                      <span>{workload.completionRate.toFixed(1)}% completion rate</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WorkloadView;