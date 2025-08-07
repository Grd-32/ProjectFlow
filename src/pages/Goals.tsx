import React, { useState } from 'react';
import { useTask } from '../contexts/TaskContext';
import { Plus, Target, Calendar, TrendingUp } from 'lucide-react';
import { Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import GoalModal from '../components/GoalModal';

const Goals = () => {
  const { goals } = useTask();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const handleNewGoal = () => {
    setEditingGoal(null);
    setIsModalOpen(true);
  };

  const handleEditGoal = (goalId: string) => {
    setEditingGoal(goalId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGoal(null);
  };

  const filteredGoals = goals.filter(goal => {
    const matchesSearch = goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         goal.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || goal.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || goal.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = [...new Set(goals.map(goal => goal.category))];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'Completed':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'Paused':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Goals</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track your objectives and key results</p>
        </div>
        <button
          onClick={handleNewGoal}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search goals..."
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
            <option value="Completed">Completed</option>
            <option value="Paused">Paused</option>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGoals.map((goal) => (
          <div
            key={goal.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleEditGoal(goal.id)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{goal.title}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(goal.status)}`}>
                    {goal.status}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{goal.description}</p>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {goal.category === 'Growth' 
                      ? `${goal.progress.toLocaleString()} / ${goal.target.toLocaleString()}`
                      : `${Math.round((goal.progress / goal.target) * 100)}%`
                    }
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min((goal.progress / goal.target) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span>Due {format(new Date(goal.dueDate), 'MMM d, yyyy')}</span>
                </div>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                  {goal.category}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <GoalModal
          goalId={editingGoal}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Goals;