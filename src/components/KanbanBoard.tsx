import React, { useState } from 'react';
import { useTask } from '../contexts/TaskContext';
import { useNotification } from '../contexts/NotificationContext';
import { 
  Plus, 
  MoreHorizontal, 
  Calendar, 
  User, 
  MessageSquare, 
  Paperclip,
  Clock,
  Flag
} from 'lucide-react';
import { format } from 'date-fns';

interface KanbanColumn {
  id: string;
  title: string;
  status: string;
  color: string;
  limit?: number;
}

interface KanbanBoardProps {
  filteredTasks?: any[];
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ filteredTasks }) => {
  const { tasks, updateTask } = useTask();
  const { addNotification } = useNotification();
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  const displayTasks = filteredTasks || tasks;

  const columns: KanbanColumn[] = [
    { id: 'pending', title: 'To Do', status: 'Pending', color: 'bg-gray-100 dark:bg-gray-700', limit: 10 },
    { id: 'progress', title: 'In Progress', status: 'In progress', color: 'bg-blue-100 dark:bg-blue-900/30', limit: 5 },
    { id: 'review', title: 'Review', status: 'Review', color: 'bg-yellow-100 dark:bg-yellow-900/30', limit: 3 },
    { id: 'complete', title: 'Done', status: 'Complete', color: 'bg-green-100 dark:bg-green-900/30' }
  ];

  const getTasksByStatus = (status: string) => {
    return displayTasks.filter(task => task.status === status);
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTask(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    
    if (draggedTask) {
      const task = tasks.find(t => t.id === draggedTask);
      if (task && task.status !== newStatus) {
        updateTask(draggedTask, { status: newStatus as any });
        
        addNotification({
          type: 'info',
          title: 'Task Status Updated',
          message: `"${task.name}" moved to ${newStatus}`,
          userId: '1',
          relatedEntity: {
            type: 'task',
            id: task.id,
            name: task.name
          }
        });
      }
    }
    
    setDraggedTask(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'border-l-red-500';
      case 'Medium':
        return 'border-l-yellow-500';
      case 'Low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-300';
    }
  };

  return (
    <div className="h-full p-6 overflow-x-auto">
      <div className="flex space-x-6 min-w-max">
        {columns.map((column) => {
          const columnTasks = getTasksByStatus(column.status);
          const isOverLimit = column.limit && columnTasks.length > column.limit;
          
          return (
            <div
              key={column.id}
              className="w-80 flex-shrink-0"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.status)}
            >
              <div className={`${column.color} rounded-lg p-4 mb-4`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {column.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      isOverLimit 
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' 
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}>
                      {columnTasks.length}{column.limit ? `/${column.limit}` : ''}
                    </span>
                    <button className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    className={`bg-white dark:bg-gray-800 rounded-lg border-l-4 ${getPriorityColor(task.priority)} p-4 shadow-sm hover:shadow-md transition-shadow cursor-move`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm leading-tight">
                        {task.name}
                      </h4>
                      <button className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-3 w-3" />
                      </button>
                    </div>

                    {task.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">{task.assignee.initials}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-400 dark:text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span className="text-xs">
                            {format(new Date(task.dueDate), 'MMM d')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        {task.comments.length > 0 && (
                          <div className="flex items-center space-x-1 text-gray-400 dark:text-gray-500">
                            <MessageSquare className="h-3 w-3" />
                            <span className="text-xs">{task.comments.length}</span>
                          </div>
                        )}
                        {task.attachments.length > 0 && (
                          <div className="flex items-center space-x-1 text-gray-400 dark:text-gray-500">
                            <Paperclip className="h-3 w-3" />
                            <span className="text-xs">{task.attachments.length}</span>
                          </div>
                        )}
                        <Flag className={`h-3 w-3 ${
                          task.priority === 'High' ? 'text-red-500' :
                          task.priority === 'Medium' ? 'text-yellow-500' :
                          'text-green-500'
                        }`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KanbanBoard;