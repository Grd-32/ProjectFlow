import React, { useState, useEffect } from 'react';
import { useTimeTracking } from '../contexts/TimeTrackingContext';
import { useTask } from '../contexts/TaskContext';
import { useNotification } from '../contexts/NotificationContext';
import { 
  Play, 
  Pause, 
  Square, 
  Clock, 
  Plus,
  Edit3,
  Trash2,
  DollarSign,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';

interface TimeTrackerProps {
  taskId?: string;
  compact?: boolean;
}

const TimeTracker: React.FC<TimeTrackerProps> = ({ taskId, compact = false }) => {
  const { 
    timeEntries, 
    activeTimers, 
    startTimer, 
    stopTimer, 
    addManualEntry,
    getTaskTotalTime 
  } = useTimeTracking();
  const { tasks } = useTask();
  const { addNotification } = useNotification();
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualEntry, setManualEntry] = useState({
    taskId: taskId || '',
    description: '',
    duration: 0,
    billable: true,
    hourlyRate: 75
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeTimer = taskId ? activeTimers.find(t => t.taskId === taskId) : null;
  const taskTotalTime = taskId ? getTaskTotalTime(taskId) : 0;
  const task = taskId ? tasks.find(t => t.id === taskId) : null;

  const handleStartTimer = () => {
    if (taskId && task) {
      startTimer(taskId, `Working on ${task.name}`);
      addNotification({
        type: 'info',
        title: 'Timer Started',
        message: `Started tracking time for "${task.name}"`,
        userId: '1',
        relatedEntity: {
          type: 'task',
          id: taskId,
          name: task.name
        }
      });
    }
  };

  const handleStopTimer = () => {
    if (activeTimer) {
      stopTimer(activeTimer.id);
      addNotification({
        type: 'success',
        title: 'Timer Stopped',
        message: `Time logged for "${task?.name}"`,
        userId: '1',
        relatedEntity: {
          type: 'task',
          id: taskId!,
          name: task?.name || 'Task'
        }
      });
    }
  };

  const handleManualEntry = () => {
    if (manualEntry.taskId && manualEntry.duration > 0) {
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + manualEntry.duration * 60000);
      
      addManualEntry({
        taskId: manualEntry.taskId,
        userId: '1',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: manualEntry.duration,
        description: manualEntry.description,
        billable: manualEntry.billable,
        hourlyRate: manualEntry.hourlyRate
      });

      addNotification({
        type: 'info',
        title: 'Time Entry Added',
        message: `${manualEntry.duration} minutes logged manually`,
        userId: '1',
        relatedEntity: {
          type: 'task',
          id: manualEntry.taskId,
          name: task?.name || 'Task'
        }
      });

      setManualEntry({
        taskId: taskId || '',
        description: '',
        duration: 0,
        billable: true,
        hourlyRate: 75
      });
      setShowManualEntry(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getElapsedTime = () => {
    if (!activeTimer) return '0h 0m';
    const elapsed = Math.floor((currentTime.getTime() - new Date(activeTimer.startTime).getTime()) / 60000);
    return formatDuration(elapsed);
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
          <Clock className="h-4 w-4" />
          <span>{formatDuration(taskTotalTime)}</span>
        </div>
        {activeTimer ? (
          <button
            onClick={handleStopTimer}
            className="flex items-center space-x-1 px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
          >
            <Square className="h-3 w-3" />
            <span>{getElapsedTime()}</span>
          </button>
        ) : (
          <button
            onClick={handleStartTimer}
            className="flex items-center space-x-1 px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
          >
            <Play className="h-3 w-3" />
            <span>Start</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Time Tracking</h3>
        <button
          onClick={() => setShowManualEntry(true)}
          className="flex items-center space-x-2 px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Manual Entry</span>
        </button>
      </div>

      {/* Active Timer */}
      {activeTimer && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-900 dark:text-green-100">Timer Running</p>
              <p className="text-lg font-bold text-green-700 dark:text-green-300">{getElapsedTime()}</p>
              <p className="text-sm text-green-600 dark:text-green-400">{activeTimer.description}</p>
            </div>
            <button
              onClick={handleStopTimer}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Square className="h-4 w-4" />
              <span>Stop</span>
            </button>
          </div>
        </div>
      )}

      {/* Manual Entry Form */}
      {showManualEntry && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Add Manual Time Entry</h4>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  value={manualEntry.duration || ''}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, duration: Number(e.target.value) }))}
                  className="w-full px-2 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Hourly Rate ($)
                </label>
                <input
                  type="number"
                  min="0"
                  value={manualEntry.hourlyRate || ''}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, hourlyRate: Number(e.target.value) }))}
                  className="w-full px-2 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <input
                type="text"
                value={manualEntry.description}
                onChange={(e) => setManualEntry(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-2 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded"
                placeholder="What did you work on?"
              />
            </div>
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={manualEntry.billable}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, billable: e.target.checked }))}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <span>Billable</span>
              </label>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleManualEntry}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Add Entry
              </button>
              <button
                onClick={() => setShowManualEntry(false)}
                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Time Entries */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Recent Entries</h4>
        {timeEntries
          .filter(entry => !taskId || entry.taskId === taskId)
          .slice(0, 5)
          .map((entry) => {
            const entryTask = tasks.find(t => t.id === entry.taskId);
            return (
              <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {entryTask?.name || 'Unknown Task'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{entry.description}</p>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {formatDuration(entry.duration)}
                    </span>
                    {entry.billable && entry.hourlyRate && (
                      <span className="text-xs text-green-600 dark:text-green-400 flex items-center">
                        <DollarSign className="h-3 w-3 mr-1" />
                        ${((entry.duration / 60) * entry.hourlyRate).toFixed(2)}
                      </span>
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(entry.startTime), 'MMM d, HH:mm')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded">
                    <Edit3 className="h-3 w-3" />
                  </button>
                  <button className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default TimeTracker;