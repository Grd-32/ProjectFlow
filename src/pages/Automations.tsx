import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useNotification } from '../contexts/NotificationContext';
import { useSettings } from '../contexts/SettingsContext';
import { 
  Zap, 
  Plus, 
  Play, 
  Pause, 
  Edit3, 
  Trash2, 
  Clock,
  Target,
  Mail,
  MessageSquare,
  FileText,
  Users,
  Calendar,
  BarChart3,
  Settings as SettingsIcon,
  CheckCircle,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';

interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'task_status_change' | 'project_deadline' | 'budget_threshold' | 'time_based' | 'user_action';
    config: any;
  };
  actions: Array<{
    type: 'send_notification' | 'create_task' | 'update_status' | 'send_email' | 'slack_message';
    config: any;
  }>;
  isActive: boolean;
  runCount: number;
  successCount: number;
  lastRun?: string;
  createdBy: string;
  createdAt: string;
}

const Automations = () => {
  const { hasPermission } = useUser();
  const { addNotification } = useNotification();
  const { integrations } = useSettings();
  const [automations, setAutomations] = useState<Automation[]>([
    {
      id: '1',
      name: 'Task Completion Notification',
      description: 'Send Slack notification when high-priority tasks are completed',
      trigger: {
        type: 'task_status_change',
        config: { status: 'Complete', priority: 'High' }
      },
      actions: [
        {
          type: 'slack_message',
          config: { 
            channel: '#general', 
            message: 'High priority task completed: {{task.name}}' 
          }
        }
      ],
      isActive: true,
      runCount: 15,
      successCount: 14,
      lastRun: '2024-12-11T14:30:00Z',
      createdBy: 'John Doe',
      createdAt: '2024-11-01T09:00:00Z'
    },
    {
      id: '2',
      name: 'Budget Alert Automation',
      description: 'Alert project managers when budget utilization exceeds 80%',
      trigger: {
        type: 'budget_threshold',
        config: { threshold: 80 }
      },
      actions: [
        {
          type: 'send_notification',
          config: { 
            title: 'Budget Alert',
            message: 'Project {{project.name}} has exceeded 80% budget utilization'
          }
        },
        {
          type: 'send_email',
          config: {
            to: '{{project.manager.email}}',
            subject: 'Budget Alert: {{project.name}}'
          }
        }
      ],
      isActive: true,
      runCount: 3,
      successCount: 3,
      lastRun: '2024-12-10T16:45:00Z',
      createdBy: 'Sarah Chen',
      createdAt: '2024-11-15T10:00:00Z'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<string | null>(null);

  const toggleAutomation = (id: string) => {
    setAutomations(prev => prev.map(automation => 
      automation.id === id 
        ? { ...automation, isActive: !automation.isActive }
        : automation
    ));

    const automation = automations.find(a => a.id === id);
    if (automation) {
      addNotification({
        type: 'info',
        title: `Automation ${automation.isActive ? 'Disabled' : 'Enabled'}`,
        message: `"${automation.name}" has been ${automation.isActive ? 'disabled' : 'enabled'}`,
        userId: '1',
        relatedEntity: {
          type: 'project',
          id: 'automation',
          name: automation.name
        }
      });
    }
  };

  const runAutomation = (id: string) => {
    const automation = automations.find(a => a.id === id);
    if (automation) {
      // Simulate running automation
      setAutomations(prev => prev.map(a => 
        a.id === id 
          ? { 
              ...a, 
              runCount: a.runCount + 1,
              successCount: a.successCount + 1,
              lastRun: new Date().toISOString()
            }
          : a
      ));

      addNotification({
        type: 'success',
        title: 'Automation Executed',
        message: `"${automation.name}" has been executed successfully`,
        userId: '1',
        relatedEntity: {
          type: 'project',
          id: 'automation',
          name: automation.name
        }
      });
    }
  };

  const deleteAutomation = (id: string) => {
    const automation = automations.find(a => a.id === id);
    if (automation && window.confirm(`Delete automation "${automation.name}"?`)) {
      setAutomations(prev => prev.filter(a => a.id !== id));
      
      addNotification({
        type: 'warning',
        title: 'Automation Deleted',
        message: `"${automation.name}" has been deleted`,
        userId: '1',
        relatedEntity: {
          type: 'project',
          id: 'automation',
          name: automation.name
        }
      });
    }
  };

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'task_status_change': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'project_deadline': return <Calendar className="h-4 w-4 text-orange-500" />;
      case 'budget_threshold': return <BarChart3 className="h-4 w-4 text-red-500" />;
      case 'time_based': return <Clock className="h-4 w-4 text-purple-500" />;
      default: return <Zap className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'send_notification': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'create_task': return <Target className="h-4 w-4 text-green-500" />;
      case 'send_email': return <Mail className="h-4 w-4 text-blue-500" />;
      case 'slack_message': return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  if (!hasPermission('create')) {
    return (
      <div className="p-6 text-center">
        <Zap className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Access Denied</h3>
        <p className="text-gray-500 dark:text-gray-400">You don't have permission to manage automations.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Automations</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Automate repetitive tasks and workflows</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Automation</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Automations</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{automations.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Play className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {automations.filter(a => a.isActive).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Runs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {automations.reduce((sum, a) => sum + a.runCount, 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <CheckCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {automations.length > 0 
                    ? Math.round((automations.reduce((sum, a) => sum + a.successCount, 0) / 
                        automations.reduce((sum, a) => sum + a.runCount, 0)) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Automations List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Automations</h2>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {automations.map((automation) => (
              <div key={automation.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{automation.name}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        automation.isActive 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                      }`}>
                        {automation.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{automation.description}</p>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-2">
                        {getTriggerIcon(automation.trigger.type)}
                        <span>Trigger: {automation.trigger.type.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getActionIcon(automation.actions[0]?.type)}
                        <span>{automation.actions.length} action(s)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4" />
                        <span>Runs: {automation.runCount}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>Success: {Math.round((automation.successCount / automation.runCount) * 100)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => runAutomation(automation.id)}
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="Run now"
                    >
                      <Play className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleAutomation(automation.id)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title={automation.isActive ? 'Disable' : 'Enable'}
                    >
                      {automation.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => {
                        setEditingAutomation(automation.id);
                        setShowModal(true);
                      }}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteAutomation(automation.id)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {automations.length === 0 && (
          <div className="text-center py-12">
            <Zap className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No automations yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Create your first automation to streamline your workflow.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Automation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Automations;