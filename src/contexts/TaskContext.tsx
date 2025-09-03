import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNotification } from './NotificationContext';

export interface TaskComment {
  id: string;
  author: string;
  authorInitials: string;
  content: string;
  createdAt: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  status: 'In progress' | 'Complete' | 'Pending' | 'Blocked';
  priority: 'Low' | 'Medium' | 'High';
  assignee: {
    id: string;
    name: string;
    avatar: string;
    initials: string;
  };
  dueDate: string;
  project: string;
  projectId: string;
  tags: string[];
  estimatedHours: number;
  actualHours: number;
  dependencies: string[];
  subtasks: Array<{
    id: string;
    name: string;
    completed: boolean;
  }>;
  comments: TaskComment[];
  attachments: TaskAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  dueDate: string;
  status: 'Active' | 'Completed' | 'Paused';
  category: string;
  projectId?: string;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

interface TaskContextType {
  tasks: Task[];
  goals: Goal[];
  documents: Document[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'actualHours'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addTaskComment: (taskId: string, comment: Omit<TaskComment, 'id' | 'createdAt'>) => void;
  addTaskAttachment: (taskId: string, attachment: Omit<TaskAttachment, 'id' | 'uploadedAt'>) => void;
  removeTaskAttachment: (taskId: string, attachmentId: string) => void;
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addDocument: (doc: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  getTasksByProject: (projectId: string) => Task[];
  getTasksByAssignee: (assigneeId: string) => Task[];
  getOverdueTasks: () => Task[];
  getTaskProgress: (projectId: string) => number;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTask = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { addNotification } = useNotification();
  
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      name: 'Design new landing page hero section',
      description: 'Create a compelling hero section that showcases our product value proposition',
      status: 'In progress',
      priority: 'High',
      assignee: { id: '2', name: 'Sarah Chen', avatar: '', initials: 'SC' },
      dueDate: '2024-12-15',
      project: 'Website Redesign',
      projectId: '1',
      tags: ['design', 'frontend'],
      estimatedHours: 16,
      actualHours: 8,
      dependencies: [],
      subtasks: [
        { id: '1-1', name: 'Create wireframes', completed: true },
        { id: '1-2', name: 'Design mockups', completed: false },
        { id: '1-3', name: 'Get client approval', completed: false }
      ],
      comments: [
        {
          id: '1',
          author: 'Mike Johnson',
          authorInitials: 'MJ',
          content: 'Looking good! Can we adjust the color scheme slightly?',
          createdAt: '2024-12-10T10:30:00Z'
        }
      ],
      attachments: [
        {
          id: '1',
          name: 'hero-mockup.png',
          size: 2048000,
          type: 'image/png',
          uploadedBy: 'Sarah Chen',
          uploadedAt: '2024-12-09T16:45:00Z',
          url: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=400'
        }
      ],
      createdAt: '2024-12-01T09:00:00Z',
      updatedAt: '2024-12-10T14:30:00Z'
    },
    {
      id: '2',
      name: 'Implement user authentication flow',
      description: 'Set up secure login, registration, and password reset functionality',
      status: 'Pending',
      priority: 'Medium',
      assignee: { id: '3', name: 'Mike Johnson', avatar: '', initials: 'MJ' },
      dueDate: '2024-12-18',
      project: 'Website Redesign',
      projectId: '1',
      tags: ['backend', 'security'],
      estimatedHours: 24,
      actualHours: 0,
      dependencies: ['1'],
      subtasks: [],
      comments: [],
      attachments: [],
      createdAt: '2024-12-02T09:00:00Z',
      updatedAt: '2024-12-08T11:20:00Z'
    },
    {
      id: '3',
      name: 'Mobile app wireframes',
      description: 'Create initial wireframes for mobile application',
      status: 'In progress',
      priority: 'High',
      assignee: { id: '4', name: 'Alex Rodriguez', avatar: '', initials: 'AR' },
      dueDate: '2024-12-20',
      project: 'Mobile App Development',
      projectId: '2',
      tags: ['mobile', 'design'],
      estimatedHours: 20,
      actualHours: 12,
      dependencies: [],
      subtasks: [],
      comments: [],
      attachments: [],
      createdAt: '2024-12-03T09:00:00Z',
      updatedAt: '2024-12-11T16:15:00Z'
    }
  ]);

  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      title: 'Launch Website Redesign',
      description: 'Complete development and launch of the redesigned website',
      progress: 65,
      target: 100,
      dueDate: '2024-12-31',
      status: 'Active',
      category: 'Product',
      projectId: '1'
    },
    {
      id: '2',
      title: 'Mobile App MVP',
      description: 'Develop and release minimum viable product for mobile app',
      progress: 15,
      target: 100,
      dueDate: '2025-06-30',
      status: 'Active',
      category: 'Product',
      projectId: '2'
    }
  ]);

  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      title: 'Website Redesign Requirements',
      content: 'Detailed requirements for the website redesign project including user stories, technical specifications, and design guidelines.',
      author: 'Sarah Chen',
      authorId: '2',
      projectId: '1',
      createdAt: '2024-12-01T09:00:00Z',
      updatedAt: '2024-12-10T14:30:00Z',
      tags: ['requirements', 'planning']
    },
    {
      id: '2',
      title: 'Mobile App Technical Spec',
      content: 'Technical specifications for the mobile application including architecture, technology stack, and implementation details.',
      author: 'Alex Rodriguez',
      authorId: '4',
      projectId: '2',
      createdAt: '2024-11-28T09:00:00Z',
      updatedAt: '2024-12-12T10:15:00Z',
      tags: ['technical', 'mobile']
    }
  ]);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'actualHours'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      actualHours: 0,
      comments: taskData.comments || [],
      attachments: taskData.attachments || [],
      subtasks: taskData.subtasks || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTasks(prev => [...prev, newTask]);

    // Trigger notifications
    addNotification({
      type: 'success',
      title: 'Task Created',
      message: `New task "${newTask.name}" has been created and assigned to ${newTask.assignee.name}`,
      userId: newTask.assignee.id,
      relatedEntity: {
        type: 'task',
        id: newTask.id,
        name: newTask.name
      },
      actionUrl: '/tasks'
    });

    // Notify project manager if different from assignee
    if (newTask.assignee.id !== '1') {
      addNotification({
        type: 'info',
        title: 'New Task in Project',
        message: `Task "${newTask.name}" was added to ${newTask.project}`,
        userId: '1',
        relatedEntity: {
          type: 'task',
          id: newTask.id,
          name: newTask.name
        },
        actionUrl: '/tasks'
      });
    }
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    const oldTask = tasks.find(t => t.id === id);
    if (!oldTask) return;

    const updatedTask = { ...oldTask, ...updates, updatedAt: new Date().toISOString() };
    setTasks(prev => prev.map(task => task.id === id ? updatedTask : task));

    // Status change notifications
    if (updates.status && updates.status !== oldTask.status) {
      addNotification({
        type: updates.status === 'Complete' ? 'success' : 'info',
        title: 'Task Status Updated',
        message: `"${updatedTask.name}" status changed to ${updates.status}`,
        userId: updatedTask.assignee.id,
        relatedEntity: {
          type: 'task',
          id: updatedTask.id,
          name: updatedTask.name
        },
        actionUrl: '/tasks'
      });

      // Notify project manager
      if (updatedTask.assignee.id !== '1') {
        addNotification({
          type: 'info',
          title: 'Task Progress Update',
          message: `${updatedTask.assignee.name} updated "${updatedTask.name}" to ${updates.status}`,
          userId: '1',
          relatedEntity: {
            type: 'task',
            id: updatedTask.id,
            name: updatedTask.name
          },
          actionUrl: '/tasks'
        });
      }
    }

    // Assignee change notifications
    if (updates.assignee && updates.assignee.id !== oldTask.assignee.id) {
      addNotification({
        type: 'info',
        title: 'Task Reassigned',
        message: `You have been assigned to "${updatedTask.name}"`,
        userId: updates.assignee.id,
        relatedEntity: {
          type: 'task',
          id: updatedTask.id,
          name: updatedTask.name
        },
        actionUrl: '/tasks'
      });
    }
  };

  const deleteTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      setTasks(prev => prev.filter(task => task.id !== id));
      
      addNotification({
        type: 'warning',
        title: 'Task Deleted',
        message: `Task "${task.name}" has been deleted`,
        userId: task.assignee.id,
        relatedEntity: {
          type: 'task',
          id: task.id,
          name: task.name
        }
      });
    }
  };

  const addTaskComment = (taskId: string, commentData: Omit<TaskComment, 'id' | 'createdAt'>) => {
    const newComment: TaskComment = {
      ...commentData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            comments: [...task.comments, newComment],
            updatedAt: new Date().toISOString()
          }
        : task
    ));

    const task = tasks.find(t => t.id === taskId);
    if (task) {
      // Notify task assignee about new comment
      addNotification({
        type: 'info',
        title: 'New Comment',
        message: `${commentData.author} commented on "${task.name}"`,
        userId: task.assignee.id,
        relatedEntity: {
          type: 'task',
          id: taskId,
          name: task.name
        },
        actionUrl: '/tasks'
      });
    }
  };

  const addTaskAttachment = (taskId: string, attachmentData: Omit<TaskAttachment, 'id' | 'uploadedAt'>) => {
    const newAttachment: TaskAttachment = {
      ...attachmentData,
      id: Date.now().toString(),
      uploadedAt: new Date().toISOString()
    };
    
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            attachments: [...task.attachments, newAttachment],
            updatedAt: new Date().toISOString()
          }
        : task
    ));

    const task = tasks.find(t => t.id === taskId);
    if (task) {
      addNotification({
        type: 'info',
        title: 'File Attached',
        message: `File "${newAttachment.name}" was attached to "${task.name}"`,
        userId: task.assignee.id,
        relatedEntity: {
          type: 'task',
          id: taskId,
          name: task.name
        },
        actionUrl: '/tasks'
      });
    }
  };

  const removeTaskAttachment = (taskId: string, attachmentId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            attachments: task.attachments.filter(att => att.id !== attachmentId),
            updatedAt: new Date().toISOString()
          }
        : task
    ));
  };

  const addGoal = (goalData: Omit<Goal, 'id'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: Date.now().toString()
    };
    setGoals(prev => [...prev, newGoal]);

    addNotification({
      type: 'success',
      title: 'Goal Created',
      message: `New goal "${newGoal.title}" has been created`,
      userId: '1',
      relatedEntity: {
        type: 'goal',
        id: newGoal.id,
        name: newGoal.title
      },
      actionUrl: '/goals'
    });
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    const oldGoal = goals.find(g => g.id === id);
    if (!oldGoal) return;

    const updatedGoal = { ...oldGoal, ...updates };
    setGoals(prev => prev.map(goal => goal.id === id ? updatedGoal : goal));

    // Check if goal was completed
    if (updates.status === 'Completed' && oldGoal.status !== 'Completed') {
      addNotification({
        type: 'success',
        title: 'Goal Completed! 🎉',
        message: `Congratulations! Goal "${updatedGoal.title}" has been completed`,
        userId: '1',
        relatedEntity: {
          type: 'goal',
          id: updatedGoal.id,
          name: updatedGoal.title
        },
        actionUrl: '/goals'
      });
    }
  };

  const deleteGoal = (id: string) => {
    const goal = goals.find(g => g.id === id);
    if (goal) {
      setGoals(prev => prev.filter(goal => goal.id !== id));
      
      addNotification({
        type: 'warning',
        title: 'Goal Deleted',
        message: `Goal "${goal.title}" has been deleted`,
        userId: '1',
        relatedEntity: {
          type: 'goal',
          id: goal.id,
          name: goal.title
        }
      });
    }
  };

  const addDocument = (docData: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newDoc: Document = {
      ...docData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setDocuments(prev => [...prev, newDoc]);

    addNotification({
      type: 'info',
      title: 'Document Created',
      message: `New document "${newDoc.title}" has been created`,
      userId: newDoc.authorId,
      relatedEntity: {
        type: 'project',
        id: newDoc.projectId || 'docs',
        name: newDoc.title
      },
      actionUrl: '/docs'
    });
  };

  const updateDocument = (id: string, updates: Partial<Document>) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id 
        ? { ...doc, ...updates, updatedAt: new Date().toISOString() }
        : doc
    ));
  };

  const deleteDocument = (id: string) => {
    const doc = documents.find(d => d.id === id);
    if (doc) {
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      
      addNotification({
        type: 'warning',
        title: 'Document Deleted',
        message: `Document "${doc.title}" has been deleted`,
        userId: doc.authorId,
        relatedEntity: {
          type: 'project',
          id: doc.projectId || 'docs',
          name: doc.title
        }
      });
    }
  };

  // Helper functions for interrelated data
  const getTasksByProject = (projectId: string) => {
    return tasks.filter(task => task.projectId === projectId);
  };

  const getTasksByAssignee = (assigneeId: string) => {
    return tasks.filter(task => task.assignee.id === assigneeId);
  };

  const getOverdueTasks = () => {
    const now = new Date();
    return tasks.filter(task => 
      task.status !== 'Complete' && 
      new Date(task.dueDate) < now
    );
  };

  const getTaskProgress = (projectId: string) => {
    const projectTasks = getTasksByProject(projectId);
    if (projectTasks.length === 0) return 0;
    
    const completedTasks = projectTasks.filter(task => task.status === 'Complete').length;
    return Math.round((completedTasks / projectTasks.length) * 100);
  };

  // Auto-update project progress when tasks change
  useEffect(() => {
    // This would trigger project progress updates in a real implementation
    // For now, we'll handle this in the project context
  }, [tasks]);

  return (
    <TaskContext.Provider value={{
      tasks,
      goals,
      documents,
      addTask,
      updateTask,
      deleteTask,
      addTaskComment,
      addTaskAttachment,
      removeTaskAttachment,
      addGoal,
      updateGoal,
      deleteGoal,
      addDocument,
      updateDocument,
      deleteDocument,
      getTasksByProject,
      getTasksByAssignee,
      getOverdueTasks,
      getTaskProgress
    }}>
      {children}
    </TaskContext.Provider>
  );
};