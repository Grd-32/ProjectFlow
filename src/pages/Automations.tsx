import React, { useState } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { useTask } from '../contexts/TaskContext';
import { useProject } from '../contexts/ProjectContext';
import { useUser } from '../contexts/UserContext';
import { 
  Zap, 
  Plus, 
  Play, 
  Pause, 
  Settings, 
  ArrowRight, 
  Edit3, 
  Trash2, 
  Copy,
  Clock,
  Users,
  Mail,
  Bell,
  Calendar,
  CheckSquare,
  Search,
  Filter,
  BarChart3,
  AlertTriangle,
  Target,
  FileText,
  DollarSign,
  Workflow,
  GitBranch,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react';
import { format } from 'date-fns';

interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'task_created' | 'task_updated' | 'task_completed' | 'project_created' | 'deadline_approaching' | 'schedule' | 'budget_exceeded' | 'user_assigned' | 'milestone_reached';
    conditions: any;
  };
  actions: {
    type: 'assign_user' | 'send_notification' | 'create_task' | 'update_status' | 'send_email' | 'create_subtask' | 'update_budget' | 'send_slack' | 'create_calendar_event';
    parameters: any;
  }[];
  status: 'Active' | 'Paused' | 'Draft';
  runsCount: number;
  successRate: number;
  lastRun?: string;
  nextRun?: string;
  createdAt: string;
  createdBy: string;
  category: string;
  tags: string[];
}

interface AutomationModalProps {
  isOpen: boolean;
  onClose: () => void;
  automation?: Automation;
}

const AutomationModal: React.FC<AutomationModalProps> = ({ isOpen, onClose, automation }) => {
  const { addNotification } = useNotification();
  const { tasks } = useTask();
  const { projects } = useProject();
  const { users } = useUser();
  const [formData, setFormData] = useState({
    name: automation?.name || '',
    description: automation?.description || '',
    category: automation?.category || 'General',
    triggerType: automation?.trigger.type || 'task_created',
    triggerConditions: automation?.trigger.conditions || {},
    actions: automation?.actions || [{
      type: 'send_notification',
      parameters: { message: '', recipients: 'assignee' }
    }],
    tags: automation?.tags || []
  });
  const [tagInput, setTagInput] = useState('');

  const triggerTypes = [
    { value: 'task_created', label: 'Task Created', icon: CheckSquare },
    { value: 'task_updated', label: 'Task Updated', icon: Edit3 },
    { value: 'task_completed', label: 'Task Completed', icon: CheckSquare },
    { value: 'project_created', label: 'Project Created', icon: FileText },
    { value: 'deadline_approaching', label: 'Deadline Approaching', icon: Clock },
    { value: 'schedule', label: 'Scheduled', icon: Calendar },
    { value: 'budget_exceeded', label: 'Budget Exceeded', icon: DollarSign },
    { value: 'user_assigned', label: 'User Assigned', icon: Users },
    { value: 'milestone_reached', label: 'Milestone Reached', icon: Target }
  ];

  const actionTypes = [
    { value: 'send_notification', label: 'Send Notification', icon: Bell },
    { value: 'assign_user', label: 'Assign User', icon: Users },
    { value: 'create_task', label: 'Create Task', icon: CheckSquare },
    { value: 'update_status', label: 'Update Status', icon: RefreshCw },
    { value: 'send_email', label: 'Send Email', icon: Mail },
    { value: 'create_subtask', label: 'Create Subtask', icon: GitBranch },
    { value: 'update_budget', label: 'Update Budget', icon: DollarSign },
    { value: 'send_slack', label: 'Send to Slack', icon: Zap },
    { value: 'create_calendar_event', label: 'Create Calendar Event', icon: Calendar }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const automationData = {
      ...formData,
      trigger: {
        type: formData.triggerType,
        conditions: formData.triggerConditions
      },
      status: 'Draft' as const,
      runsCount: 0,
      successRate: 0,
      createdAt: new Date().toISOString(),
      createdBy: 'Current User'
    };

    addNotification({
      type: 'success',
      title: automation ? 'Automation Updated' : 'Automation Created',
      message: `Automation "${formData.name}" has been ${automation ? 'updated' : 'created'} successfully`,
      userId: '1',
      relatedEntity: {
        type: 'project',
        id: 'automation',
        name: formData.name
      }
    });

    onClose();
  };

  const addAction = () => {
    setFormData(prev => ({
      ...prev,
      actions: [...prev.actions, {
        type: 'send_notification',
        parameters: { message: '', recipients: 'assignee' }
      }]
    }));
  };

  const updateAction = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.map((action, i) => 
        i === index ? { ...action, [field]: value } : action
      )
    }));
  };

  const removeAction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {automation ? 'Edit Automation' : 'Create Automation'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Automation Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                placeholder="Enter automation name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              >
                <option value="General">General</option>
                <option value="Task Management">Task Management</option>
                <option value="Project Management">Project Management</option>
                <option value="Communication">Communication</option>
                <option value="Budget">Budget</option>
                <option value="Reporting">Reporting</option>
              </select>
            </div>
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
              placeholder="Describe what this automation does"
            />
          </div>

          {/* Trigger Configuration */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              Trigger Configuration
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Trigger Event
              </label>
              <select
                value={formData.triggerType}
                onChange={(e) => setFormData(prev => ({ ...prev, triggerType: e.target.value as any }))}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              >
                {triggerTypes.map(trigger => (
                  <option key={trigger.value} value={trigger.value}>{trigger.label}</option>
                ))}
              </select>
            </div>

            {/* Trigger-specific conditions */}
            {formData.triggerType === 'deadline_approaching' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notify Before (hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="168"
                    defaultValue="24"
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      triggerConditions: { ...prev.triggerConditions, hours: Number(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority Filter
                  </label>
                  <select
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      triggerConditions: { ...prev.triggerConditions, priority: e.target.value }
                    }))}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                  >
                    <option value="">All Priorities</option>
                    <option value="High">High Priority Only</option>
                    <option value="Medium">Medium Priority Only</option>
                    <option value="Low">Low Priority Only</option>
                  </select>
                </div>
              </div>
            )}

            {formData.triggerType === 'schedule' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Frequency
                  </label>
                  <select 
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      triggerConditions: { ...prev.triggerConditions, frequency: e.target.value }
                    }))}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    defaultValue="09:00"
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      triggerConditions: { ...prev.triggerConditions, time: e.target.value }
                    }))}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Day (for weekly)
                  </label>
                  <select 
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      triggerConditions: { ...prev.triggerConditions, day: e.target.value }
                    }))}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                  >
                    <option value="monday">Monday</option>
                    <option value="tuesday">Tuesday</option>
                    <option value="wednesday">Wednesday</option>
                    <option value="thursday">Thursday</option>
                    <option value="friday">Friday</option>
                  </select>
                </div>
              </div>
            )}

            {formData.triggerType === 'budget_exceeded' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Threshold Percentage
                </label>
                <input
                  type="number"
                  min="50"
                  max="150"
                  defaultValue="90"
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    triggerConditions: { ...prev.triggerConditions, threshold: Number(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                />
              </div>
            )}
          </div>

          {/* Actions Configuration */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Actions Configuration
              </h3>
              <button
                type="button"
                onClick={addAction}
                className="flex items-center space-x-1 px-3 py-1 text-sm text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Action</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.actions.map((action, index) => (
                <div key={index} className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Action {index + 1}
                    </span>
                    {formData.actions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAction(index)}
                        className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Action Type
                    </label>
                    <select
                      value={action.type}
                      onChange={(e) => updateAction(index, 'type', e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                    >
                      {actionTypes.map(actionType => (
                        <option key={actionType.value} value={actionType.value}>{actionType.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Action-specific parameters */}
                  {action.type === 'send_notification' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Notification Message
                        </label>
                        <textarea
                          value={action.parameters.message || ''}
                          onChange={(e) => updateAction(index, 'parameters', { 
                            ...action.parameters, 
                            message: e.target.value 
                          })}
                          rows={2}
                          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                          placeholder="Enter notification message"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Recipients
                        </label>
                        <select
                          value={action.parameters.recipients || 'assignee'}
                          onChange={(e) => updateAction(index, 'parameters', { 
                            ...action.parameters, 
                            recipients: e.target.value 
                          })}
                          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                        >
                          <option value="assignee">Task Assignee</option>
                          <option value="project_manager">Project Manager</option>
                          <option value="team">All Team Members</option>
                          <option value="stakeholders">Stakeholders</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {action.type === 'assign_user' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Assign To
                      </label>
                      <select
                        value={action.parameters.assignee || ''}
                        onChange={(e) => updateAction(index, 'parameters', { 
                          ...action.parameters, 
                          assignee: e.target.value 
                        })}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                      >
                        <option value="">Select User</option>
                        <option value="available_member">Available Team Member</option>
                        <option value="project_manager">Project Manager</option>
                        {users.map(user => (
                          <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {action.type === 'create_task' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Task Title Template
                        </label>
                        <input
                          type="text"
                          value={action.parameters.taskTitle || ''}
                          onChange={(e) => updateAction(index, 'parameters', { 
                            ...action.parameters, 
                            taskTitle: e.target.value 
                          })}
                          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                          placeholder="e.g., Follow up on {project_name}"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Priority
                          </label>
                          <select
                            value={action.parameters.priority || 'Medium'}
                            onChange={(e) => updateAction(index, 'parameters', { 
                              ...action.parameters, 
                              priority: e.target.value 
                            })}
                            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Due Date Offset (days)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="30"
                            defaultValue="7"
                            onChange={(e) => updateAction(index, 'parameters', { 
                              ...action.parameters, 
                              dueDateOffset: Number(e.target.value) 
                            })}
                            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {action.type === 'send_email' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email Template
                        </label>
                        <select
                          value={action.parameters.template || ''}
                          onChange={(e) => updateAction(index, 'parameters', { 
                            ...action.parameters, 
                            template: e.target.value 
                          })}
                          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                        >
                          <option value="">Select Template</option>
                          <option value="task_reminder">Task Reminder</option>
                          <option value="deadline_alert">Deadline Alert</option>
                          <option value="status_update">Status Update</option>
                          <option value="weekly_report">Weekly Report</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Recipients
                        </label>
                        <input
                          type="text"
                          value={action.parameters.recipients || ''}
                          onChange={(e) => updateAction(index, 'parameters', { 
                            ...action.parameters, 
                            recipients: e.target.value 
                          })}
                          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                          placeholder="Enter email addresses separated by commas"
                        />
                      </div>
                    </div>
                  )}

                  {action.type === 'update_status' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        New Status
                      </label>
                      <select
                        value={action.parameters.newStatus || ''}
                        onChange={(e) => updateAction(index, 'parameters', { 
                          ...action.parameters, 
                          newStatus: e.target.value 
                        })}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                      >
                        <option value="">Select Status</option>
                        <option value="Pending">Pending</option>
                        <option value="In progress">In Progress</option>
                        <option value="Complete">Complete</option>
                        <option value="Blocked">Blocked</option>
                      </select>
                    </div>
                  )}
                </div>
              ))}
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
            <div className="flex space-x-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                placeholder="Add a tag"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              {automation ? 'Update Automation' : 'Create Automation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Automations = () => {
  const { addNotification } = useNotification();
  const { tasks } = useTask();
  const { projects } = useProject();
  const [automations, setAutomations] = useState<Automation[]>([
    {
      id: '1',
      name: 'Auto-assign urgent tasks',
      description: 'Automatically assign high-priority tasks to available team members',
      trigger: {
        type: 'task_created',
        conditions: { priority: 'High' }
      },
      actions: [{
        type: 'assign_user',
        parameters: { role: 'available_member' }
      }],
      status: 'Active',
      runsCount: 24,
      successRate: 95,
      lastRun: '2024-12-10T14:30:00Z',
      nextRun: '2024-12-12T09:00:00Z',
      createdAt: '2024-11-15T09:00:00Z',
      createdBy: 'John Doe',
      category: 'Task Management',
      tags: ['urgent', 'assignment']
    },
    {
      id: '2',
      name: 'Deadline reminders',
      description: 'Send notifications 24 hours before task deadlines',
      trigger: {
        type: 'deadline_approaching',
        conditions: { hours: 24 }
      },
      actions: [{
        type: 'send_notification',
        parameters: { message: 'Task deadline approaching in 24 hours', recipients: 'assignee' }
      }],
      status: 'Active',
      runsCount: 156,
      successRate: 98,
      lastRun: '2024-12-11T09:00:00Z',
      nextRun: '2024-12-12T09:00:00Z',
      createdAt: '2024-10-20T10:00:00Z',
      createdBy: 'Sarah Chen',
      category: 'Communication',
      tags: ['deadlines', 'reminders']
    },
    {
      id: '3',
      name: 'Status update notifications',
      description: 'Notify project managers when tasks are completed',
      trigger: {
        type: 'task_completed'
      },
      actions: [{
        type: 'send_notification',
        parameters: { message: 'Task completed - project update required', recipients: 'project_manager' }
      }],
      status: 'Paused',
      runsCount: 89,
      successRate: 92,
      lastRun: '2024-12-09T16:45:00Z',
      createdAt: '2024-11-01T11:00:00Z',
      createdBy: 'Mike Johnson',
      category: 'Project Management',
      tags: ['status', 'updates']
    },
    {
      id: '4',
      name: 'Weekly progress reports',
      description: 'Generate and send weekly progress reports to stakeholders',
      trigger: {
        type: 'schedule',
        conditions: { frequency: 'weekly', day: 'monday', time: '09:00' }
      },
      actions: [{
        type: 'send_email',
        parameters: { template: 'weekly_report', recipients: 'stakeholders' }
      }],
      status: 'Active',
      runsCount: 12,
      successRate: 100,
      lastRun: '2024-12-09T09:00:00Z',
      nextRun: '2024-12-16T09:00:00Z',
      createdAt: '2024-09-15T08:00:00Z',
      createdBy: 'Emily Davis',
      category: 'Reporting',
      tags: ['reports', 'weekly']
    },
    {
      id: '5',
      name: 'Budget alert system',
      description: 'Alert when project budget exceeds 90% utilization',
      trigger: {
        type: 'budget_exceeded',
        conditions: { threshold: 90 }
      },
      actions: [{
        type: 'send_notification',
        parameters: { message: 'Project budget utilization exceeded 90%', recipients: 'project_manager' }
      }],
      status: 'Active',
      runsCount: 3,
      successRate: 100,
      lastRun: '2024-12-08T15:20:00Z',
      createdAt: '2024-11-20T14:00:00Z',
      createdBy: 'John Doe',
      category: 'Budget',
      tags: ['budget', 'alerts']
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const filteredAutomations = automations.filter(automation => {
    const matchesSearch = automation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         automation.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         automation.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || automation.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || automation.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = [...new Set(automations.map(a => a.category))];

  const toggleAutomationStatus = (id: string) => {
    setAutomations(prev => prev.map(automation => {
      if (automation.id === id) {
        const newStatus = automation.status === 'Active' ? 'Paused' : 'Active';
        
        addNotification({
          type: newStatus === 'Active' ? 'success' : 'warning',
          title: 'Automation Status Changed',
          message: `"${automation.name}" has been ${newStatus.toLowerCase()}`,
          userId: '1',
          relatedEntity: {
            type: 'project',
            id: automation.id,
            name: automation.name
          }
        });

        return { ...automation, status: newStatus as Automation['status'] };
      }
      return automation;
    }));
  };

  const duplicateAutomation = (automation: Automation) => {
    const newAutomation: Automation = {
      ...automation,
      id: Date.now().toString(),
      name: `${automation.name} (Copy)`,
      status: 'Draft',
      runsCount: 0,
      successRate: 0,
      lastRun: undefined,
      nextRun: undefined,
      createdAt: new Date().toISOString(),
      createdBy: 'Current User'
    };

    setAutomations(prev => [...prev, newAutomation]);
    
    addNotification({
      type: 'success',
      title: 'Automation Duplicated',
      message: `"${automation.name}" has been duplicated successfully`,
      userId: '1',
      relatedEntity: {
        type: 'project',
        id: newAutomation.id,
        name: newAutomation.name
      }
    });
  };

  const deleteAutomation = (id: string) => {
    const automation = automations.find(a => a.id === id);
    if (automation && window.confirm(`Are you sure you want to delete "${automation.name}"?`)) {
      setAutomations(prev => prev.filter(a => a.id !== id));
      
      addNotification({
        type: 'warning',
        title: 'Automation Deleted',
        message: `"${automation.name}" has been deleted`,
        userId: '1',
        relatedEntity: {
          type: 'project',
          id: automation.id,
          name: automation.name
        }
      });
    }
  };

  const runAutomationNow = (id: string) => {
    const automation = automations.find(a => a.id === id);
    if (automation) {
      setAutomations(prev => prev.map(a => 
        a.id === id 
          ? { 
              ...a, 
              runsCount: a.runsCount + 1,
              lastRun: new Date().toISOString()
            }
          : a
      ));

      addNotification({
        type: 'info',
        title: 'Automation Executed',
        message: `"${automation.name}" has been executed manually`,
        userId: '1',
        relatedEntity: {
          type: 'project',
          id: automation.id,
          name: automation.name
        }
      });
    }
  };

  const exportAutomations = () => {
    const dataStr = JSON.stringify(automations, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'automations-export.json';
    link.click();

    addNotification({
      type: 'success',
      title: 'Automations Exported',
      message: 'All automations have been exported successfully',
      userId: '1',
      relatedEntity: {
        type: 'project',
        id: 'export',
        name: 'Automation Export'
      }
    });
  };

  const handleNewAutomation = () => {
    setEditingAutomation(null);
    setShowModal(true);
  };

  const handleEditAutomation = (automation: Automation) => {
    setEditingAutomation(automation);
    setShowModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'Paused':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'Draft':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getTriggerIcon = (triggerType: string) => {
    switch (triggerType) {
      case 'task_created':
      case 'task_updated':
      case 'task_completed':
        return <CheckSquare className="h-4 w-4" />;
      case 'deadline_approaching':
        return <Clock className="h-4 w-4" />;
      case 'schedule':
        return <Calendar className="h-4 w-4" />;
      case 'budget_exceeded':
        return <DollarSign className="h-4 w-4" />;
      case 'user_assigned':
        return <Users className="h-4 w-4" />;
      case 'milestone_reached':
        return <Target className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600 dark:text-green-400';
    if (rate >= 85) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Automations</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Streamline your workflow with intelligent automation</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={exportAutomations}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button 
            onClick={handleNewAutomation}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Automation</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search automations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
            <option value="Draft">Draft</option>
          </select>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
          >
            <option value="All">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {automations.filter(a => a.status === 'Active').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Play className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Runs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {automations.reduce((sum, a) => sum + a.runsCount, 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(automations.reduce((sum, a) => sum + a.successRate, 0) / automations.length)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Time Saved</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {automations.reduce((sum, a) => sum + a.runsCount, 0) * 0.5}h
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Failed Runs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {automations.reduce((sum, a) => sum + Math.round(a.runsCount * (100 - a.successRate) / 100), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Automations List */}
      <div className="space-y-4">
        {filteredAutomations.map((automation) => (
          <div key={automation.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    {getTriggerIcon(automation.trigger.type)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{automation.name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(automation.status)}`}>
                        {automation.status}
                      </span>
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                        {automation.category}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{automation.description}</p>
                
                <div className="flex items-center space-x-6 text-sm mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500 dark:text-gray-400">Trigger:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {automation.trigger.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500 dark:text-gray-400">Actions:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {automation.actions.length} action(s)
                    </span>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{automation.runsCount}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Runs</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className={`text-lg font-bold ${getSuccessRateColor(automation.successRate)}`}>
                      {automation.successRate}%
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Success Rate</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {automation.lastRun ? format(new Date(automation.lastRun), 'MMM d') : 'Never'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Last Run</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {automation.nextRun ? format(new Date(automation.nextRun), 'MMM d') : 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Next Run</p>
                  </div>
                </div>

                {/* Tags */}
                {automation.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {automation.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>Created by: {automation.createdBy}</span>
                  <span>•</span>
                  <span>{format(new Date(automation.createdAt), 'MMM d, yyyy')}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => runAutomationNow(automation.id)}
                  disabled={automation.status !== 'Active'}
                  className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Run now"
                >
                  <Play className="h-4 w-4" />
                </button>
                <button
                  onClick={() => toggleAutomationStatus(automation.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    automation.status === 'Active'
                      ? 'text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
                      : 'text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'
                  }`}
                  title={automation.status === 'Active' ? 'Pause automation' : 'Start automation'}
                >
                  {automation.status === 'Active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
                <button 
                  onClick={() => handleEditAutomation(automation)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => duplicateAutomation(automation)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => deleteAutomation(automation.id)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAutomations.length === 0 && (
        <div className="text-center py-12">
          <Zap className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchTerm || statusFilter !== 'All' || categoryFilter !== 'All' ? 'No automations found' : 'No automations yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm || statusFilter !== 'All' || categoryFilter !== 'All'
              ? 'Try adjusting your search or filter criteria.' 
              : 'Create your first automation to streamline your workflow.'}
          </p>
          {(!searchTerm && statusFilter === 'All' && categoryFilter === 'All') && (
            <button 
              onClick={handleNewAutomation}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Automation
            </button>
          )}
        </div>
      )}

      <AutomationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        automation={editingAutomation || undefined}
      />
    </div>
  );
};

export default Automations;