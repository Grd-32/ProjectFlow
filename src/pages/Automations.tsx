import React, { useState } from 'react';
import { Zap, Plus, Play, Pause, Settings, ArrowRight } from 'lucide-react';

interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: string;
  action: string;
  status: 'Active' | 'Paused';
  runsCount: number;
  lastRun?: string;
}

const Automations = () => {
  const [automations] = useState<Automation[]>([
    {
      id: '1',
      name: 'Auto-assign urgent tasks',
      description: 'Automatically assign high-priority tasks to available team members',
      trigger: 'Task created with High priority',
      action: 'Assign to next available team member',
      status: 'Active',
      runsCount: 24,
      lastRun: '2024-12-10T14:30:00Z'
    },
    {
      id: '2',
      name: 'Deadline reminders',
      description: 'Send notifications 24 hours before task deadlines',
      trigger: 'Task due in 24 hours',
      action: 'Send notification to assignee',
      status: 'Active',
      runsCount: 156,
      lastRun: '2024-12-11T09:00:00Z'
    },
    {
      id: '3',
      name: 'Status update notifications',
      description: 'Notify project managers when tasks are completed',
      trigger: 'Task status changed to Complete',
      action: 'Send notification to project manager',
      status: 'Paused',
      runsCount: 89,
      lastRun: '2024-12-09T16:45:00Z'
    },
    {
      id: '4',
      name: 'Weekly progress reports',
      description: 'Generate and send weekly progress reports to stakeholders',
      trigger: 'Every Monday at 9:00 AM',
      action: 'Generate and email progress report',
      status: 'Active',
      runsCount: 12,
      lastRun: '2024-12-09T09:00:00Z'
    }
  ]);

  const toggleAutomationStatus = (id: string) => {
    // In a real app, this would update the automation status
    console.log('Toggle automation status for:', id);
  };

  const getStatusColor = (status: string) => {
    return status === 'Active' 
      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Automations</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Streamline your workflow with automated processes</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
          <Plus className="h-4 w-4" />
          <span>New Automation</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
      </div>

      {/* Automations List */}
      <div className="space-y-4">
        {automations.map((automation) => (
          <div key={automation.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{automation.name}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(automation.status)}`}>
                    {automation.status}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{automation.description}</p>
                
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500 dark:text-gray-400">Trigger:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{automation.trigger}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500 dark:text-gray-400">Action:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{automation.action}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6 mt-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>Runs: {automation.runsCount}</span>
                  {automation.lastRun && (
                    <span>Last run: {new Date(automation.lastRun).toLocaleDateString()}</span>
                  )}
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
                <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <Settings className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {automations.length === 0 && (
        <div className="text-center py-12">
          <Zap className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No automations yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Create your first automation to streamline your workflow.
          </p>
          <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            Create Automation
          </button>
        </div>
      )}
    </div>
  );
};

export default Automations;