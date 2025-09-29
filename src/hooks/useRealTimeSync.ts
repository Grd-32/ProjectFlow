import { useEffect, useCallback, useRef } from 'react';
import { useTask } from '../contexts/TaskContext';
import { useProject } from '../contexts/ProjectContext';
import { useUser } from '../contexts/UserContext';
import { useNotification } from '../contexts/NotificationContext';
import { useSettings } from '../contexts/SettingsContext';
import { useTenant } from '../contexts/TenantContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { SyncService, AnalyticsService, IntegrationOrchestrator } from '../utils/integrationServices';

// Enhanced real-time synchronization with multi-tenant support
export const useRealTimeSync = () => {
  const { tasks, updateTask } = useTask();
  const { projects, updateProject } = useProject();
  const { users, currentUser } = useUser();
  const { addNotification } = useNotification();
  const { settings } = useSettings();
  const { currentTenant, checkUsageLimits } = useTenant();
  const { currentWorkspace, updateWorkspace } = useWorkspace();
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize real-time sync connection
  useEffect(() => {
    if (currentTenant && currentUser) {
      SyncService.initializeRealTimeSync(currentTenant.id, currentUser.id);
    }

    return () => {
      SyncService.disconnect();
    };
  }, [currentTenant, currentUser]);

  // Sync project progress when tasks change
  const syncProjectProgress = useCallback(async () => {
    const projectUpdates = new Map<string, number>();

    projects.forEach(project => {
      const projectTasks = tasks.filter(task => task.projectId === project.id);
      if (projectTasks.length > 0) {
        const completedTasks = projectTasks.filter(task => task.status === 'Complete').length;
        const newProgress = Math.round((completedTasks / projectTasks.length) * 100);
        
        if (newProgress !== project.progress) {
          projectUpdates.set(project.id, newProgress);
          updateProject(project.id, { progress: newProgress });
          
          // Track analytics
          if (currentTenant) {
            AnalyticsService.trackEvent('project_progress_updated', {
              projectId: project.id,
              oldProgress: project.progress,
              newProgress,
              tasksCompleted: completedTasks,
              totalTasks: projectTasks.length
            }, currentTenant.id);
          }
          
          // Send notifications for major milestones
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

            // Notify all team members
            project.team.forEach(member => {
              if (member.id !== project.manager.id) {
                addNotification({
                  type: 'success',
                  title: 'Project Completed! 🎉',
                  message: `Project "${project.name}" has been completed`,
                  userId: member.id,
                  relatedEntity: {
                    type: 'project',
                    id: project.id,
                    name: project.name
                  },
                  actionUrl: '/projects'
                });
              }
            });

            // Send to external integrations
            if (settings.integrations.slack.enabled && settings.integrations.slack.webhookUrl) {
              IntegrationOrchestrator.executeAction({
                type: 'slack_message',
                config: {
                  message: `🎉 Project "${project.name}" has been completed! Great work team!`,
                  channel: settings.integrations.slack.channel
                }
              }, { integrations: [{ type: 'slack', config: settings.integrations.slack }] });
            }
          }
        }
      }
    });

    // Update workspace analytics
    if (currentWorkspace && projectUpdates.size > 0) {
      const workspaceProjects = projects.filter(p => currentWorkspace.projects.includes(p.id));
      const totalTasks = tasks.filter(t => currentWorkspace.projects.includes(t.projectId)).length;
      const completedTasks = tasks.filter(t => 
        currentWorkspace.projects.includes(t.projectId) && t.status === 'Complete'
      ).length;
      
      const analytics = {
        totalTasks,
        completedTasks,
        activeProjects: workspaceProjects.filter(p => p.status === 'Active').length,
        teamProductivity: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        lastCalculated: new Date().toISOString()
      };

      updateWorkspace(currentWorkspace.id, { analytics });
    }
  }, [tasks, projects, updateProject, addNotification, currentTenant, currentWorkspace, settings]);

  // Sync budget utilization and alerts
  const syncBudgetAlerts = useCallback(async () => {
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

        // Track budget alert
        if (currentTenant) {
          AnalyticsService.trackEvent('budget_alert', {
            projectId: project.id,
            utilization,
            budget: project.budget,
            spent: project.spent
          }, currentTenant.id);
        }
      }
    });
  }, [projects, settings.notifications.types.budgetAlerts, addNotification, currentTenant]);

  // Sync deadline reminders
  const syncDeadlineReminders = useCallback(async () => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    tasks.forEach(task => {
      const dueDate = new Date(task.dueDate);
      
      // Tomorrow deadline
      if (task.status !== 'Complete' && 
          dueDate <= tomorrow && 
          dueDate > now && 
          settings.notifications.types.deadlines) {
        addNotification({
          type: 'warning',
          title: 'Deadline Tomorrow',
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

      // Next week deadline
      if (task.status !== 'Complete' && 
          dueDate <= nextWeek && 
          dueDate > tomorrow && 
          settings.notifications.types.deadlines) {
        addNotification({
          type: 'info',
          title: 'Upcoming Deadline',
          message: `Task "${task.name}" is due next week`,
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

  // Monitor tenant usage limits
  const monitorUsageLimits = useCallback(async () => {
    if (!currentTenant) return;

    const { withinLimits, warnings } = checkUsageLimits();
    
    if (!withinLimits) {
      addNotification({
        type: 'error',
        title: 'Usage Limit Exceeded',
        message: 'Your organization has exceeded usage limits. Please upgrade your plan.',
        userId: currentTenant.owner.id,
        relatedEntity: {
          type: 'project',
          id: 'billing',
          name: 'Usage Limits'
        },
        actionUrl: '/settings'
      });
    } else if (warnings.length > 0) {
      warnings.forEach(warning => {
        addNotification({
          type: 'warning',
          title: 'Usage Warning',
          message: warning,
          userId: currentTenant.owner.id,
          relatedEntity: {
            type: 'project',
            id: 'usage',
            name: 'Usage Monitoring'
          },
          actionUrl: '/settings'
        });
      });
    }
  }, [currentTenant, checkUsageLimits, addNotification]);

  // Sync with external integrations
  const syncExternalIntegrations = useCallback(async () => {
    if (!settings.integrations) return;

    // Sync tasks to external services
    const recentTasks = tasks.filter(task => {
      const updatedAt = new Date(task.updatedAt);
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      return updatedAt > fiveMinutesAgo;
    });

    for (const task of recentTasks) {
      // Sync to Jira if enabled
      if (settings.integrations.jira.enabled && 
          settings.integrations.jira.domain && 
          settings.integrations.jira.email && 
          settings.integrations.jira.apiToken) {
        try {
          await IntegrationOrchestrator.executeAction({
            type: 'create_jira_issue',
            config: {
              projectKey: 'PROJ',
              summary: task.name,
              description: task.description || ''
            }
          }, { integrations: [{ type: 'jira', config: settings.integrations.jira }] });
        } catch (error) {
          console.error('Jira sync failed:', error);
        }
      }

      // Send Slack notification if enabled
      if (settings.integrations.slack.enabled && settings.integrations.slack.webhookUrl) {
        try {
          await IntegrationOrchestrator.executeAction({
            type: 'slack_message',
            config: {
              message: `Task updated: "${task.name}" - Status: ${task.status}`,
              channel: settings.integrations.slack.channel
            }
          }, { integrations: [{ type: 'slack', config: settings.integrations.slack }] });
        } catch (error) {
          console.error('Slack sync failed:', error);
        }
      }
    }
  }, [tasks, settings.integrations]);

  // Performance monitoring
  const monitorPerformance = useCallback(async () => {
    if (!settings.advanced.performanceMonitoring || !currentTenant) return;

    const performanceData = {
      loadTime: performance.now(),
      memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
      activeUsers: users.filter(u => u.status === 'Active').length,
      activeTasks: tasks.filter(t => t.status === 'In progress').length,
      activeProjects: projects.filter(p => p.status === 'Active').length
    };

    AnalyticsService.trackEvent('performance_metrics', performanceData, currentTenant.id);
  }, [settings.advanced.performanceMonitoring, currentTenant, users, tasks, projects]);

  // Auto-sync effects
  useEffect(() => {
    syncProjectProgress();
  }, [tasks, syncProjectProgress]);

  useEffect(() => {
    syncBudgetAlerts();
  }, [projects, syncBudgetAlerts]);

  useEffect(() => {
    // Set up periodic sync intervals
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }

    syncIntervalRef.current = setInterval(() => {
      syncDeadlineReminders();
      monitorUsageLimits();
      syncExternalIntegrations();
      monitorPerformance();
    }, 60000); // Every minute

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [syncDeadlineReminders, monitorUsageLimits, syncExternalIntegrations, monitorPerformance]);

  // Listen for real-time events
  useEffect(() => {
    const handleTaskUpdate = (event: CustomEvent) => {
      const taskData = event.detail;
      updateTask(taskData.id, taskData);
    };

    const handleProjectUpdate = (event: CustomEvent) => {
      const projectData = event.detail;
      updateProject(projectData.id, projectData);
    };

    const handleNewNotification = (event: CustomEvent) => {
      const notificationData = event.detail;
      addNotification(notificationData);
    };

    window.addEventListener('taskUpdated', handleTaskUpdate as EventListener);
    window.addEventListener('projectUpdated', handleProjectUpdate as EventListener);
    window.addEventListener('newNotification', handleNewNotification as EventListener);

    return () => {
      window.removeEventListener('taskUpdated', handleTaskUpdate as EventListener);
      window.removeEventListener('projectUpdated', handleProjectUpdate as EventListener);
      window.removeEventListener('newNotification', handleNewNotification as EventListener);
    };
  }, [updateTask, updateProject, addNotification]);

  return {
    syncProjectProgress,
    syncBudgetAlerts,
    syncDeadlineReminders,
    monitorUsageLimits,
    syncExternalIntegrations,
    monitorPerformance
  };
};

// Hook for workspace-specific real-time features
export const useWorkspaceSync = () => {
  const { currentWorkspace, updateWorkspace } = useWorkspace();
  const { tasks } = useTask();
  const { projects } = useProject();
  const { currentTenant } = useTenant();

  const syncWorkspaceAnalytics = useCallback(async () => {
    if (!currentWorkspace) return;

    const workspaceTasks = tasks.filter(task => 
      currentWorkspace.projects.includes(task.projectId)
    );
    
    const workspaceProjects = projects.filter(project => 
      currentWorkspace.projects.includes(project.id)
    );

    const analytics = {
      totalTasks: workspaceTasks.length,
      completedTasks: workspaceTasks.filter(t => t.status === 'Complete').length,
      activeProjects: workspaceProjects.filter(p => p.status === 'Active').length,
      teamProductivity: workspaceTasks.length > 0 
        ? Math.round((workspaceTasks.filter(t => t.status === 'Complete').length / workspaceTasks.length) * 100)
        : 0,
      lastCalculated: new Date().toISOString()
    };

    await updateWorkspace(currentWorkspace.id, { analytics });

    // Track workspace metrics
    if (currentTenant) {
      AnalyticsService.trackEvent('workspace_analytics_updated', {
        workspaceId: currentWorkspace.id,
        ...analytics
      }, currentTenant.id);
    }
  }, [currentWorkspace, tasks, projects, updateWorkspace, currentTenant]);

  useEffect(() => {
    syncWorkspaceAnalytics();
  }, [tasks, projects, syncWorkspaceAnalytics]);

  return {
    syncWorkspaceAnalytics
  };
};

// Hook for integration-specific sync
export const useIntegrationSync = () => {
  const { settings } = useSettings();
  const { tasks } = useTask();
  const { projects } = useProject();
  const { addNotification } = useNotification();
  const { currentTenant } = useTenant();

  const syncToSlack = useCallback(async (message: string, channel?: string) => {
    if (settings.integrations.slack.enabled && settings.integrations.slack.webhookUrl) {
      try {
        const success = await IntegrationOrchestrator.executeAction({
          type: 'slack_message',
          config: { message, channel: channel || settings.integrations.slack.channel }
        }, { integrations: [{ type: 'slack', config: settings.integrations.slack }] });

        if (success && currentTenant) {
          AnalyticsService.trackEvent('slack_message_sent', {
            channel: channel || settings.integrations.slack.channel,
            messageLength: message.length
          }, currentTenant.id);
        }

        return success;
      } catch (error) {
        console.error('Slack sync failed:', error);
        return false;
      }
    }
    return false;
  }, [settings.integrations.slack, currentTenant]);

  const syncProjectToGitHub = useCallback(async (project: any) => {
    if (settings.integrations.github.enabled && 
        settings.integrations.github.token && 
        settings.integrations.github.organization) {
      try {
        const success = await IntegrationOrchestrator.executeAction({
          type: 'create_github_repo',
          config: {
            name: project.name.toLowerCase().replace(/\s+/g, '-'),
            description: project.description,
            private: true
          }
        }, { integrations: [{ type: 'github', config: settings.integrations.github }] });

        if (success && currentTenant) {
          AnalyticsService.trackEvent('github_repo_created', {
            projectId: project.id,
            repoName: project.name
          }, currentTenant.id);
        }

        return success;
      } catch (error) {
        console.error('GitHub sync failed:', error);
        return false;
      }
    }
    return false;
  }, [settings.integrations.github, currentTenant]);

  const syncTaskToJira = useCallback(async (task: any) => {
    if (settings.integrations.jira.enabled && 
        settings.integrations.jira.domain && 
        settings.integrations.jira.email && 
        settings.integrations.jira.apiToken) {
      try {
        const success = await IntegrationOrchestrator.executeAction({
          type: 'create_jira_issue',
          config: {
            projectKey: 'PROJ',
            summary: task.name,
            description: task.description || ''
          }
        }, { integrations: [{ type: 'jira', config: settings.integrations.jira }] });

        if (success && currentTenant) {
          AnalyticsService.trackEvent('jira_issue_created', {
            taskId: task.id,
            taskName: task.name
          }, currentTenant.id);
        }

        return success;
      } catch (error) {
        console.error('Jira sync failed:', error);
        return false;
      }
    }
    return false;
  }, [settings.integrations.jira, currentTenant]);

  return {
    syncToSlack,
    syncProjectToGitHub,
    syncTaskToJira
  };
};

// Hook for tenant-specific monitoring
export const useTenantMonitoring = () => {
  const { currentTenant, usage, checkUsageLimits } = useTenant();
  const { addNotification } = useNotification();

  const monitorUsage = useCallback(async () => {
    if (!currentTenant || !usage) return;

    const { withinLimits, warnings } = checkUsageLimits();
    
    // Send usage warnings
    warnings.forEach(warning => {
      addNotification({
        type: 'warning',
        title: 'Usage Alert',
        message: warning,
        userId: currentTenant.owner.id,
        relatedEntity: {
          type: 'project',
          id: 'usage',
          name: 'Usage Monitoring'
        },
        actionUrl: '/settings'
      });
    });

    // Track usage metrics
    AnalyticsService.trackEvent('usage_monitored', {
      ...usage.metrics,
      withinLimits,
      warningCount: warnings.length
    }, currentTenant.id);
  }, [currentTenant, usage, checkUsageLimits, addNotification]);

  useEffect(() => {
    const interval = setInterval(monitorUsage, 5 * 60 * 1000); // Every 5 minutes
    return () => clearInterval(interval);
  }, [monitorUsage]);

  return {
    monitorUsage
  };
};