import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  userId: string;
  relatedEntity?: {
    type: 'task' | 'project' | 'goal' | 'user' | 'budget';
    id: string;
    name: string;
  };
  actionUrl?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'info',
      title: 'Task Assigned',
      message: 'You have been assigned to "Design new landing page hero section"',
      timestamp: new Date().toISOString(),
      read: false,
      userId: '1',
      relatedEntity: {
        type: 'task',
        id: '1',
        name: 'Design new landing page hero section'
      },
      actionUrl: '/tasks'
    },
    {
      id: '2',
      type: 'warning',
      title: 'Budget Alert',
      message: 'Website Redesign project is 85% over budget',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: false,
      userId: '1',
      relatedEntity: {
        type: 'project',
        id: '1',
        name: 'Website Redesign'
      },
      actionUrl: '/projects'
    },
    {
      id: '3',
      type: 'success',
      title: 'Goal Completed',
      message: 'Launch Product V2 goal has been completed successfully',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      read: true,
      userId: '1',
      relatedEntity: {
        type: 'goal',
        id: '1',
        name: 'Launch Product V2'
      },
      actionUrl: '/goals'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAllNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};