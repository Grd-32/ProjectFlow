import React, { useState } from 'react';
import { useProject } from '../contexts/ProjectContext';
import { useTask } from '../contexts/TaskContext';
import { Calendar, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';

interface GanttItem {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  type: 'project' | 'task';
  dependencies?: string[];
  assignee?: string;
  status: string;
}

const GanttChart = () => {
  const { projects } = useProject();
  const { tasks } = useTask();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'quarter' | 'year'>('month');

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Combine projects and tasks into Gantt items
  const ganttItems: GanttItem[] = [
    ...projects.map(project => ({
      id: project.id,
      name: project.name,
      startDate: project.startDate,
      endDate: project.endDate,
      progress: project.progress,
      type: 'project' as const,
      status: project.status,
      assignee: project.manager.name
    })),
    ...tasks.map(task => ({
      id: task.id,
      name: task.name,
      startDate: task.dueDate,
      endDate: task.dueDate,
      progress: task.status === 'Complete' ? 100 : task.status === 'In progress' ? 50 : 0,
      type: 'task' as const,
      status: task.status,
      assignee: task.assignee.name
    }))
  ];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  const getItemPosition = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const monthStartTime = monthStart.getTime();
    const monthEndTime = monthEnd.getTime();
    
    const itemStart = Math.max(start.getTime(), monthStartTime);
    const itemEnd = Math.min(end.getTime(), monthEndTime);
    
    const totalDays = days.length;
    const startDay = Math.floor((itemStart - monthStartTime) / (24 * 60 * 60 * 1000));
    const duration = Math.ceil((itemEnd - itemStart) / (24 * 60 * 60 * 1000)) + 1;
    
    const left = (startDay / totalDays) * 100;
    const width = (duration / totalDays) * 100;
    
    return { left: `${left}%`, width: `${Math.max(width, 2)}%` };
  };

  const getStatusColor = (type: string, status: string) => {
    if (type === 'project') {
      switch (status) {
        case 'Active': return 'bg-green-500';
        case 'Planning': return 'bg-blue-500';
        case 'On Hold': return 'bg-yellow-500';
        case 'Completed': return 'bg-purple-500';
        default: return 'bg-gray-500';
      }
    } else {
      switch (status) {
        case 'Complete': return 'bg-green-500';
        case 'In progress': return 'bg-purple-500';
        case 'Blocked': return 'bg-red-500';
        default: return 'bg-yellow-500';
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Gantt Chart</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Project timeline and task dependencies</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  viewMode === 'month' 
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('quarter')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  viewMode === 'quarter' 
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Quarter
              </button>
              <button
                onClick={() => setViewMode('year')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  viewMode === 'year' 
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Year
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[120px] text-center">
                {format(currentDate, 'MMMM yyyy')}
              </span>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="overflow-x-auto">
        {/* Timeline Header */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <div className="w-80 p-4 bg-gray-50 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600">
            <span className="text-sm font-medium text-gray-900 dark:text-white">Task / Project</span>
          </div>
          <div className="flex-1 min-w-[800px]">
            <div className="grid grid-cols-31 gap-0 h-12">
              {days.map((day, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center border-r border-gray-200 dark:border-gray-600 text-xs text-gray-600 dark:text-gray-400"
                >
                  {format(day, 'd')}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gantt Items */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {ganttItems.map((item) => (
            <div key={item.id} className="flex hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="w-80 p-4 border-r border-gray-200 dark:border-gray-600">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(item.type, item.status)}`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.type === 'project' ? 'Project' : 'Task'} • {item.assignee}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-[800px] relative p-2">
                <div className="relative h-8">
                  <div
                    className={`absolute top-1 h-6 ${getStatusColor(item.type, item.status)} rounded-sm opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
                    style={getItemPosition(item.startDate, item.endDate)}
                    title={`${item.name} (${item.progress}%)`}
                  >
                    <div className="h-full flex items-center px-2">
                      <span className="text-xs text-white font-medium truncate">
                        {item.progress}%
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div 
                      className="absolute bottom-0 left-0 h-1 bg-white bg-opacity-30 rounded-sm"
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center space-x-6 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
            <span className="text-gray-600 dark:text-gray-400">Active/Complete</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
            <span className="text-gray-600 dark:text-gray-400">Planning</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-sm"></div>
            <span className="text-gray-600 dark:text-gray-400">In Progress</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
            <span className="text-gray-600 dark:text-gray-400">On Hold/Pending</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
            <span className="text-gray-600 dark:text-gray-400">Blocked</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;