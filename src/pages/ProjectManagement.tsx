import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import MilestoneTracker from '../components/MilestoneTracker';
import RiskManagement from '../components/RiskManagement';
import ResourceManagement from '../components/ResourceManagement';
import BudgetTracker from '../components/BudgetTracker';
import WorkflowBuilder from '../components/WorkflowBuilder';
import { 
  Target, 
  AlertTriangle, 
  Users, 
  DollarSign,
  Workflow,
  Settings
} from 'lucide-react';

const ProjectManagement = () => {
  const { hasPermission } = useUser();
  const [activeTab, setActiveTab] = useState<'milestones' | 'risks' | 'resources' | 'budget' | 'workflows'>('milestones');

  const tabs = [
    { 
      id: 'milestones' as const, 
      label: 'Milestones', 
      icon: Target,
      permission: 'read'
    },
    { 
      id: 'risks' as const, 
      label: 'Risk Management', 
      icon: AlertTriangle,
      permission: 'read'
    },
    { 
      id: 'resources' as const, 
      label: 'Resources', 
      icon: Users,
      permission: 'read'
    },
    { 
      id: 'budget' as const, 
      label: 'Budget Tracking', 
      icon: DollarSign,
      permission: 'view_analytics'
    },
    { 
      id: 'workflows' as const, 
      label: 'Workflows', 
      icon: Workflow,
      permission: 'create'
    }
  ];

  const availableTabs = tabs.filter(tab => hasPermission(tab.permission as any));

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Project Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Comprehensive project planning and execution tools</p>
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex space-x-8">
          {availableTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
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

      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'milestones' && <MilestoneTracker />}
        {activeTab === 'risks' && <RiskManagement />}
        {activeTab === 'resources' && <ResourceManagement />}
        {activeTab === 'budget' && hasPermission('view_analytics') && <BudgetTracker />}
        {activeTab === 'workflows' && hasPermission('create') && <WorkflowBuilder />}
      </div>
    </div>
  );
};

export default ProjectManagement;