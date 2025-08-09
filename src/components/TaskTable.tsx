import React from 'react';
import { useTask } from '../contexts/TaskContext';
import { useUser } from '../contexts/UserContext';
import { useNotification } from '../contexts/NotificationContext';
import { useTimeTracking } from '../contexts/TimeTrackingContext';
import TimeTracker from './TimeTracker';
import { 
  MoreHorizontal, 
  Calendar, 
  MessageSquare, 
  Paperclip,
  Flag,
  Flame,
  Edit3,
  UserPlus,
  Eye,
  Copy,
  Archive,
  Trash2,
  Clock,
  Tag
} from 'lucide-react';
import { useState } from 'react';

interface TaskTableProps {
  onEditTask?: (taskId: string) => void;
  filteredTasks?: any[];
}

const TaskTable: React.FC<TaskTableProps> = ({ onEditTask, filteredTasks }) => {
  const { tasks, deleteTask, updateTask } = useTask();
  const { hasPermission } = useUser();
  const { addNotification } = useNotification();
  const { getTaskTotalTime } = useTimeTracking();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const displayTasks = filteredTasks || tasks;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In progress':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      case 'Complete':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'Pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'Blocked':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'High':
        return <Flag className="h-4 w-4 text-red-500" />;
      case 'Medium':
        return <Flame className="h-4 w-4 text-orange-500" />;
      default:
        return null;
    }
  };

  const handleActionClick = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === taskId ? null : taskId);
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskId);
    }
    setActiveDropdown(null);
  };

  const handleDuplicateTask = (task: any) => {
    const duplicatedTask = {
      ...task,
      name: `${task.name} (Copy)`,
      status: 'Pending' as const,
      comments: [],
      attachments: []
    };
    // This would normally call addTask, but we'll simulate with updateTask
    addNotification({
      type: 'info',
      title: 'Task Duplicated',
      message: `Task "${task.name}" has been duplicated`,
      userId: '1',
      relatedEntity: {
        type: 'task',
        id: task.id,
        name: task.name
      }
    });
    setActiveDropdown(null);
  };

  const handleArchiveTask = (task: any) => {
    updateTask(task.id, { status: 'Complete' });
    addNotification({
      type: 'info',
      title: 'Task Archived',
      message: `Task "${task.name}" has been archived`,
      userId: '1',
      relatedEntity: {
        type: 'task',
        id: task.id,
        name: task.name
      }
    });
    setActiveDropdown(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex-1 overflow-hidden relative">
      <div className="h-full overflow-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0">
            <tr>
              <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900 dark:text-white w-8">
                <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" />
              </th>
              <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900 dark:text-white">
                Task Name
              </th>
              <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900 dark:text-white">
                Status
              </th>
              <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900 dark:text-white">
                Priority
              </th>
              <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900 dark:text-white">
                Assignee
              </th>
              <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900 dark:text-white">
                Due Date
              </th>
              <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900 dark:text-white">
                Project
              </th>
              <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900 dark:text-white">
                Time
              </th>
              <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900 dark:text-white w-16">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {displayTasks.map((task, index) => (
              <tr 
                key={task.id} 
                className={`group hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-700 transition-colors duration-150 ${
                  index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'
                }`}
              >
                <td className="py-4 px-6">
                  <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" />
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-3">
                    <span 
                      className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                      onClick={() => onEditTask?.(task.id)}
                    >
                      {task.name}
                    </span>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                        <Edit3 className="h-3 w-3" />
                      </button>
                      {task.comments.length > 0 && (
                        <div className="flex items-center space-x-1 text-gray-400 dark:text-gray-500">
                          <MessageSquare className="h-3 w-3" />
                          <span className="text-xs">{task.comments.length}</span>
                        </div>
                      )}
                      {task.attachments.length > 0 && (
                        <div className="flex items-center space-x-1 text-gray-400 dark:text-gray-500">
                          <Paperclip className="h-3 w-3" />
                          <span className="text-xs">{task.attachments.length}</span>
                        </div>
                      )}
                      {task.subtasks && task.subtasks.length > 0 && (
                        <div className="flex items-center space-x-1 text-gray-400 dark:text-gray-500">
                          <Tag className="h-3 w-3" />
                          <span className="text-xs">{task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center">
                    {getPriorityIcon(task.priority)}
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{task.priority}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-medium leading-none">{task.assignee.initials}</span>
                    </div>
                    <span className="text-sm text-gray-900 dark:text-white">{task.assignee.name}</span>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                      <UserPlus className="h-3 w-3" />
                    </button>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm text-gray-900 dark:text-white">
                      {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{task.project}</span>
                </td>
                <td className="py-4 px-6">
                  <TimeTracker taskId={task.id} compact />
                </td>
                <td className="py-4 px-6">
                  <div className="relative">
                    <button 
                      onClick={(e) => handleActionClick(e, task.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded"
                    >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                    
                    {activeDropdown === task.id && (
                      <div className="absolute right-0 top-8 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                        <button
                          onClick={() => {
                            onEditTask?.(task.id);
                            setActiveDropdown(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                        >
                          <Edit3 className="h-4 w-4" />
                          <span>Edit Task</span>
                        </button>
                        <button
                          onClick={() => setActiveDropdown(null)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View Details</span>
                        </button>
                        <button
                          onClick={() => setActiveDropdown(null)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                        >
                          <Copy className="h-4 w-4" />
                          <span onClick={() => handleDuplicateTask(task)}>Duplicate</span>
                        </button>
                        <button
                          onClick={() => setActiveDropdown(null)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                        >
                          <Archive className="h-4 w-4" />
                          <span onClick={() => handleArchiveTask(task)}>Archive</span>
                        </button>
                        <hr className="my-1 border-gray-200 dark:border-gray-600" />
                        {hasPermission('delete') && (
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Click outside to close dropdown */}
      {activeDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </div>
  );
};

export default TaskTable;