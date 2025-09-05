import React, { useState } from 'react';
import { useTask } from '../contexts/TaskContext';
import { useUser } from '../contexts/UserContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useTimeTracking } from '../contexts/TimeTrackingContext';
import TaskTable from '../components/TaskTable';
import TaskModal from '../components/TaskModal';
import KanbanBoard from '../components/KanbanBoard';
import TimeTracker from '../components/TimeTracker';
import WorkloadView from '../components/WorkloadView';
import RecurringTaskModal from '../components/RecurringTaskModal';
import { Plus, Search, Filter, List, Columns, Clock, BarChart3 } from 'lucide-react';

const Tasks = () => {
  const { hasPermission } = useUser();
  const { tasks } = useTask();
  const { currentWorkspace } = useWorkspace();
  const { activeTimers } = useTimeTracking();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'time' | 'workload'>('list');
  const [showRecurringModal, setShowRecurringModal] = useState(false);

  const handleNewTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (taskId: string) => {
    setEditingTask(taskId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const workspaceFilteredTasks = currentWorkspace 
    ? tasks.filter(task => currentWorkspace.projects.includes(task.projectId))
    : tasks;

  const filteredTasks = workspaceFilteredTasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.project.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Tasks</h1>
            {activeTimers.length > 0 && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">{activeTimers.length} timer(s) running</span>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage your team's work and track progress</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                viewMode === 'kanban' 
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Columns className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('time')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                viewMode === 'time' 
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Clock className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('workload')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                viewMode === 'workload' 
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
            </button>
          </div>
          
          {hasPermission('create') && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowRecurringModal(true)}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              >
                <Clock className="h-4 w-4" />
                <span>Recurring</span>
              </button>
              <button
                onClick={handleNewTask}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>New Task</span>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Filters */}
      {viewMode !== 'kanban' && viewMode !== 'workload' && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search tasks..."
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
              <option value="Pending">Pending</option>
              <option value="In progress">In Progress</option>
              <option value="Complete">Complete</option>
              <option value="Blocked">Blocked</option>
            </select>
            
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
            >
              <option value="All">All Priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>
      )}
      
      {/* Content based on view mode */}
      {viewMode === 'list' && (
        <TaskTable onEditTask={handleEditTask} filteredTasks={filteredTasks} />
      )}
      {viewMode === 'kanban' && (
        <KanbanBoard filteredTasks={filteredTasks} />
      )}
      {viewMode === 'time' && (
        <div className="flex-1 overflow-auto p-6">
          <TimeTracker />
        </div>
      )}
      {viewMode === 'workload' && (
        <div className="flex-1 overflow-auto p-6">
          <WorkloadView />
        </div>
      )}
      
      {isModalOpen && (
        <TaskModal
          taskId={editingTask}
          onClose={handleCloseModal}
        />
      )}

      {showRecurringModal && (
        <RecurringTaskModal
          isOpen={showRecurringModal}
          onClose={() => setShowRecurringModal(false)}
        />
      )}
    </div>
  );
};

export default Tasks;