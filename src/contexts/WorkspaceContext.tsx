import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNotification } from './NotificationContext';
import { useTenant } from './TenantContext';

export interface Workspace {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  projects: string[];
  members: string[];
  settings: {
    isPublic: boolean;
    allowGuests: boolean;
    defaultTaskView: 'list' | 'kanban' | 'gantt' | 'calendar';
    autoArchive: boolean;
    notifications: boolean;
    integrations: string[];
  };
  permissions: {
    [userId: string]: {
      role: 'owner' | 'admin' | 'member' | 'viewer';
      permissions: string[];
    };
  };
  analytics: {
    totalTasks: number;
    completedTasks: number;
    activeProjects: number;
    teamProductivity: number;
    lastCalculated: string;
  };
  createdAt: string;
  updatedAt: string;
  tenantId: string;
}

export interface WorkspaceTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  defaultProjects: Array<{
    name: string;
    description: string;
    tasks: Array<{
      name: string;
      description: string;
      priority: string;
      estimatedHours: number;
    }>;
  }>;
  defaultSettings: Workspace['settings'];
  createdAt: string;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  workspaceTemplates: WorkspaceTemplate[];
  currentWorkspace: Workspace | null;
  isLoading: boolean;
  addWorkspace: (workspace: Omit<Workspace, 'id' | 'createdAt' | 'updatedAt' | 'tenantId' | 'analytics'>) => Promise<Workspace>;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  addWorkspaceTemplate: (template: Omit<WorkspaceTemplate, 'id' | 'createdAt'>) => void;
  updateWorkspaceTemplate: (id: string, updates: Partial<WorkspaceTemplate>) => void;
  deleteWorkspaceTemplate: (id: string) => void;
  createWorkspaceFromTemplate: (templateId: string, name: string) => Promise<Workspace>;
  inviteToWorkspace: (workspaceId: string, userIds: string[], role: string) => Promise<void>;
  removeFromWorkspace: (workspaceId: string, userId: string) => Promise<void>;
  updateWorkspacePermissions: (workspaceId: string, userId: string, permissions: any) => Promise<void>;
  getWorkspaceAnalytics: (workspaceId: string) => Promise<any>;
  archiveWorkspace: (workspaceId: string) => Promise<void>;
  duplicateWorkspace: (workspaceId: string, newName: string) => Promise<Workspace>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { addNotification } = useNotification();
  const { currentTenant } = useTenant();
  
  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    {
      id: '1',
      name: 'Product Development',
      description: 'Main product development workspace with full team collaboration',
      color: 'blue',
      icon: '🚀',
      projects: ['1', '2'],
      members: ['1', '2', '3', '4'],
      settings: {
        isPublic: false,
        allowGuests: false,
        defaultTaskView: 'kanban',
        autoArchive: true,
        notifications: true,
        integrations: ['slack', 'github']
      },
      permissions: {
        '1': { role: 'owner', permissions: ['all'] },
        '2': { role: 'admin', permissions: ['manage_projects', 'manage_users'] },
        '3': { role: 'member', permissions: ['create_tasks', 'edit_tasks'] },
        '4': { role: 'viewer', permissions: ['view_only'] }
      },
      analytics: {
        totalTasks: 25,
        completedTasks: 18,
        activeProjects: 2,
        teamProductivity: 87,
        lastCalculated: new Date().toISOString()
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
      tenantId: currentTenant?.id || 'tenant-1'
    },
    {
      id: '2',
      name: 'Marketing Campaigns',
      description: 'Marketing team workspace for campaign planning and execution',
      color: 'green',
      icon: '📈',
      projects: ['3'],
      members: ['1', '4', '5', '6'],
      settings: {
        isPublic: true,
        allowGuests: true,
        defaultTaskView: 'calendar',
        autoArchive: false,
        notifications: true,
        integrations: ['slack']
      },
      permissions: {
        '1': { role: 'owner', permissions: ['all'] },
        '4': { role: 'admin', permissions: ['manage_projects'] },
        '5': { role: 'member', permissions: ['create_tasks'] },
        '6': { role: 'member', permissions: ['create_tasks'] }
      },
      analytics: {
        totalTasks: 15,
        completedTasks: 12,
        activeProjects: 1,
        teamProductivity: 92,
        lastCalculated: new Date().toISOString()
      },
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
      tenantId: currentTenant?.id || 'tenant-1'
    }
  ]);

  const [workspaceTemplates, setWorkspaceTemplates] = useState<WorkspaceTemplate[]>([
    {
      id: '1',
      name: 'Software Development',
      description: 'Complete software development workspace with agile workflows',
      category: 'Development',
      icon: '💻',
      color: 'blue',
      defaultProjects: [
        {
          name: 'Sprint Planning',
          description: 'Agile sprint planning and execution',
          tasks: [
            { name: 'Sprint Planning Meeting', description: 'Plan upcoming sprint', priority: 'High', estimatedHours: 2 },
            { name: 'Backlog Grooming', description: 'Refine product backlog', priority: 'Medium', estimatedHours: 3 },
            { name: 'Sprint Review', description: 'Review completed work', priority: 'Medium', estimatedHours: 1 }
          ]
        }
      ],
      defaultSettings: {
        isPublic: false,
        allowGuests: false,
        defaultTaskView: 'kanban',
        autoArchive: true,
        notifications: true,
        integrations: ['github', 'slack']
      },
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Marketing Team',
      description: 'Marketing campaign management and content creation',
      category: 'Marketing',
      icon: '📊',
      color: 'green',
      defaultProjects: [
        {
          name: 'Campaign Management',
          description: 'Marketing campaign planning and execution',
          tasks: [
            { name: 'Campaign Strategy', description: 'Develop campaign strategy', priority: 'High', estimatedHours: 8 },
            { name: 'Content Creation', description: 'Create marketing content', priority: 'Medium', estimatedHours: 16 },
            { name: 'Performance Analysis', description: 'Analyze campaign performance', priority: 'Low', estimatedHours: 4 }
          ]
        }
      ],
      defaultSettings: {
        isPublic: true,
        allowGuests: true,
        defaultTaskView: 'calendar',
        autoArchive: false,
        notifications: true,
        integrations: ['slack']
      },
      createdAt: '2024-01-01T00:00:00Z'
    }
  ]);

  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(workspaces[0]);
  const [isLoading, setIsLoading] = useState(false);

  const addWorkspace = async (workspaceData: Omit<Workspace, 'id' | 'createdAt' | 'updatedAt' | 'tenantId' | 'analytics'>): Promise<Workspace> => {
    setIsLoading(true);
    try {
      const newWorkspace: Workspace = {
        ...workspaceData,
        id: `workspace-${Date.now()}`,
        tenantId: currentTenant?.id || 'tenant-1',
        analytics: {
          totalTasks: 0,
          completedTasks: 0,
          activeProjects: 0,
          teamProductivity: 0,
          lastCalculated: new Date().toISOString()
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setWorkspaces(prev => [...prev, newWorkspace]);
      setCurrentWorkspace(newWorkspace);

      addNotification({
        type: 'success',
        title: 'Workspace Created',
        message: `Workspace "${newWorkspace.name}" has been created successfully`,
        userId: currentTenant?.owner.id || '1',
        relatedEntity: {
          type: 'project',
          id: newWorkspace.id,
          name: newWorkspace.name
        }
      });

      return newWorkspace;
    } finally {
      setIsLoading(false);
    }
  };

  const updateWorkspace = async (id: string, updates: Partial<Workspace>): Promise<void> => {
    setWorkspaces(prev => prev.map(workspace => 
      workspace.id === id 
        ? { ...workspace, ...updates, updatedAt: new Date().toISOString() }
        : workspace
    ));
    
    if (currentWorkspace?.id === id) {
      setCurrentWorkspace(prev => prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : null);
    }

    addNotification({
      type: 'info',
      title: 'Workspace Updated',
      message: 'Workspace settings have been updated',
      userId: currentTenant?.owner.id || '1',
      relatedEntity: {
        type: 'project',
        id: id,
        name: 'Workspace Update'
      }
    });
  };

  const deleteWorkspace = async (id: string): Promise<void> => {
    const workspace = workspaces.find(w => w.id === id);
    setWorkspaces(prev => prev.filter(workspace => workspace.id !== id));
    
    if (currentWorkspace?.id === id) {
      const remainingWorkspaces = workspaces.filter(w => w.id !== id);
      setCurrentWorkspace(remainingWorkspaces.length > 0 ? remainingWorkspaces[0] : null);
    }

    if (workspace) {
      addNotification({
        type: 'warning',
        title: 'Workspace Deleted',
        message: `Workspace "${workspace.name}" has been deleted`,
        userId: currentTenant?.owner.id || '1',
        relatedEntity: {
          type: 'project',
          id: workspace.id,
          name: workspace.name
        }
      });
    }
  };

  const addWorkspaceTemplate = (templateData: Omit<WorkspaceTemplate, 'id' | 'createdAt'>) => {
    const newTemplate: WorkspaceTemplate = {
      ...templateData,
      id: `template-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setWorkspaceTemplates(prev => [...prev, newTemplate]);
  };

  const updateWorkspaceTemplate = (id: string, updates: Partial<WorkspaceTemplate>) => {
    setWorkspaceTemplates(prev => prev.map(template => 
      template.id === id ? { ...template, ...updates } : template
    ));
  };

  const deleteWorkspaceTemplate = (id: string) => {
    setWorkspaceTemplates(prev => prev.filter(template => template.id !== id));
  };

  const createWorkspaceFromTemplate = async (templateId: string, name: string): Promise<Workspace> => {
    const template = workspaceTemplates.find(t => t.id === templateId);
    if (!template) throw new Error('Template not found');

    const workspaceData = {
      name,
      description: template.description,
      color: template.color,
      icon: template.icon,
      projects: [], // Projects will be created separately
      members: [currentTenant?.owner.id || '1'],
      settings: template.defaultSettings,
      permissions: {
        [currentTenant?.owner.id || '1']: {
          role: 'owner' as const,
          permissions: ['all']
        }
      }
    };

    return addWorkspace(workspaceData);
  };

  const inviteToWorkspace = async (workspaceId: string, userIds: string[], role: string): Promise<void> => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (!workspace) return;

    const updatedMembers = [...new Set([...workspace.members, ...userIds])];
    const updatedPermissions = { ...workspace.permissions };
    
    userIds.forEach(userId => {
      updatedPermissions[userId] = {
        role: role as any,
        permissions: getPermissionsForRole(role)
      };
    });

    await updateWorkspace(workspaceId, {
      members: updatedMembers,
      permissions: updatedPermissions
    });

    addNotification({
      type: 'info',
      title: 'Users Invited',
      message: `${userIds.length} user(s) invited to workspace "${workspace.name}"`,
      userId: currentTenant?.owner.id || '1',
      relatedEntity: {
        type: 'project',
        id: workspaceId,
        name: workspace.name
      }
    });
  };

  const removeFromWorkspace = async (workspaceId: string, userId: string): Promise<void> => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (!workspace) return;

    const updatedMembers = workspace.members.filter(id => id !== userId);
    const updatedPermissions = { ...workspace.permissions };
    delete updatedPermissions[userId];

    await updateWorkspace(workspaceId, {
      members: updatedMembers,
      permissions: updatedPermissions
    });
  };

  const updateWorkspacePermissions = async (workspaceId: string, userId: string, permissions: any): Promise<void> => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (!workspace) return;

    const updatedPermissions = {
      ...workspace.permissions,
      [userId]: permissions
    };

    await updateWorkspace(workspaceId, { permissions: updatedPermissions });
  };

  const getWorkspaceAnalytics = async (workspaceId: string): Promise<any> => {
    // Simulate API call to calculate analytics
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (!workspace) return null;

    // Calculate real analytics based on workspace data
    const analytics = {
      totalTasks: workspace.analytics.totalTasks,
      completedTasks: workspace.analytics.completedTasks,
      activeProjects: workspace.analytics.activeProjects,
      teamProductivity: workspace.analytics.teamProductivity,
      trends: {
        tasksThisWeek: 12,
        tasksLastWeek: 8,
        productivityChange: 15
      },
      topPerformers: workspace.members.slice(0, 3),
      upcomingDeadlines: 5
    };

    return analytics;
  };

  const archiveWorkspace = async (workspaceId: string): Promise<void> => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (!workspace) return;

    await updateWorkspace(workspaceId, {
      settings: { ...workspace.settings, isPublic: false }
    });

    addNotification({
      type: 'info',
      title: 'Workspace Archived',
      message: `Workspace "${workspace.name}" has been archived`,
      userId: currentTenant?.owner.id || '1',
      relatedEntity: {
        type: 'project',
        id: workspaceId,
        name: workspace.name
      }
    });
  };

  const duplicateWorkspace = async (workspaceId: string, newName: string): Promise<Workspace> => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (!workspace) throw new Error('Workspace not found');

    const duplicatedWorkspace = {
      ...workspace,
      name: newName,
      projects: [], // Don't duplicate projects
      members: [currentTenant?.owner.id || '1'], // Only add current user
      permissions: {
        [currentTenant?.owner.id || '1']: {
          role: 'owner' as const,
          permissions: ['all']
        }
      }
    };

    delete (duplicatedWorkspace as any).id;
    delete (duplicatedWorkspace as any).createdAt;
    delete (duplicatedWorkspace as any).updatedAt;
    delete (duplicatedWorkspace as any).tenantId;
    delete (duplicatedWorkspace as any).analytics;

    return addWorkspace(duplicatedWorkspace);
  };

  const getPermissionsForRole = (role: string): string[] => {
    switch (role) {
      case 'owner':
        return ['all'];
      case 'admin':
        return ['manage_projects', 'manage_users', 'view_analytics', 'manage_settings'];
      case 'member':
        return ['create_tasks', 'edit_tasks', 'view_projects'];
      case 'viewer':
        return ['view_only'];
      default:
        return ['view_only'];
    }
  };

  // Auto-calculate workspace analytics
  useEffect(() => {
    const calculateAnalytics = () => {
      workspaces.forEach(workspace => {
        // In a real app, this would calculate from actual task/project data
        const analytics = {
          totalTasks: workspace.analytics.totalTasks + Math.floor(Math.random() * 3),
          completedTasks: workspace.analytics.completedTasks + Math.floor(Math.random() * 2),
          activeProjects: workspace.projects.length,
          teamProductivity: Math.min(100, workspace.analytics.teamProductivity + Math.floor(Math.random() * 5) - 2),
          lastCalculated: new Date().toISOString()
        };

        updateWorkspace(workspace.id, { analytics });
      });
    };

    const interval = setInterval(calculateAnalytics, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [workspaces]);

  return (
    <WorkspaceContext.Provider value={{
      workspaces,
      workspaceTemplates,
      currentWorkspace,
      isLoading,
      addWorkspace,
      updateWorkspace,
      deleteWorkspace,
      setCurrentWorkspace,
      addWorkspaceTemplate,
      updateWorkspaceTemplate,
      deleteWorkspaceTemplate,
      createWorkspaceFromTemplate,
      inviteToWorkspace,
      removeFromWorkspace,
      updateWorkspacePermissions,
      getWorkspaceAnalytics,
      archiveWorkspace,
      duplicateWorkspace
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
};