import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface AutomationFormData {
  name: string;
  description: string;
  trigger_type: 'task_status_change' | 'project_deadline' | 'budget_threshold' | 'time_based' | 'user_action';
  trigger_config: any;
  action_type: 'send_notification' | 'create_task' | 'update_status' | 'send_email' | 'slack_message';
  action_config: any;
  is_active: boolean;
}

interface AutomationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AutomationFormData) => void;
  initialData?: any;
  isLoading?: boolean;
}

const AutomationModal: React.FC<AutomationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<AutomationFormData>({
    name: '',
    description: '',
    trigger_type: 'task_status_change',
    trigger_config: {},
    action_type: 'send_notification',
    action_config: {},
    is_active: true
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        trigger_type: initialData.trigger_type || 'task_status_change',
        trigger_config: initialData.trigger_config || {},
        action_type: initialData.action_type || 'send_notification',
        action_config: initialData.action_config || {},
        is_active: initialData.is_active !== undefined ? initialData.is_active : true
      });
    } else {
      setFormData({
        name: '',
        description: '',
        trigger_type: 'task_status_change',
        trigger_config: {},
        action_type: 'send_notification',
        action_config: {},
        is_active: true
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {initialData ? 'Edit Automation' : 'Create Automation'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                placeholder="e.g., Task Completion Alert"
              />
            </div>
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span>Active</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              placeholder="Describe what this automation does"
              rows={3}
            />
          </div>

          <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white">Trigger</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Trigger Type
              </label>
              <select
                value={formData.trigger_type}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  trigger_type: e.target.value as any,
                  trigger_config: {}
                }))}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              >
                <option value="task_status_change">Task Status Change</option>
                <option value="project_deadline">Project Deadline</option>
                <option value="budget_threshold">Budget Threshold</option>
                <option value="time_based">Time Based</option>
                <option value="user_action">User Action</option>
              </select>
            </div>

            {formData.trigger_type === 'task_status_change' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Task Status
                </label>
                <select
                  value={formData.trigger_config.status || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    trigger_config: { ...prev.trigger_config, status: e.target.value }
                  }))}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                >
                  <option value="">Select status</option>
                  <option value="Pending">Pending</option>
                  <option value="In progress">In Progress</option>
                  <option value="Complete">Complete</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>
            )}

            {formData.trigger_type === 'budget_threshold' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Threshold (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.trigger_config.threshold || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    trigger_config: { ...prev.trigger_config, threshold: parseInt(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  placeholder="80"
                />
              </div>
            )}
          </div>

          <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white">Action</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Action Type
              </label>
              <select
                value={formData.action_type}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  action_type: e.target.value as any,
                  action_config: {}
                }))}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              >
                <option value="send_notification">Send Notification</option>
                <option value="send_email">Send Email</option>
                <option value="slack_message">Slack Message</option>
                <option value="create_task">Create Task</option>
                <option value="update_status">Update Status</option>
              </select>
            </div>

            {formData.action_type === 'send_notification' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <input
                  type="text"
                  value={formData.action_config.message || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    action_config: { ...prev.action_config, message: e.target.value }
                  }))}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  placeholder="Enter notification message"
                />
              </div>
            )}

            {formData.action_type === 'send_email' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={formData.action_config.subject || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    action_config: { ...prev.action_config, subject: e.target.value }
                  }))}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  placeholder="Enter email subject"
                />
              </div>
            )}

            {formData.action_type === 'slack_message' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Slack Channel
                </label>
                <input
                  type="text"
                  value={formData.action_config.channel || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    action_config: { ...prev.action_config, channel: e.target.value }
                  }))}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  placeholder="#general"
                />
              </div>
            )}
          </div>

          <div className="flex space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.name}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Saving...' : initialData ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AutomationModal;
