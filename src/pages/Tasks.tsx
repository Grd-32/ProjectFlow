import React, { useState } from 'react';
import { useTask } from '../contexts/TaskContext';
import { useUser } from '../contexts/UserContext';
import TaskTable from '../components/TaskTable';
import TaskModal from '../components/TaskModal';
import { Plus } from 'lucide-react';

const Tasks = () => {
  const { hasPermission } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<string | null>(null);

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
      
      <TaskTable onEditTask={handleEditTask} />
      
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