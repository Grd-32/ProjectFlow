import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  duration: number; // in minutes
  description: string;
  billable: boolean;
  hourlyRate?: number;
  status: 'running' | 'stopped' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Timer {
  id: string;
  taskId: string;
  userId: string;
  startTime: string;
  description: string;
  isRunning: boolean;
}

interface TimeTrackingContextType {
  timeEntries: TimeEntry[];
  activeTimers: Timer[];
  startTimer: (taskId: string, description: string) => void;
  stopTimer: (timerId: string) => void;
  addManualEntry: (entry: Omit<TimeEntry, 'id' | 'createdAt' | 'status'>) => void;
  updateTimeEntry: (id: string, updates: Partial<TimeEntry>) => void;
  deleteTimeEntry: (id: string) => void;
  getTaskTotalTime: (taskId: string) => number;
  getUserTotalTime: (userId: string, startDate?: string, endDate?: string) => number;
}

const TimeTrackingContext = createContext<TimeTrackingContextType | undefined>(undefined);

export const useTimeTracking = () => {
  const context = useContext(TimeTrackingContext);
  if (context === undefined) {
    throw new Error('useTimeTracking must be used within a TimeTrackingProvider');
  }
  return context;
};

export const TimeTrackingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([
    {
      id: '1',
      taskId: '1',
      userId: '2',
      startTime: '2024-12-11T09:00:00Z',
      endTime: '2024-12-11T11:30:00Z',
      duration: 150,
      description: 'Working on hero section design',
      billable: true,
      hourlyRate: 75,
      status: 'approved',
      createdAt: '2024-12-11T09:00:00Z'
    },
    {
      id: '2',
      taskId: '2',
      userId: '3',
      startTime: '2024-12-11T14:00:00Z',
      endTime: '2024-12-11T16:45:00Z',
      duration: 165,
      description: 'Implementing authentication flow',
      billable: true,
      hourlyRate: 85,
      status: 'approved',
      createdAt: '2024-12-11T14:00:00Z'
    }
  ]);

  const [activeTimers, setActiveTimers] = useState<Timer[]>([]);

  const startTimer = (taskId: string, description: string) => {
    const newTimer: Timer = {
      id: Date.now().toString(),
      taskId,
      userId: '1', // Current user
      startTime: new Date().toISOString(),
      description,
      isRunning: true
    };
    setActiveTimers(prev => [...prev, newTimer]);
  };

  const stopTimer = (timerId: string) => {
    const timer = activeTimers.find(t => t.id === timerId);
    if (timer) {
      const endTime = new Date().toISOString();
      const duration = Math.round((new Date(endTime).getTime() - new Date(timer.startTime).getTime()) / 60000);
      
      const timeEntry: TimeEntry = {
        id: Date.now().toString(),
        taskId: timer.taskId,
        userId: timer.userId,
        startTime: timer.startTime,
        endTime,
        duration,
        description: timer.description,
        billable: true,
        status: 'stopped',
        createdAt: new Date().toISOString()
      };

      setTimeEntries(prev => [...prev, timeEntry]);
      setActiveTimers(prev => prev.filter(t => t.id !== timerId));
    }
  };

  const addManualEntry = (entryData: Omit<TimeEntry, 'id' | 'createdAt' | 'status'>) => {
    const newEntry: TimeEntry = {
      ...entryData,
      id: Date.now().toString(),
      status: 'stopped',
      createdAt: new Date().toISOString()
    };
    setTimeEntries(prev => [...prev, newEntry]);
  };

  const updateTimeEntry = (id: string, updates: Partial<TimeEntry>) => {
    setTimeEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, ...updates } : entry
    ));
  };

  const deleteTimeEntry = (id: string) => {
    setTimeEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const getTaskTotalTime = (taskId: string) => {
    return timeEntries
      .filter(entry => entry.taskId === taskId)
      .reduce((total, entry) => total + entry.duration, 0);
  };

  const getUserTotalTime = (userId: string, startDate?: string, endDate?: string) => {
    return timeEntries
      .filter(entry => {
        if (entry.userId !== userId) return false;
        if (startDate && entry.startTime < startDate) return false;
        if (endDate && entry.startTime > endDate) return false;
        return true;
      })
      .reduce((total, entry) => total + entry.duration, 0);
  };

  return (
    <TimeTrackingContext.Provider value={{
      timeEntries,
      activeTimers,
      startTimer,
      stopTimer,
      addManualEntry,
      updateTimeEntry,
      deleteTimeEntry,
      getTaskTotalTime,
      getUserTotalTime
    }}>
      {children}
    </TimeTrackingContext.Provider>
  );
};