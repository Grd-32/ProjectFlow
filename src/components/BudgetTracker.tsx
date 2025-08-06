import React, { useState } from 'react';
import { useProject } from '../contexts/ProjectContext';
import { useNotification } from '../contexts/NotificationContext';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Plus,
  Edit3,
  Trash2,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';

interface BudgetEntry {
  id: string;
  projectId: string;
  category: string;
  amount: number;
  type: 'expense' | 'income' | 'allocation';
  description: string;
  date: string;
  approvedBy?: string;
  status: 'pending' | 'approved' | 'rejected';
}

const BudgetTracker = () => {
  const { projects } = useProject();
  const { addNotification } = useNotification();
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [budgetEntries, setBudgetEntries] = useState<BudgetEntry[]>([
    {
      id: '1',
      projectId: '1',
      category: 'Development',
      amount: 15000,
      type: 'expense',
      description: 'Frontend development costs',
      date: '2024-12-01',
      approvedBy: 'John Doe',
      status: 'approved'
    },
    {
      id: '2',
      projectId: '1',
      category: 'Design',
      amount: 8500,
      type: 'expense',
      description: 'UI/UX design and prototyping',
      date: '2024-12-05',
      approvedBy: 'Sarah Chen',
      status: 'approved'
    },
    {
      id: '3',
      projectId: '2',
      category: 'Infrastructure',
      amount: 5000,
      type: 'expense',
      description: 'Cloud hosting and services',
      date: '2024-12-10',
      status: 'pending'
    }
  ]);

  const [showAddEntry, setShowAddEntry] = useState(false);
  const [newEntry, setNewEntry] = useState({
    projectId: '',
    category: '',
    amount: 0,
    type: 'expense' as BudgetEntry['type'],
    description: ''
  });

  const filteredProjects = selectedProject === 'all' 
    ? projects 
    : projects.filter(p => p.id === selectedProject);

  const filteredEntries = selectedProject === 'all'
    ? budgetEntries
    : budgetEntries.filter(e => e.projectId === selectedProject);

  const totalBudget = filteredProjects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = filteredProjects.reduce((sum, p) => sum + p.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const utilizationPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const handleAddEntry = () => {
    if (newEntry.projectId && newEntry.category && newEntry.amount > 0) {
      const entry: BudgetEntry = {
        ...newEntry,
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        status: 'pending'
      };
      
      setBudgetEntries(prev => [entry, ...prev]);
      
      addNotification({
        type: 'info',
        title: 'Budget Entry Added',
        message: `New ${entry.type} of $${entry.amount.toLocaleString()} added for ${entry.category}`,
        userId: '1',
        relatedEntity: {
          type: 'budget',
          id: entry.id,
          name: entry.description
        }
      });

      setNewEntry({
        projectId: '',
        category: '',
        amount: 0,
        type: 'expense',
        description: ''
      });
      setShowAddEntry(false);
    }
  };

  const approveEntry = (entryId: string) => {
    setBudgetEntries(prev => prev.map(entry => 
      entry.id === entryId 
        ? { ...entry, status: 'approved' as const, approvedBy: 'John Doe' }
        : entry
    ));
    
    const entry = budgetEntries.find(e => e.id === entryId);
    if (entry) {
      addNotification({
        type: 'success',
        title: 'Budget Entry Approved',
        message: `${entry.type} of $${entry.amount.toLocaleString()} has been approved`,
        userId: '1',
        relatedEntity: {
          type: 'budget',
          id: entry.id,
          name: entry.description
        }
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default:
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
    }
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage > 90) return 'text-red-600 dark:text-red-400';
    if (percentage > 75) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  return (
    <div className="space-y-6">
      {/* Budget Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Budget Overview</h2>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
          >
            <option value="all">All Projects</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Budget</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${totalBudget.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${totalSpent.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Remaining</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${totalRemaining.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Utilization</p>
                <p className={`text-2xl font-bold ${getUtilizationColor(utilizationPercentage)}`}>
                  {utilizationPercentage.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Budget Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Budget Utilization</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ${totalSpent.toLocaleString()} / ${totalBudget.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                utilizationPercentage > 90 ? 'bg-red-500' :
                utilizationPercentage > 75 ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Budget Entries */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Budget Entries</h3>
            <button
              onClick={() => setShowAddEntry(true)}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Entry</span>
            </button>
          </div>
        </div>

        {/* Add Entry Form */}
        {showAddEntry && (
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <select
                value={newEntry.projectId}
                onChange={(e) => setNewEntry(prev => ({ ...prev, projectId: e.target.value }))}
                className="px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              >
                <option value="">Select Project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
              
              <input
                type="text"
                placeholder="Category"
                value={newEntry.category}
                onChange={(e) => setNewEntry(prev => ({ ...prev, category: e.target.value }))}
                className="px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              />
              
              <input
                type="number"
                placeholder="Amount"
                value={newEntry.amount || ''}
                onChange={(e) => setNewEntry(prev => ({ ...prev, amount: Number(e.target.value) }))}
                className="px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              />
              
              <select
                value={newEntry.type}
                onChange={(e) => setNewEntry(prev => ({ ...prev, type: e.target.value as BudgetEntry['type'] }))}
                className="px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
                <option value="allocation">Allocation</option>
              </select>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleAddEntry}
                  className="flex-1 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAddEntry(false)}
                  className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
            
            <input
              type="text"
              placeholder="Description"
              value={newEntry.description}
              onChange={(e) => setNewEntry(prev => ({ ...prev, description: e.target.value }))}
              className="w-full mt-4 px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>
        )}

        {/* Entries List */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900 dark:text-white">Project</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900 dark:text-white">Category</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900 dark:text-white">Type</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900 dark:text-white">Amount</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900 dark:text-white">Date</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry, index) => {
                const project = projects.find(p => p.id === entry.projectId);
                return (
                  <tr 
                    key={entry.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 transition-colors ${
                      index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'
                    }`}
                  >
                    <td className="py-4 px-6">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {project?.name || 'Unknown Project'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{entry.category}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        entry.type === 'expense' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                        entry.type === 'income' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                        'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                      }`}>
                        {entry.type}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        ${entry.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(entry.date), 'MMM d, yyyy')}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(entry.status)}`}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        {entry.status === 'pending' && (
                          <button
                            onClick={() => approveEntry(entry.id)}
                            className="p-1 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition-colors"
                            title="Approve"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                        )}
                        <button className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BudgetTracker;