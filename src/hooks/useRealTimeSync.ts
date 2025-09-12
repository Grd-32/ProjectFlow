import { useEffect, useCallback } from 'react';
import { useTask } from '../contexts/TaskContext';
import { useProject } from '../contexts/ProjectContext';
import { useUser } from '../contexts/UserContext';
import { useNotification } from '../contexts/NotificationContext';
import { useSettings } from '../contexts/SettingsContext';

// Custom hook for real-time synchronization between modules
export const useRealTimeSync = () => {
  const { tasks, updateTask } = useTask();
  const { projects, updateProject } = useProject();
  const { users } = useUser();
  const { addNotification } = useNotification();
  const { settings } = useSettings();

  // Sync project progress when tasks change
  const syncProjectProgress = useCallback(() => {
    projects.forEach(project => {
      const projectTasks = tasks.filter(task => task.projectId === project.id);
      if (projectTasks.length > 0) {
        const completedTasks = projectTasks.filter(task => task.status === 'Complete').length;
        const newProgress = Math.round((completedTasks / projectTasks.length) * 100);
        
        if (newProgress !== project.progress) {
          updateProject(project.id, { progress: newProgress });
          
          // Send notification if project is completed
          if (newProgress === 100 && project.progress < 100) {
            addNotification({
              type: 'success',
              title: 'Project Completed! 🎉',
              message: `Project "${project.name}" has been completed`,
              userId: project.manager.id,
              relatedEntity: {
                type: 'project',
                id: project.id,
                name: project.name
              },
              actionUrl: '/projects'
            });
          }
        }
      }
    });
  }, [tasks, projects, updateProject, addNotification]);

  // Sync budget utilization
  const syncBudgetAlerts = useCallback(() => {
    projects.forEach(project => {
      const utilization = project.budget > 0 ? (project.spent / project.budget) * 100 : 0;
      
      if (utilization > 90 && settings.notifications.types.budgetAlerts) {
        addNotification({
          type: 'warning',
          title: 'Budget Alert',
          message: `Project "${project.name}" is ${utilization.toFixed(1)}% over budget`,
          userId: project.manager.id,
          relatedEntity: {
            type: 'project',
            id: project.id,
            name: project.name
          },
          actionUrl: '/projects'
        });
      }
    });
  }, [projects, settings.notifications.types.budgetAlerts, addNotification]);

  // Sync deadline reminders
  const syncDeadlineReminders = useCallback(() => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    tasks.forEach(task => {
      const dueDate = new Date(task.dueDate);
      
      if (task.status !== 'Complete' && 
          dueDate <= tomorrow && 
          dueDate > now && 
          settings.notifications.types.deadlines) {
        addNotification({
          type: 'warning',
          title: 'Deadline Reminder',
          message: `Task "${task.name}" is due tomorrow`,
          userId: task.assignee.id,
          relatedEntity: {
            type: 'task',
            id: task.id,
            name: task.name
          },
          actionUrl: '/tasks'
        });
      }
    });
  }, [tasks, settings.notifications.types.deadlines, addNotification]);

  // Auto-sync effects
  useEffect(() => {
    syncProjectProgress();
  }, [tasks, syncProjectProgress]);

  useEffect(() => {
    syncBudgetAlerts();
  }, [projects, syncBudgetAlerts]);

  useEffect(() => {
    // Check deadlines every hour
    const interval = setInterval(syncDeadlineReminders, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [syncDeadlineReminders]);

  return {
    syncProjectProgress,
    syncBudgetAlerts,
    syncDeadlineReminders
  };
};