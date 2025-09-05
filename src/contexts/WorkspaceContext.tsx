import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tasks: Array<{
    name: string;
    description: string;
    priority: string;
    estimatedHours: number;
    dependencies: string[];
  }>;
  milestones: Array<{
    name: string;
    description: string;
    daysFromStart: number;
  }>;
  customFields: Array<{
    name: string;
    type: 'text' | 'number' | 'date' | 'select' | 'checkbox';
    options?: string[];
    required: boolean;
  }>;
  createdAt: string;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  projectTemplates: ProjectTemplate[];
  currentWorkspace: Workspace | null;
  addWorkspace: (workspace: Omit<Workspace, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => void;
  deleteWorkspace: (id: string) => void;
  setCurrentWorkspace: (workspace: Workspace) => void;
  addProjectTemplate: (template: Omit<ProjectTemplate, 'id' | 'createdAt'>) => void;
  updateProjectTemplate: (id: string, updates: Partial<ProjectTemplate>) => void;
  deleteProjectTemplate: (id: string) => void;
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
  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    {
      id: '1',
      name: 'Product Development',
      description: 'Main product development workspace',
      color: 'blue',
      icon: '🚀',
      projects: ['1', '2'],
      members: ['1', '2', '3'],
      settings: {
        isPublic: false,
        allowGuests: false,
        defaultTaskView: 'kanban'
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-12-11T00:00:00Z'
    },
    {
      id: '2',
      name: 'Marketing Campaigns',
      description: 'Marketing and promotional activities',
      color: 'green',
      icon: '📈',
      projects: [],
      members: ['1', '4', '5'],
      settings: {
        isPublic: true,
        allowGuests: true,
        defaultTaskView: 'calendar'
      },
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: '2024-12-11T00:00:00Z'
    }
  ]);

  const [projectTemplates, setProjectTemplates] = useState<ProjectTemplate[]>([
    {
      id: '1',
      name: 'Website Development',
      description: 'Standard website development project template',
      category: 'Development',
      tasks: [
        {
          name: 'Requirements Gathering',
          description: 'Collect and document project requirements',
          priority: 'High',
          estimatedHours: 16,
          dependencies: []
        },
        {
          name: 'Design Mockups',
          description: 'Create visual designs and prototypes',
          priority: 'High',
          estimatedHours: 24,
          dependencies: ['Requirements Gathering']
        },
        {
          name: 'Frontend Development',
          description: 'Implement user interface',
          priority: 'Medium',
          estimatedHours: 40,
          dependencies: ['Design Mockups']
        },
        {
          name: 'Backend Development',
          description: 'Implement server-side functionality',
          priority: 'Medium',
          estimatedHours: 32,
          dependencies: ['Requirements Gathering']
        },
        {
          name: 'Testing & QA',
          description: 'Test functionality and fix bugs',
          priority: 'High',
          estimatedHours: 16,
          dependencies: ['Frontend Development', 'Backend Development']
        }
      ],
      milestones: [
        {
          name: 'Design Approval',
          description: 'Client approves final designs',
          daysFromStart: 14
        },
        {
          name: 'Development Complete',
          description: 'All development work finished',
          daysFromStart: 45
        },
        {
          name: 'Launch Ready',
          description: 'Project ready for production launch',
          daysFromStart: 60
        }
      ],
      customFields: [
        {
          name: 'Client Name',
          type: 'text',
          required: true
        },
        {
          name: 'Technology Stack',
          type: 'select',
          options: ['React', 'Vue', 'Angular', 'Vanilla JS'],
          required: true
        },
        {
          name: 'Launch Date',
          type: 'date',
          required: false
        }
      ],
      createdAt: '2024-01-01T00:00:00Z'
    }
  ]);

  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(workspaces[0]);

  const addWorkspace = (workspaceData: Omit<Workspace, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newWorkspace: Workspace = {
      ...workspaceData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setWorkspaces(prev => [...prev, newWorkspace]);
    
    // Auto-switch to new workspace
    setCurrentWorkspace(newWorkspace);
  };

  const updateWorkspace = (id: string, updates: Partial<Workspace>) => {
    setWorkspaces(prev => prev.map(workspace => 
      workspace.id === id 
        ? { ...workspace, ...updates, updatedAt: new Date().toISOString() }
        : workspace
    ));
    
    // Update current workspace if it's the one being updated
    if (currentWorkspace?.id === id) {
      setCurrentWorkspace(prev => prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : null);
    }
  };

  const deleteWorkspace = (id: string) => {
    setWorkspaces(prev => prev.filter(workspace => workspace.id !== id));
    
    // Switch to first available workspace if current one is deleted
    if (currentWorkspace?.id === id) {
      const remainingWorkspaces = workspaces.filter(w => w.id !== id);
      setCurrentWorkspace(remainingWorkspaces.length > 0 ? remainingWorkspaces[0] : null);
    }
  };

  const addProjectTemplate = (templateData: Omit<ProjectTemplate, 'id' | 'createdAt'>) => {
    const newTemplate: ProjectTemplate = {
      ...templateData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setProjectTemplates(prev => [...prev, newTemplate]);
  };

  const updateProjectTemplate = (id: string, updates: Partial<ProjectTemplate>) => {
    setProjectTemplates(prev => prev.map(template => 
      template.id === id ? { ...template, ...updates } : template
    ));
  };

  const deleteProjectTemplate = (id: string) => {
    setProjectTemplates(prev => prev.filter(template => template.id !== id));
  };

  return (
    <WorkspaceContext.Provider value={{
      workspaces,
      projectTemplates,
      currentWorkspace,
      addWorkspace,
      updateWorkspace,
      deleteWorkspace,
      setCurrentWorkspace,
      addProjectTemplate,
      updateProjectTemplate,
      deleteProjectTemplate
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
};