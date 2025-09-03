import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNotification } from './NotificationContext';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  progress: number;
  manager: {
    id: string;
    name: string;
    initials: string;
  };
  team: Array<{
    id: string;
    name: string;
    initials: string;
    role: string;
  }>;
  milestones: Milestone[];
  risks: Risk[];
  changes: ChangeRequest[];
  createdAt: string;
  updatedAt: string;
  isPubliclyShared: boolean;
  shareSettings?: any;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
  projectId: string;
  dependencies: string[];
  createdAt: string;
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  probability: 'Low' | 'Medium' | 'High';
  impact: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'Mitigated' | 'Closed';
  owner: string;
  ownerId: string;
  mitigation: string;
  projectId: string;
  createdAt: string;
}

export interface ChangeRequest {
  id: string;
  title: string;
  description: string;
  type: 'Scope' | 'Timeline' | 'Budget' | 'Resource';
  status: 'Pending' | 'Approved' | 'Rejected' | 'Implemented';
  requestedBy: string;
  requestedById: string;
  impact: string;
  cost: number;
  timeImpact: number;
  projectId: string;
  createdAt: string;
}

export interface Resource {
  id: string;
  name: string;
  type: 'Human' | 'Equipment' | 'Material' | 'Software';
  cost: number;
  availability: number;
  skills?: string[];
  department?: string;
  assignedProjects: string[];
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  category: string;
  createdAt: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  assignee?: string;
  duration: number;
  dependencies: string[];
  order: number;
}

interface ProjectContextType {
  projects: Project[];
  milestones: Milestone[];
  risks: Risk[];
  changeRequests: ChangeRequest[];
  resources: Resource[];
  workflowTemplates: WorkflowTemplate[];
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'milestones' | 'risks' | 'changes'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addMilestone: (milestone: Omit<Milestone, 'id' | 'createdAt'>) => void;
  updateMilestone: (id: string, updates: Partial<Milestone>) => void;
  deleteMilestone: (id: string) => void;
  addRisk: (risk: Omit<Risk, 'id' | 'createdAt'>) => void;
  updateRisk: (id: string, updates: Partial<Risk>) => void;
  deleteRisk: (id: string) => void;
  addChangeRequest: (change: Omit<ChangeRequest, 'id' | 'createdAt'>) => void;
  updateChangeRequest: (id: string, updates: Partial<ChangeRequest>) => void;
  deleteChangeRequest: (id: string) => void;
  addResource: (resource: Omit<Resource, 'id'>) => void;
  updateResource: (id: string, updates: Partial<Resource>) => void;
  deleteResource: (id: string) => void;
  addWorkflowTemplate: (template: Omit<WorkflowTemplate, 'id' | 'createdAt'>) => void;
  updateWorkflowTemplate: (id: string, updates: Partial<WorkflowTemplate>) => void;
  deleteWorkflowTemplate: (id: string) => void;
  getProjectProgress: (projectId: string) => number;
  getProjectBudgetUtilization: (projectId: string) => number;
  getProjectTeamSize: (projectId: string) => number;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { addNotification } = useNotification();
  
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Website Redesign',
      description: 'Complete overhaul of company website with modern design and improved UX',
      status: 'Active',
      priority: 'High',
      startDate: '2024-11-01',
      endDate: '2024-12-31',
      budget: 50000,
      spent: 18500,
      progress: 65,
      manager: { id: '2', name: 'Sarah Chen', initials: 'SC' },
      team: [
        { id: '3', name: 'Mike Johnson', initials: 'MJ', role: 'Frontend Developer' },
        { id: '4', name: 'Alex Rodriguez', initials: 'AR', role: 'UI/UX Designer' },
        { id: '5', name: 'Emily Davis', initials: 'ED', role: 'Backend Developer' }
      ],
      milestones: [],
      risks: [],
      changes: [],
      isPubliclyShared: false,
      createdAt: '2024-11-01T09:00:00Z',
      updatedAt: '2024-12-11T14:30:00Z'
    },
    {
      id: '2',
      name: 'Mobile App Development',
      description: 'Native mobile application for iOS and Android platforms',
      status: 'Planning',
      priority: 'Medium',
      startDate: '2025-01-15',
      endDate: '2025-06-30',
      budget: 120000,
      spent: 0,
      progress: 15,
      manager: { id: '1', name: 'John Doe', initials: 'JD' },
      team: [
        { id: '6', name: 'Lisa Wang', initials: 'LW', role: 'Mobile Developer' },
        { id: '2', name: 'Sarah Chen', initials: 'SC', role: 'Product Manager' }
      ],
      milestones: [],
      risks: [],
      changes: [],
      isPubliclyShared: false,
      createdAt: '2024-12-01T09:00:00Z',
      updatedAt: '2024-12-11T10:15:00Z'
    }
  ]);

  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: '1',
      name: 'Design System Complete',
      description: 'Finalize design system and component library',
      dueDate: '2024-12-15',
      status: 'In Progress',
      projectId: '1',
      dependencies: [],
      createdAt: '2024-11-01T09:00:00Z'
    },
    {
      id: '2',
      name: 'Frontend Development',
      description: 'Complete frontend implementation',
      dueDate: '2024-12-25',
      status: 'Pending',
      projectId: '1',
      dependencies: ['1'],
      createdAt: '2024-11-01T09:00:00Z'
    }
  ]);

  const [risks, setRisks] = useState<Risk[]>([
    {
      id: '1',
      title: 'Third-party API Dependency',
      description: 'Risk of API changes affecting project timeline',
      probability: 'Medium',
      impact: 'High',
      status: 'Open',
      owner: 'Mike Johnson',
      ownerId: '3',
      mitigation: 'Create fallback solutions and maintain API documentation',
      projectId: '1',
      createdAt: '2024-11-15T10:00:00Z'
    }
  ]);

  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([
    {
      id: '1',
      title: 'Additional Mobile Responsiveness',
      description: 'Client requested enhanced mobile experience beyond original scope',
      type: 'Scope',
      status: 'Approved',
      requestedBy: 'Client',
      requestedById: 'client-1',
      impact: 'Additional 2 weeks development time',
      cost: 8000,
      timeImpact: 14,
      projectId: '1',
      createdAt: '2024-11-20T14:00:00Z'
    }
  ]);

  const [resources, setResources] = useState<Resource[]>([
    {
      id: '1',
      name: 'Sarah Chen',
      type: 'Human',
      cost: 120,
      availability: 80,
      skills: ['Project Management', 'Agile', 'Scrum'],
      department: 'Management',
      assignedProjects: ['1', '2']
    },
    {
      id: '2',
      name: 'Mike Johnson',
      type: 'Human',
      cost: 95,
      availability: 100,
      skills: ['React', 'TypeScript', 'Node.js'],
      department: 'Engineering',
      assignedProjects: ['1']
    }
  ]);

  const [workflowTemplates, setWorkflowTemplates] = useState<WorkflowTemplate[]>([
    {
      id: '1',
      name: 'Feature Development',
      description: 'Standard workflow for developing new features',
      category: 'Development',
      steps: [
        {
          id: '1',
          name: 'Requirements Analysis',
          description: 'Analyze and document requirements',
          duration: 2,
          dependencies: [],
          order: 1
        },
        {
          id: '2',
          name: 'Design',
          description: 'Create design mockups and specifications',
          duration: 3,
          dependencies: ['1'],
          order: 2
        }
      ],
      createdAt: '2024-10-01T09:00:00Z'
    }
  ]);

  const addProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'milestones' | 'risks' | 'changes'>) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      milestones: [],
      risks: [],
      changes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setProjects(prev => [...prev, newProject]);

    // Notify team members
    newProject.team.forEach(member => {
      addNotification({
        type: 'info',
        title: 'Added to Project',
        message: `You have been added to project "${newProject.name}"`,
        userId: member.id,
        relatedEntity: {
          type: 'project',
          id: newProject.id,
          name: newProject.name
        },
        actionUrl: '/projects'
      });
    });

    // Notify manager
    addNotification({
      type: 'success',
      title: 'Project Created',
      message: `Project "${newProject.name}" has been created successfully`,
      userId: newProject.manager.id,
      relatedEntity: {
        type: 'project',
        id: newProject.id,
        name: newProject.name
      },
      actionUrl: '/projects'
    });
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    const oldProject = projects.find(p => p.id === id);
    if (!oldProject) return;

    const updatedProject = { ...oldProject, ...updates, updatedAt: new Date().toISOString() };
    setProjects(prev => prev.map(project => project.id === id ? updatedProject : project));

    // Status change notifications
    if (updates.status && updates.status !== oldProject.status) {
      const statusMessage = updates.status === 'Completed' ? 
        `🎉 Project "${updatedProject.name}" has been completed!` :
        `Project "${updatedProject.name}" status changed to ${updates.status}`;

      // Notify all team members
      updatedProject.team.forEach(member => {
        addNotification({
          type: updates.status === 'Completed' ? 'success' : 'info',
          title: 'Project Status Update',
          message: statusMessage,
          userId: member.id,
          relatedEntity: {
            type: 'project',
            id: updatedProject.id,
            name: updatedProject.name
          },
          actionUrl: '/projects'
        });
      });
    }

    // Budget alerts
    if (updates.spent && updates.spent !== oldProject.spent) {
      const utilization = (updates.spent / updatedProject.budget) * 100;
      if (utilization > 90) {
        addNotification({
          type: 'warning',
          title: 'Budget Alert',
          message: `Project "${updatedProject.name}" is ${utilization.toFixed(1)}% over budget`,
          userId: updatedProject.manager.id,
          relatedEntity: {
            type: 'project',
            id: updatedProject.id,
            name: updatedProject.name
          },
          actionUrl: '/projects'
        });
      }
    }
  };

  const deleteProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      setProjects(prev => prev.filter(project => project.id !== id));
      
      // Notify all team members
      project.team.forEach(member => {
        addNotification({
          type: 'warning',
          title: 'Project Deleted',
          message: `Project "${project.name}" has been deleted`,
          userId: member.id,
          relatedEntity: {
            type: 'project',
            id: project.id,
            name: project.name
          }
        });
      });
    }
  };

  const addMilestone = (milestoneData: Omit<Milestone, 'id' | 'createdAt'>) => {
    const newMilestone: Milestone = {
      ...milestoneData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setMilestones(prev => [...prev, newMilestone]);

    const project = projects.find(p => p.id === milestoneData.projectId);
    if (project) {
      addNotification({
        type: 'info',
        title: 'Milestone Created',
        message: `New milestone "${newMilestone.name}" added to ${project.name}`,
        userId: project.manager.id,
        relatedEntity: {
          type: 'project',
          id: project.id,
          name: project.name
        },
        actionUrl: '/project-management'
      });
    }
  };

  const updateMilestone = (id: string, updates: Partial<Milestone>) => {
    const oldMilestone = milestones.find(m => m.id === id);
    if (!oldMilestone) return;

    const updatedMilestone = { ...oldMilestone, ...updates };
    setMilestones(prev => prev.map(milestone => milestone.id === id ? updatedMilestone : milestone));

    if (updates.status === 'Completed' && oldMilestone.status !== 'Completed') {
      const project = projects.find(p => p.id === updatedMilestone.projectId);
      if (project) {
        addNotification({
          type: 'success',
          title: 'Milestone Completed! 🎯',
          message: `Milestone "${updatedMilestone.name}" in ${project.name} has been completed`,
          userId: project.manager.id,
          relatedEntity: {
            type: 'project',
            id: project.id,
            name: project.name
          },
          actionUrl: '/project-management'
        });
      }
    }
  };

  const deleteMilestone = (id: string) => {
    const milestone = milestones.find(m => m.id === id);
    if (milestone) {
      setMilestones(prev => prev.filter(milestone => milestone.id !== id));
    }
  };

  const addRisk = (riskData: Omit<Risk, 'id' | 'createdAt'>) => {
    const newRisk: Risk = {
      ...riskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setRisks(prev => [...prev, newRisk]);

    const project = projects.find(p => p.id === riskData.projectId);
    if (project) {
      addNotification({
        type: 'warning',
        title: 'New Risk Identified',
        message: `Risk "${newRisk.title}" identified in ${project.name}`,
        userId: project.manager.id,
        relatedEntity: {
          type: 'project',
          id: project.id,
          name: project.name
        },
        actionUrl: '/project-management'
      });
    }
  };

  const updateRisk = (id: string, updates: Partial<Risk>) => {
    setRisks(prev => prev.map(risk => risk.id === id ? { ...risk, ...updates } : risk));
  };

  const deleteRisk = (id: string) => {
    setRisks(prev => prev.filter(risk => risk.id !== id));
  };

  const addChangeRequest = (changeData: Omit<ChangeRequest, 'id' | 'createdAt'>) => {
    const newChange: ChangeRequest = {
      ...changeData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setChangeRequests(prev => [...prev, newChange]);

    const project = projects.find(p => p.id === changeData.projectId);
    if (project) {
      addNotification({
        type: 'info',
        title: 'Change Request Submitted',
        message: `Change request "${newChange.title}" submitted for ${project.name}`,
        userId: project.manager.id,
        relatedEntity: {
          type: 'project',
          id: project.id,
          name: project.name
        },
        actionUrl: '/project-management'
      });
    }
  };

  const updateChangeRequest = (id: string, updates: Partial<ChangeRequest>) => {
    const oldChange = changeRequests.find(c => c.id === id);
    if (!oldChange) return;

    setChangeRequests(prev => prev.map(change => change.id === id ? { ...change, ...updates } : change));

    if (updates.status && updates.status !== oldChange.status) {
      const project = projects.find(p => p.id === oldChange.projectId);
      if (project) {
        addNotification({
          type: updates.status === 'Approved' ? 'success' : 'info',
          title: 'Change Request Updated',
          message: `Change request "${oldChange.title}" has been ${updates.status?.toLowerCase()}`,
          userId: oldChange.requestedById,
          relatedEntity: {
            type: 'project',
            id: project.id,
            name: project.name
          },
          actionUrl: '/project-management'
        });
      }
    }
  };

  const deleteChangeRequest = (id: string) => {
    setChangeRequests(prev => prev.filter(change => change.id !== id));
  };

  const addResource = (resourceData: Omit<Resource, 'id'>) => {
    const newResource: Resource = {
      ...resourceData,
      id: Date.now().toString()
    };
    setResources(prev => [...prev, newResource]);
  };

  const updateResource = (id: string, updates: Partial<Resource>) => {
    setResources(prev => prev.map(resource => 
      resource.id === id ? { ...resource, ...updates } : resource
    ));
  };

  const deleteResource = (id: string) => {
    setResources(prev => prev.filter(resource => resource.id !== id));
  };

  const addWorkflowTemplate = (templateData: Omit<WorkflowTemplate, 'id' | 'createdAt'>) => {
    const newTemplate: WorkflowTemplate = {
      ...templateData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setWorkflowTemplates(prev => [...prev, newTemplate]);
  };

  const updateWorkflowTemplate = (id: string, updates: Partial<WorkflowTemplate>) => {
    setWorkflowTemplates(prev => prev.map(template => 
      template.id === id ? { ...template, ...updates } : template
    ));
  };

  const deleteWorkflowTemplate = (id: string) => {
    setWorkflowTemplates(prev => prev.filter(template => template.id !== id));
  };

  // Helper functions for interrelated data
  const getProjectProgress = (projectId: string) => {
    // This would be calculated from tasks in a real implementation
    const project = projects.find(p => p.id === projectId);
    return project ? project.progress : 0;
  };

  const getProjectBudgetUtilization = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project || project.budget === 0) return 0;
    return (project.spent / project.budget) * 100;
  };

  const getProjectTeamSize = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.team.length : 0;
  };

  return (
    <ProjectContext.Provider value={{
      projects,
      milestones,
      risks,
      changeRequests,
      resources,
      workflowTemplates,
      addProject,
      updateProject,
      deleteProject,
      addMilestone,
      updateMilestone,
      deleteMilestone,
      addRisk,
      updateRisk,
      deleteRisk,
      addChangeRequest,
      updateChangeRequest,
      deleteChangeRequest,
      addResource,
      updateResource,
      deleteResource,
      addWorkflowTemplate,
      updateWorkflowTemplate,
      deleteWorkflowTemplate,
      getProjectProgress,
      getProjectBudgetUtilization,
      getProjectTeamSize
    }}>
      {children}
    </ProjectContext.Provider>
  );
};