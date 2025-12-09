import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { useNotification } from '../contexts/NotificationContext';
import { useTenant } from '../contexts/TenantContext';
import {
  Zap,
  Plus,
  Play,
  Pause,
  Edit3,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Activity,
  Loader
} from 'lucide-react';
import { automationService, Automation } from '../services/automationService';
import AutomationModal from '../components/AutomationModal';

const Automations = () => {
  const { hasPermission } = useUser();
  const { addNotification } = useNotification();
  const { currentTenant } = useTenant();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentTenant) {
      loadAutomations();
    }
  }, [currentTenant]);

  const loadAutomations = async () => {
    try {
      setIsLoading(true);
      const data = await automationService.getAll(currentTenant!.id);
      setAutomations(data);
    } catch (error) {
      console.error('Failed to load automations:', error);
      addNotification({
        type: 'error',
        title: 'Loading Failed',
        message: 'Failed to load automations',
        userId: '1'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingAutomation(null);
    setShowModal(true);
  };

  const handleEdit = (automation: Automation) => {
    setEditingAutomation(automation);
    setShowModal(true);
  };

  const handleSave = async (formData: any) => {
    try {
      setIsSaving(true);

      if (editingAutomation) {
        await automationService.update(editingAutomation.id, {
          ...formData,
          tenant_id: currentTenant!.id
        });
        addNotification({
          type: 'success',
          title: 'Updated',
          message: `"${formData.name}" has been updated`,
          userId: '1'
        });
      } else {
        await automationService.create({
          ...formData,
          tenant_id: currentTenant!.id,
          created_by: '1'
        });
        addNotification({
          type: 'success',
          title: 'Created',
          message: `"${formData.name}" has been created`,
          userId: '1'
        });
      }

      await loadAutomations();
      setShowModal(false);
      setEditingAutomation(null);
    } catch (error) {
      console.error('Save failed:', error);
      addNotification({
        type: 'error',
        title: 'Save Failed',
        message: editingAutomation ? 'Failed to update automation' : 'Failed to create automation',
        userId: '1'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const automation = automations.find(a => a.id === id);
      if (!automation) return;

      const newState = !automation.is_active;
      await automationService.toggle(id, newState);

      addNotification({
        type: 'info',
        title: newState ? 'Enabled' : 'Disabled',
        message: `"${automation.name}" has been ${newState ? 'enabled' : 'disabled'}`,
        userId: '1'
      });

      await loadAutomations();
    } catch (error) {
      console.error('Toggle failed:', error);
      addNotification({
        type: 'error',
        title: 'Action Failed',
        message: 'Failed to toggle automation',
        userId: '1'
      });
    }
  };

  const handleRun = async (id: string) => {
    try {
      const automation = automations.find(a => a.id === id);
      if (!automation) return;

      await automationService.executeAutomation(id);

      addNotification({
        type: 'success',
        title: 'Executed',
        message: `"${automation.name}" has been executed successfully`,
        userId: '1'
      });

      await loadAutomations();
    } catch (error) {
      console.error('Execute failed:', error);
      addNotification({
        type: 'error',
        title: 'Execution Failed',
        message: 'Failed to execute automation',
        userId: '1'
      });
    }
  };

  const handleDelete = async (id: string) => {
    const automation = automations.find(a => a.id === id);
    if (!automation) return;

    if (!window.confirm(`Delete automation "${automation.name}"?`)) return;

    try {
      await automationService.delete(id);

      addNotification({
        type: 'warning',
        title: 'Deleted',
        message: `"${automation.name}" has been deleted`,
        userId: '1'
      });

      await loadAutomations();
    } catch (error) {
      console.error('Delete failed:', error);
      addNotification({
        type: 'error',
        title: 'Deletion Failed',
        message: 'Failed to delete automation',
        userId: '1'
      });
    }
  };

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'task_status_change': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'project_deadline': return <Activity className="h-4 w-4 text-orange-500" />;
      case 'budget_threshold': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'time_based': return <Activity className="h-4 w-4 text-gray-500" />;
      default: return <Zap className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'send_notification': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'create_task': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'send_email': return <Activity className="h-4 w-4 text-blue-500" />;
      case 'slack_message': return <Activity className="h-4 w-4 text-gray-500" />;
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
            onClick={handleCreateNew}
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
                  {automations.filter(a => a.is_active).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-900/30 rounded-lg">
                <Activity className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Runs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {automations.reduce((sum, a) => sum + (a.run_count || 0), 0)}
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
                    ? Math.round((automations.reduce((sum, a) => sum + (a.success_count || 0), 0) /
                      automations.reduce((sum, a) => sum + (a.run_count || 1), 0)) * 100)
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

          {isLoading ? (
            <div className="p-12 text-center">
              <Loader className="h-8 w-8 text-gray-400 mx-auto animate-spin mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Loading automations...</p>
            </div>
          ) : automations.length === 0 ? (
            <div className="p-12 text-center">
              <Zap className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No automations yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Create your first automation to streamline your workflow.
              </p>
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Automation
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {automations.map((automation) => (
                <div key={automation.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{automation.name}</h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          automation.is_active
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                        }`}>
                          {automation.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">{automation.description}</p>

                      <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-2">
                          {getTriggerIcon(automation.trigger_type)}
                          <span>Trigger: {automation.trigger_type.replace(/_/g, ' ')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getActionIcon(automation.action_type)}
                          <span>Action: {automation.action_type.replace(/_/g, ' ')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Activity className="h-4 w-4" />
                          <span>Runs: {automation.run_count || 0}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4" />
                          <span>Success: {automation.run_count ? Math.round(((automation.success_count || 0) / automation.run_count) * 100) : 0}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleRun(automation.id)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="Run now"
                      >
                        <Play className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggle(automation.id)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title={automation.is_active ? 'Disable' : 'Enable'}
                      >
                        {automation.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleEdit(automation)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(automation.id)}
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
          )}
        </div>
      </div>

      <AutomationModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingAutomation(null);
        }}
        onSave={handleSave}
        initialData={editingAutomation}
        isLoading={isSaving}
      />
    </div>
  );
};

export default Automations;
