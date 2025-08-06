import React, { createContext, useContext, useState, ReactNode } from 'react';

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
    name: string;
    initials: string;
  };
  team: Array<{
    name: string;
    initials: string;
    role: string;
  }>;
  milestones: Milestone[];
  risks: Risk[];
  changes: ChangeRequest[];
  createdAt: string;
  updatedAt: string;
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
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
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
      manager: { name: 'Sarah Chen', initials: 'SC' },
      team: [
        { name: 'Mike Johnson', initials: 'MJ', role: 'Frontend Developer' },
        { name: 'Alex Rodriguez', initials: 'AR', role: 'UI/UX Designer' },
        { name: 'Emily Davis', initials: 'ED', role: 'Backend Developer' }
      ],
      milestones: [],
      risks: [],
      changes: [],
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
      manager: { name: 'John Doe', initials: 'JD' },
      team: [
        { name: 'Lisa Wang', initials: 'LW', role: 'Mobile Developer' },
        { name: 'Sarah Chen', initials: 'SC', role: 'Product Manager' }
      ],
      milestones: [],
      risks: [],
      changes: [],
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
      department: 'Management'
    },
    {
      id: '2',
      name: 'Mike Johnson',
      type: 'Human',
      cost: 95,
      availability: 100,
      skills: ['React', 'TypeScript', 'Node.js'],
      department: 'Engineering'
    },
    {
      id: '3',
      name: 'Design Software License',
      type: 'Software',
      cost: 50,
      availability: 100
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
        },
        {
          id: '3',
          name: 'Development',
          description: 'Implement the feature',
          duration: 5,
          dependencies: ['2'],
          order: 3
        },
        {
          id: '4',
          name: 'Testing',
          description: 'Test the feature thoroughly',
          duration: 2,
          dependencies: ['3'],
          order: 4
        }
      ],
      createdAt: '2024-10-01T09:00:00Z'
    }
  ]);

  // Project CRUD operations
  const addProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setProjects(prev => [...prev, newProject]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(project => 
      project.id === id 
        ? { ...project, ...updates, updatedAt: new Date().toISOString() }
        : project
    ));
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id));
  };

  // Milestone CRUD operations
  const addMilestone = (milestoneData: Omit<Milestone, 'id' | 'createdAt'>) => {
    const newMilestone: Milestone = {
      ...milestoneData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setMilestones(prev => [...prev, newMilestone]);
  };

  const updateMilestone = (id: string, updates: Partial<Milestone>) => {
    setMilestones(prev => prev.map(milestone => 
      milestone.id === id ? { ...milestone, ...updates } : milestone
    ));
  };

  const deleteMilestone = (id: string) => {
    setMilestones(prev => prev.filter(milestone => milestone.id !== id));
  };

  // Risk CRUD operations
  const addRisk = (riskData: Omit<Risk, 'id' | 'createdAt'>) => {
    const newRisk: Risk = {
      ...riskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setRisks(prev => [...prev, newRisk]);
  };

  const updateRisk = (id: string, updates: Partial<Risk>) => {
    setRisks(prev => prev.map(risk => 
      risk.id === id ? { ...risk, ...updates } : risk
    ));
  };

  const deleteRisk = (id: string) => {
    setRisks(prev => prev.filter(risk => risk.id !== id));
  };

  // Change Request CRUD operations
  const addChangeRequest = (changeData: Omit<ChangeRequest, 'id' | 'createdAt'>) => {
    const newChange: ChangeRequest = {
      ...changeData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setChangeRequests(prev => [...prev, newChange]);
  };

  const updateChangeRequest = (id: string, updates: Partial<ChangeRequest>) => {
    setChangeRequests(prev => prev.map(change => 
      change.id === id ? { ...change, ...updates } : change
    ));
  };

  const deleteChangeRequest = (id: string) => {
    setChangeRequests(prev => prev.filter(change => change.id !== id));
  };

  // Resource CRUD operations
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

  // Workflow Template CRUD operations
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
      deleteWorkflowTemplate
    }}>
      {children}
    </ProjectContext.Provider>
  );
};