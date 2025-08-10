import React, { useState } from 'react';
import { useTask } from '../contexts/TaskContext';
import { useNotification } from '../contexts/NotificationContext';
import { X, Repeat, Calendar, Clock, Target } from 'lucide-react';

interface RecurringTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId?: string;
}

const RecurringTaskModal: React.FC<RecurringTaskModalProps> = ({ isOpen, onClose, taskId }) => {
  const { addTask } = useTask();
  const { addNotification } = useNotification();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 'Medium' as const,
    assignee: '',
    project: '',
    estimatedHours: 0,
    recurrence: {
      type: 'daily' as 'daily' | 'weekly' | 'monthly' | 'yearly',
      interval: 1,
      daysOfWeek: [] as number[],
      dayOfMonth: 1,
      endDate: '',
      maxOccurrences: 0
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const generateRecurringTasks = () => {
      const tasks = [];
      const startDate = new Date();
      let currentDate = new Date(startDate);
      let occurrenceCount = 0;
      const maxOccurrences = formData.recurrence.maxOccurrences || 52; // Default to 1 year
      const endDate = formData.recurrence.endDate ? new Date(formData.recurrence.endDate) : null;

      while (occurrenceCount < maxOccurrences && (!endDate || currentDate <= endDate)) {
        const taskData = {
          name: `${formData.name} (${format(currentDate, 'MMM d, yyyy')})`,
          description: formData.description,
          status: 'Pending' as const,
          priority: formData.priority,
          assignee: {
            name: formData.assignee,
            avatar: '',
            initials: formData.assignee.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
          },
          dueDate: currentDate.toISOString().split('T')[0],
          project: formData.project,
          tags: ['recurring'],
          estimatedHours: formData.estimatedHours,
          dependencies: [],
          subtasks: [],
          comments: [],
          attachments: []
        };

        tasks.push(taskData);
        occurrenceCount++;

        // Calculate next occurrence
        switch (formData.recurrence.type) {
          case 'daily':
            currentDate.setDate(currentDate.getDate() + formData.recurrence.interval);
            break;
          case 'weekly':
            currentDate.setDate(currentDate.getDate() + (7 * formData.recurrence.interval));
            break;
          case 'monthly':
            currentDate.setMonth(currentDate.getMonth() + formData.recurrence.interval);
            break;
          case 'yearly':
            currentDate.setFullYear(currentDate.getFullYear() + formData.recurrence.interval);
            break;
        }
      }

      return tasks;
    };

    const recurringTasks = generateRecurringTasks();
    
    // Add first few tasks immediately
    recurringTasks.slice(0, 5).forEach(taskData => {
      addTask(taskData);
    });

    addNotification({
      type: 'success',
      title: 'Recurring Tasks Created',
      message: `Created ${recurringTasks.length} recurring tasks for "${formData.name}"`,
      userId: '1',
      relatedEntity: {
        type: 'task',
        id: 'recurring',
        name: formData.name
      }
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <Repeat className="h-5 w-5 mr-2" />
            Create Recurring Task
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

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
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Assignee
              </label>
              <input
                type="text"
                value={formData.assignee}
                onChange={(e) => setFormData(prev => ({ ...prev, assignee: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                placeholder="Enter assignee name"
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

          {/* Recurrence Settings */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Repeat className="h-4 w-4 mr-2" />
              Recurrence Settings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Repeat Every
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={formData.recurrence.interval}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      recurrence: { ...prev.recurrence, interval: Number(e.target.value) }
                    }))}
                    className="w-20 px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  />
                  <select
                    value={formData.recurrence.type}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      recurrence: { ...prev.recurrence, type: e.target.value as any }
                    }))}
                    className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  >
                    <option value="daily">Day(s)</option>
                    <option value="weekly">Week(s)</option>
                    <option value="monthly">Month(s)</option>
                    <option value="yearly">Year(s)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.recurrence.endDate}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    recurrence: { ...prev.recurrence, endDate: e.target.value }
                  }))}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Maximum Occurrences
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={formData.recurrence.maxOccurrences || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  recurrence: { ...prev.recurrence, maxOccurrences: Number(e.target.value) }
                }))}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                placeholder="Leave empty for no limit"
              />
            </div>

            {formData.recurrence.type === 'weekly' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Days of Week
                </label>
                <div className="flex space-x-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        const newDays = formData.recurrence.daysOfWeek.includes(index)
                          ? formData.recurrence.daysOfWeek.filter(d => d !== index)
                          : [...formData.recurrence.daysOfWeek, index];
                        setFormData(prev => ({
                          ...prev,
                          recurrence: { ...prev.recurrence, daysOfWeek: newDays }
                        }));
                      }}
                      className={`px-3 py-2 text-xs rounded-lg transition-colors ${
                        formData.recurrence.daysOfWeek.includes(index)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {formData.recurrence.type === 'monthly' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Day of Month
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.recurrence.dayOfMonth}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    recurrence: { ...prev.recurrence, dayOfMonth: Number(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                />
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
              Create Recurring Tasks
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecurringTaskModal;