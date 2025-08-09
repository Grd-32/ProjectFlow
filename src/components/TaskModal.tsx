import React, { useState, useEffect } from 'react';
import { useTask, Task, TaskComment, TaskAttachment } from '../contexts/TaskContext';
import { useUser } from '../contexts/UserContext';
import { useNotification } from '../contexts/NotificationContext';
import { useTimeTracking } from '../contexts/TimeTrackingContext';
import TimeTracker from './TimeTracker';
import { 
  X, 
  Calendar, 
  Flag, 
  User, 
  FileText, 
  Trash2, 
  MessageSquare, 
  Paperclip, 
  Send,
  Download,
  Upload,
  Clock,
  Copy,
  Archive,
  UserPlus,
  Tag
} from 'lucide-react';
import { format } from 'date-fns';

interface TaskModalProps {
  taskId: string | null;
  onClose: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ taskId, onClose }) => {
  const { tasks, addTask, updateTask, deleteTask, addTaskComment, addTaskAttachment, removeTaskAttachment } = useTask();
  const { currentUser, users, hasPermission } = useUser();
  const { addNotification } = useNotification();
  const { getTaskTotalTime } = useTimeTracking();
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'attachments' | 'time' | 'subtasks'>('details');
  const [newComment, setNewComment] = useState('');
  const [subtasks, setSubtasks] = useState<Array<{
    id: string;
    name: string;
    completed: boolean;
  }>>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Pending' as Task['status'],
    priority: 'Medium' as Task['priority'],
    assignee: {
      name: '',
      avatar: '',
      initials: ''
    },
    dueDate: '',
    project: '',
    tags: [] as string[],
    estimatedHours: 0,
    dependencies: [] as string[],
    comments: [] as TaskComment[],
    attachments: [] as TaskAttachment[]
  });

  const isEditing = taskId !== null;
  const task = isEditing ? tasks.find(t => t.id === taskId) : null;

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        assignee: task.assignee,
        dueDate: task.dueDate,
        project: task.project,
        tags: task.tags || [],
        estimatedHours: task.estimatedHours || 0,
        dependencies: task.dependencies || [],
        comments: task.comments,
        attachments: task.attachments
      });
      setSubtasks(task.subtasks || []);
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskData = {
      ...formData,
      subtasks,
      comments: formData.comments,
      attachments: formData.attachments
    };

    if (isEditing && task) {
      updateTask(task.id, taskData);
      addNotification({
        type: 'success',
        title: 'Task Updated',
        message: `Task "${taskData.name}" has been updated successfully`,
        userId: currentUser.id,
        relatedEntity: {
          type: 'task',
          id: task.id,
          name: taskData.name
        },
        actionUrl: '/tasks'
      });
    } else {
      addTask(taskData);
      addNotification({
        type: 'success',
        title: 'Task Created',
        message: `New task "${taskData.name}" has been created and assigned to ${taskData.assignee.name}`,
        userId: currentUser.id,
        relatedEntity: {
          type: 'task',
          id: 'new',
          name: taskData.name
        },
        actionUrl: '/tasks'
      });
    }
    
    onClose();
  };

  const handleDelete = () => {
    if (task && window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(task.id);
      addNotification({
        type: 'info',
        title: 'Task Deleted',
        message: `Task "${task.name}" has been deleted`,
        userId: currentUser.id,
        relatedEntity: {
          type: 'task',
          id: task.id,
          name: task.name
        }
      });
      onClose();
    }
  };

  const handleAddComment = () => {
    if (newComment.trim() && task) {
      addTaskComment(task.id, {
        author: currentUser.name,
        authorInitials: currentUser.initials,
        content: newComment.trim()
      });
      addNotification({
        type: 'info',
        title: 'Comment Added',
        message: `New comment added to task "${task.name}"`,
        userId: currentUser.id,
        relatedEntity: {
          type: 'task',
          id: task.id,
          name: task.name
        },
        actionUrl: '/tasks'
      });
      setNewComment('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && task) {
      Array.from(files).forEach(file => {
        addTaskAttachment(task.id, {
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedBy: currentUser.name,
          url: URL.createObjectURL(file) // In real app, this would be uploaded to server
        });
      });
      addNotification({
        type: 'info',
        title: 'Files Uploaded',
        message: `${files.length} file(s) uploaded to task "${task.name}"`,
        userId: currentUser.id,
        relatedEntity: {
          type: 'task',
          id: task.id,
          name: task.name
        },
        actionUrl: '/tasks'
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const generateInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleAssigneeChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      assignee: {
        name,
        avatar: '',
        initials: generateInitials(name)
      }
    }));
  };

  const addSubtask = () => {
    setSubtasks(prev => [...prev, {
      id: Date.now().toString(),
      name: '',
      completed: false
    }]);
  };

  const updateSubtask = (id: string, updates: Partial<{ name: string; completed: boolean }>) => {
    setSubtasks(prev => prev.map(subtask => 
      subtask.id === id ? { ...subtask, ...updates } : subtask
    ));
  };

  const removeSubtask = (id: string) => {
    setSubtasks(prev => prev.filter(subtask => subtask.id !== id));
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const duplicateTask = () => {
    if (task) {
      const duplicatedTask = {
        ...formData,
        name: `${formData.name} (Copy)`,
        status: 'Pending' as const,
        comments: [],
        attachments: [],
        subtasks: []
      };
      addTask(duplicatedTask);
      addNotification({
        type: 'info',
        title: 'Task Duplicated',
        message: `Task "${task.name}" has been duplicated`,
        userId: currentUser.id,
        relatedEntity: {
          type: 'task',
          id: 'new',
          name: duplicatedTask.name
        }
      });
      onClose();
    }
  };

  const archiveTask = () => {
    if (task) {
      updateTask(task.id, { status: 'Complete' });
      addNotification({
        type: 'info',
        title: 'Task Archived',
        message: `Task "${task.name}" has been archived`,
        userId: currentUser.id,
        relatedEntity: {
          type: 'task',
          id: task.id,
          name: task.name
        }
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col my-8">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Task' : 'Create New Task'}
          </h2>
          <div className="flex items-center space-x-2">
            {isEditing && (
              <>
                <button
                  onClick={duplicateTask}
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  title="Duplicate Task"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  onClick={archiveTask}
                  className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                  title="Archive Task"
                >
                  <Archive className="h-4 w-4" />
                </button>
              </>
            )}
            {isEditing && hasPermission('delete') && (
              <button
                onClick={handleDelete}
                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        {isEditing && (
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'details', label: 'Details', icon: FileText },
                { id: 'subtasks', label: `Subtasks (${subtasks.length})`, icon: Tag },
                { id: 'comments', label: `Comments (${task?.comments.length || 0})`, icon: MessageSquare },
                { id: 'attachments', label: `Attachments (${task?.attachments.length || 0})`, icon: Paperclip },
                { id: 'time', label: 'Time Tracking', icon: Clock }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Task Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              placeholder="Enter task name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              placeholder="Enter task description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Task['status'] }))}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              >
                <option value="Pending">Pending</option>
                <option value="In progress">In Progress</option>
                <option value="Complete">Complete</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Task['priority'] }))}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Assignee
              </label>
              <input
                type="text"
                value={formData.assignee.name}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                placeholder="Enter assignee name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project
              </label>
              <input
                type="text"
                value={formData.project}
                onChange={(e) => setFormData(prev => ({ ...prev, project: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                placeholder="Enter project name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estimated Hours
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={formData.estimatedHours}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: Number(e.target.value) }))}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add tags (press Enter)"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>
            </form>
          )}

          {/* Subtasks Tab */}
          {activeTab === 'subtasks' && task && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Subtasks</h3>
                <button
                  onClick={addSubtask}
                  className="flex items-center space-x-2 px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                >
                  <Tag className="h-4 w-4" />
                  <span>Add Subtask</span>
                </button>
              </div>
              
              <div className="space-y-3">
                {subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      onChange={(e) => updateSubtask(subtask.id, { completed: e.target.checked })}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                    <input
                      type="text"
                      value={subtask.name}
                      onChange={(e) => updateSubtask(subtask.id, { name: e.target.value })}
                      placeholder="Subtask name"
                      className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={() => removeSubtask(subtask.id)}
                      className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                
                {subtasks.length === 0 && (
                  <div className="text-center py-8">
                    <Tag className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No subtasks yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && task && (
            <div className="p-6 space-y-6">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {task.comments.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No comments yet</p>
                  </div>
                ) : (
                  task.comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-medium">{comment.authorInitials}</span>
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{comment.author}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {format(new Date(comment.createdAt), 'MMM d, yyyy HH:mm')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-medium">{currentUser.initials}</span>
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      rows={3}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white resize-none"
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        type="button"
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        className="flex items-center space-x-2 px-3 py-1 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Send className="h-3 w-3" />
                        <span>Send</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Attachments Tab */}
          {activeTab === 'attachments' && task && (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Attachments</h3>
                <label className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 cursor-pointer transition-colors">
                  <Upload className="h-4 w-4" />
                  <span>Upload Files</span>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              
              <div className="space-y-3">
                {task.attachments.length === 0 ? (
                  <div className="text-center py-8">
                    <Paperclip className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No attachments yet</p>
                  </div>
                ) : (
                  task.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded">
                          <Paperclip className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{attachment.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatFileSize(attachment.size)} • Uploaded by {attachment.uploadedBy} • {format(new Date(attachment.uploadedAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        {hasPermission('delete') && (
                          <button
                            type="button"
                            onClick={() => removeTaskAttachment(task.id, attachment.id)}
                            className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Time Tracking Tab */}
          {activeTab === 'time' && task && (
            <div className="p-6">
              <TimeTracker taskId={task.id} />
            </div>
          )}
        </div>

        {/* Footer */}
        {activeTab === 'details' && (
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              {isEditing ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskModal;