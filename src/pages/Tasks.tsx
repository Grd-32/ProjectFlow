import React, { useState } from 'react';
import { useTask } from '../contexts/TaskContext';
import { useUser } from '../contexts/UserContext';
import TaskTable from '../components/TaskTable';
import TaskModal from '../components/TaskModal';
import { Plus, Search, Filter } from 'lucide-react';

const Tasks = () => {
  const { hasPermission } = useUser();
  const { tasks } = useTask();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

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

  const filteredTasks = tasks.filter(task => {
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
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Tasks</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage your team's work and track progress</p>
        </div>
        {hasPermission('create') && (
          <button
            onClick={handleNewTask}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Task</span>
          </button>
        )}
      </div>
      
      {/* Filters */}
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
      
      <TaskTable onEditTask={handleEditTask} filteredTasks={filteredTasks} />
      
      {isModalOpen && (
        <TaskModal
          taskId={editingTask}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Tasks;