import React, { useState } from 'react';
import { useNotification } from '../contexts/NotificationContext';
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
  CheckSquare
} from 'lucide-react';

interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'task_created' | 'task_updated' | 'task_completed' | 'project_created' | 'deadline_approaching' | 'schedule';
    conditions?: any;
  };
  actions: {
    type: 'assign_user' | 'send_notification' | 'create_task' | 'update_status' | 'send_email';
    parameters: any;
  }[];
  status: 'Active' | 'Paused' | 'Draft';
  runsCount: number;
  lastRun?: string;
  createdAt: string;
  createdBy: string;
}

interface AutomationModalProps {
  isOpen: boolean;
  onClose: () => void;
  automation?: Automation;
}

const AutomationModal: React.FC<AutomationModalProps> = ({ isOpen, onClose, automation }) => {
  const { addNotification } = useNotification();
  const [formData, setFormData] = useState({
    name: automation?.name || '',
    description: automation?.description || '',
    triggerType: automation?.trigger.type || 'task_created',
    actionType: 'send_notification',
    actionParameters: {
      message: '',
      assignee: '',
      priority: 'Medium'
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {automation ? 'Edit Automation' : 'Create Automation'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            ×
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
                Trigger Event
              </label>
              <select
                value={formData.triggerType}
                onChange={(e) => setFormData(prev => ({ ...prev, triggerType: e.target.value as any }))}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              >
                <option value="task_created">Task Created</option>
                <option value="task_updated">Task Updated</option>
                <option value="task_completed">Task Completed</option>
                <option value="project_created">Project Created</option>
                <option value="deadline_approaching">Deadline Approaching</option>
                <option value="schedule">Scheduled</option>
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
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              Trigger Configuration
            </h3>
            
            {formData.triggerType === 'deadline_approaching' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notify Before (hours)
                </label>
                <input
                  type="number"
                  min="1"
                  max="168"
                  defaultValue="24"
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                />
              </div>
            )}

            {formData.triggerType === 'schedule' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Frequency
                  </label>
                  <select className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    defaultValue="09:00"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Configuration */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Action Configuration
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Action Type
              </label>
              <select
                value={formData.actionType}
                onChange={(e) => setFormData(prev => ({ ...prev, actionType: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              >
                <option value="send_notification">Send Notification</option>
                <option value="assign_user">Assign User</option>
                <option value="create_task">Create Task</option>
                <option value="update_status">Update Status</option>
                <option value="send_email">Send Email</option>
              </select>
            </div>

            {formData.actionType === 'send_notification' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notification Message
                </label>
                <textarea
                  value={formData.actionParameters.message}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    actionParameters: { ...prev.actionParameters, message: e.target.value }
                  }))}
                  rows={2}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                  placeholder="Enter notification message"
                />
              </div>
            )}

            {formData.actionType === 'assign_user' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assign To
                </label>
                <input
                  type="text"
                  value={formData.actionParameters.assignee}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    actionParameters: { ...prev.actionParameters, assignee: e.target.value }
                  }))}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                  placeholder="Enter user name or role"
                />
              </div>
            )}

            {formData.actionType === 'create_task' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Task Title Template
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                    placeholder="e.g., Follow up on {project_name}"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.actionParameters.priority}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      actionParameters: { ...prev.actionParameters, priority: e.target.value }
                    }))}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
            )}
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
      lastRun: '2024-12-10T14:30:00Z',
      createdAt: '2024-11-15T09:00:00Z',
      createdBy: 'John Doe'
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
        parameters: { message: 'Task deadline approaching in 24 hours' }
      }],
      status: 'Active',
      runsCount: 156,
      lastRun: '2024-12-11T09:00:00Z',
      createdAt: '2024-10-20T10:00:00Z',
      createdBy: 'Sarah Chen'
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
        parameters: { message: 'Task completed - project update required' }
      }],
      status: 'Paused',
      runsCount: 89,
      lastRun: '2024-12-09T16:45:00Z',
      createdAt: '2024-11-01T11:00:00Z',
      createdBy: 'Mike Johnson'
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
      lastRun: '2024-12-09T09:00:00Z',
      createdAt: '2024-09-15T08:00:00Z',
      createdBy: 'Emily Davis'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filteredAutomations = automations.filter(automation => {
    const matchesSearch = automation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         automation.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || automation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleAutomationStatus = (id: string) => {
    setAutomations(prev => prev.map(automation => 
      automation.id === id 
        ? { 
            ...automation, 
            status: automation.status === 'Active' ? 'Paused' : 'Active' as Automation['status']
          }
        : automation
    ));

    const automation = automations.find(a => a.id === id);
    if (automation) {
      addNotification({
        type: 'info',
        title: 'Automation Status Changed',
        message: `"${automation.name}" has been ${automation.status === 'Active' ? 'paused' : 'activated'}`,
        userId: '1',
        relatedEntity: {
          type: 'project',
          id: automation.id,
          name: automation.name
        }
      });
    }
  };

  const duplicateAutomation = (automation: Automation) => {
    const newAutomation: Automation = {
      ...automation,
      id: Date.now().toString(),
      name: `${automation.name} (Copy)`,
      status: 'Draft',
      runsCount: 0,
      lastRun: undefined,
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
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Automations</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Streamline your workflow with automated processes</p>
        </div>
        <button 
          onClick={handleNewAutomation}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Automation</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search automations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
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
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Automations</p>
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
              <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Time Saved</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">24h</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Response Time</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">2.3s</p>
            </div>
          </div>
        </div>
      </div>

      {/* Automations List */}
      <div className="space-y-4">
        {filteredAutomations.map((automation) => (
          <div key={automation.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    {getTriggerIcon(automation.trigger.type)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{automation.name}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(automation.status)}`}>
                      {automation.status}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{automation.description}</p>
                
                <div className="flex items-center space-x-4 text-sm mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500 dark:text-gray-400">Trigger:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {automation.trigger.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500 dark:text-gray-400">Action:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {automation.actions[0]?.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                  <span>Runs: {automation.runsCount}</span>
                  {automation.lastRun && (
                    <span>Last run: {new Date(automation.lastRun).toLocaleDateString()}</span>
                  )}
                  <span>Created by: {automation.createdBy}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
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
            {searchTerm || statusFilter !== 'All' ? 'No automations found' : 'No automations yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm || statusFilter !== 'All' 
              ? 'Try adjusting your search or filter criteria.' 
              : 'Create your first automation to streamline your workflow.'}
          </p>
          {(!searchTerm && statusFilter === 'All') && (
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