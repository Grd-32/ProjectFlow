import React, { createContext, useContext, useState, ReactNode } from 'react';
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
    name: string;
    avatar: string;
    initials: string;
  };
  dueDate: string;
  project: string;
  tags: string[];
  estimatedHours: number;
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
}

export interface Document {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

interface TaskContextType {
  tasks: Task[];
  goals: Goal[];
  documents: Document[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
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
  // Note: In a real implementation, we'd use the notification context properly
  // For now, we'll handle notifications in the components that use these functions
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      name: 'Design new landing page hero section',
      description: 'Create a compelling hero section that showcases our product value proposition',
      status: 'In progress',
      priority: 'High',
      assignee: { name: 'Sarah Chen', avatar: '', initials: 'SC' },
      dueDate: '2024-12-15',
      project: 'Website Redesign',
      comments: [
        {
          id: '1',
          author: 'Mike Johnson',
          authorInitials: 'MJ',
          content: 'Looking good! Can we adjust the color scheme slightly?',
          createdAt: '2024-12-10T10:30:00Z'
        },
        {
          id: '2',
          author: 'Alex Rodriguez',
          authorInitials: 'AR',
          content: 'I agree with Mike. Also, we should consider mobile responsiveness.',
          createdAt: '2024-12-10T14:20:00Z'
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
          url: '#'
        }
      ],
      createdAt: '2024-12-01',
      updatedAt: '2024-12-10'
    },
    {
      id: '2',
      name: 'Implement user authentication flow',
      description: 'Set up secure login, registration, and password reset functionality',
      status: 'Pending',
      priority: 'Medium',
      assignee: { name: 'Mike Johnson', avatar: '', initials: 'MJ' },
      dueDate: '2024-12-18',
      project: 'Auth System',
      comments: [],
      attachments: [],
      createdAt: '2024-12-02',
      updatedAt: '2024-12-08'
    },
    {
      id: '3',
      name: 'Write API documentation',
      description: 'Document all API endpoints with examples and response formats',
      status: 'Complete',
      priority: 'Low',
      assignee: { name: 'Alex Rodriguez', avatar: '', initials: 'AR' },
      dueDate: '2024-12-12',
      project: 'Documentation',
      comments: [],
      attachments: [],
      createdAt: '2024-11-28',
      updatedAt: '2024-12-12'
    },
    {
      id: '4',
      name: 'Set up CI/CD pipeline',
      description: 'Configure automated testing and deployment workflows',
      status: 'Blocked',
      priority: 'High',
      assignee: { name: 'Emily Davis', avatar: '', initials: 'ED' },
      dueDate: '2024-12-20',
      project: 'DevOps',
      comments: [],
      attachments: [],
      createdAt: '2024-12-03',
      updatedAt: '2024-12-09'
    },
    {
      id: '5',
      name: 'Conduct user research interviews',
      description: 'Interview 10 users to gather feedback on new features',
      status: 'In progress',
      priority: 'Medium',
      assignee: { name: 'John Smith', avatar: '', initials: 'JS' },
      dueDate: '2024-12-16',
      project: 'User Research',
      comments: [],
      attachments: [],
      createdAt: '2024-12-04',
      updatedAt: '2024-12-11'
    },
    {
      id: '6',
      name: 'Optimize database queries',
      description: 'Improve performance of slow database operations',
      status: 'Pending',
      priority: 'High',
      assignee: { name: 'Lisa Wang', avatar: '', initials: 'LW' },
      dueDate: '2024-12-22',
      project: 'Performance',
      comments: [],
      attachments: [],
      createdAt: '2024-12-05',
      updatedAt: '2024-12-10'
    }
  ]);

  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      title: 'Launch Product V2',
      description: 'Complete development and launch of the second version of our product',
      progress: 75,
      target: 100,
      dueDate: '2024-12-31',
      status: 'Active',
      category: 'Product'
    },
    {
      id: '2',
      title: 'Increase User Base',
      description: 'Grow our active user base to 10,000 users',
      progress: 6500,
      target: 10000,
      dueDate: '2025-03-31',
      status: 'Active',
      category: 'Growth'
    },
    {
      id: '3',
      title: 'Improve Performance',
      description: 'Reduce average page load time to under 2 seconds',
      progress: 2.8,
      target: 2.0,
      dueDate: '2025-01-15',
      status: 'Active',
      category: 'Technical'
    }
  ]);

  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      title: 'Project Requirements',
      content: 'Detailed requirements for the upcoming project...',
      author: 'Sarah Chen',
      createdAt: '2024-12-01',
      updatedAt: '2024-12-10',
      tags: ['requirements', 'planning']
    },
    {
      id: '2',
      title: 'API Specification',
      content: 'Complete API documentation and specifications...',
      author: 'Alex Rodriguez',
      createdAt: '2024-11-28',
      updatedAt: '2024-12-12',
      tags: ['api', 'documentation']
    },
    {
      id: '3',
      title: 'User Research Findings',
      content: 'Summary of user interviews and research insights...',
      author: 'John Smith',
      createdAt: '2024-12-05',
      updatedAt: '2024-12-11',
      tags: ['research', 'users']
    }
  ]);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      comments: taskData.comments || [],
      attachments: taskData.attachments || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { ...task, ...updates, updatedAt: new Date().toISOString() }
        : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
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
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(goal => 
      goal.id === id ? { ...goal, ...updates } : goal
    ));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
  };

  const addDocument = (docData: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newDoc: Document = {
      ...docData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setDocuments(prev => [...prev, newDoc]);
  };

  const updateDocument = (id: string, updates: Partial<Document>) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id 
        ? { ...doc, ...updates, updatedAt: new Date().toISOString() }
        : doc
    ));
  };

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

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
      deleteDocument
    }}>
      {children}
    </TaskContext.Provider>
  );
};