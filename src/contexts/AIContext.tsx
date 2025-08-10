import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useNotification } from './NotificationContext';

export interface AISuggestion {
  id: string;
  type: 'task_creation' | 'deadline_prediction' | 'resource_allocation' | 'risk_detection' | 'optimization' | 'budget_alert' | 'workflow_improvement';
  title: string;
  description: string;
  confidence: number;
  data: any;
  status: 'pending' | 'accepted' | 'dismissed';
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  estimatedImpact: string;
  createdAt: string;
}

export interface AIInsight {
  id: string;
  category: 'productivity' | 'budget' | 'timeline' | 'team' | 'risk' | 'quality' | 'performance';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
  recommendations: string[];
  metrics: {
    current: number;
    target: number;
    trend: 'up' | 'down' | 'stable';
  };
  createdAt: string;
}

export interface AIAnalysis {
  projectHealth: {
    score: number;
    factors: string[];
    risks: string[];
  };
  teamPerformance: {
    efficiency: number;
    bottlenecks: string[];
    recommendations: string[];
  };
  budgetForecast: {
    projectedSpend: number;
    variance: number;
    alerts: string[];
  };
}

interface AIContextType {
  suggestions: AISuggestion[];
  insights: AIInsight[];
  analysis: AIAnalysis | null;
  isProcessing: boolean;
  generateTaskSuggestions: (projectId: string) => Promise<void>;
  predictDeadline: (taskId: string) => Promise<string>;
  analyzeProjectRisk: (projectId: string) => Promise<AIInsight[]>;
  optimizeResourceAllocation: (projectId: string) => Promise<AISuggestion[]>;
  generateProjectAnalysis: (projectId: string) => Promise<AIAnalysis>;
  acceptSuggestion: (id: string) => void;
  dismissSuggestion: (id: string) => void;
  processNaturalLanguage: (input: string) => Promise<any>;
  generateMeetingSummary: (transcript: string) => Promise<string>;
  suggestTaskPriority: (taskData: any) => Promise<string>;
  detectAnomalies: () => Promise<AISuggestion[]>;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

export const AIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { addNotification } = useNotification();
  
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([
    {
      id: '1',
      type: 'deadline_prediction',
      title: 'Deadline Risk Detected',
      description: 'Based on current progress, "Design new landing page" may be delayed by 3 days',
      confidence: 85,
      data: { taskId: '1', predictedDelay: 3, currentProgress: 45 },
      status: 'pending',
      priority: 'high',
      actionable: true,
      estimatedImpact: 'Project timeline may be affected',
      createdAt: '2024-12-11T10:00:00Z'
    },
    {
      id: '2',
      type: 'resource_allocation',
      title: 'Resource Optimization Opportunity',
      description: 'Sarah Chen has 20% available capacity that could be allocated to high-priority tasks',
      confidence: 92,
      data: { userId: '2', availableCapacity: 20, suggestedTasks: ['4', '6'] },
      status: 'pending',
      priority: 'medium',
      actionable: true,
      estimatedImpact: 'Could improve delivery time by 15%',
      createdAt: '2024-12-11T11:30:00Z'
    },
    {
      id: '3',
      type: 'budget_alert',
      title: 'Budget Variance Alert',
      description: 'Website Redesign project trending 12% over budget due to scope changes',
      confidence: 96,
      data: { projectId: '1', variance: 12, cause: 'scope_changes' },
      status: 'pending',
      priority: 'high',
      actionable: true,
      estimatedImpact: 'Additional $6,000 budget required',
      createdAt: '2024-12-11T12:00:00Z'
    }
  ]);

  const [insights, setInsights] = useState<AIInsight[]>([
    {
      id: '1',
      category: 'productivity',
      title: 'Team Productivity Surge',
      description: 'Team productivity has increased by 15% this month compared to last month',
      impact: 'medium',
      actionable: true,
      recommendations: [
        'Continue current workflow practices',
        'Consider expanding successful strategies to other teams',
        'Document best practices for future reference'
      ],
      metrics: {
        current: 115,
        target: 100,
        trend: 'up'
      },
      createdAt: '2024-12-11T09:00:00Z'
    },
    {
      id: '2',
      category: 'timeline',
      title: 'Critical Path Analysis',
      description: 'Three tasks on the critical path are at risk of delaying project completion',
      impact: 'high',
      actionable: true,
      recommendations: [
        'Allocate additional resources to critical tasks',
        'Consider parallel execution where possible',
        'Review task dependencies for optimization'
      ],
      metrics: {
        current: 75,
        target: 100,
        trend: 'down'
      },
      createdAt: '2024-12-11T13:00:00Z'
    }
  ]);

  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const generateTaskSuggestions = async (projectId: string) => {
    setIsProcessing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const newSuggestion: AISuggestion = {
        id: Date.now().toString(),
        type: 'task_creation',
        title: 'AI Task Suggestions',
        description: 'Based on project scope and similar projects, AI suggests creating 3 additional tasks',
        confidence: 78,
        data: { 
          projectId,
          suggestedTasks: [
            {
              name: 'User acceptance testing',
              description: 'Conduct UAT with stakeholders',
              priority: 'High',
              estimatedHours: 8
            },
            {
              name: 'Performance optimization',
              description: 'Optimize application performance',
              priority: 'Medium',
              estimatedHours: 12
            },
            {
              name: 'Documentation update',
              description: 'Update technical documentation',
              priority: 'Low',
              estimatedHours: 4
            }
          ]
        },
        status: 'pending',
        priority: 'medium',
        actionable: true,
        estimatedImpact: 'Improved project completeness',
        createdAt: new Date().toISOString()
      };
      
      setSuggestions(prev => [newSuggestion, ...prev]);
      setIsProcessing(false);

      addNotification({
        type: 'info',
        title: 'AI Suggestions Generated',
        message: 'New task suggestions are available for review',
        userId: '1',
        relatedEntity: {
          type: 'project',
          id: projectId,
          name: 'AI Suggestions'
        }
      });
    }, 2000);
  };

  const predictDeadline = async (taskId: string): Promise<string> => {
    setIsProcessing(true);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const prediction = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        setIsProcessing(false);
        
        addNotification({
          type: 'info',
          title: 'Deadline Prediction Complete',
          message: 'AI has analyzed the task and predicted completion date',
          userId: '1',
          relatedEntity: {
            type: 'task',
            id: taskId,
            name: 'Deadline Prediction'
          }
        });
        
        resolve(prediction);
      }, 1500);
    });
  };

  const analyzeProjectRisk = async (projectId: string): Promise<AIInsight[]> => {
    setIsProcessing(true);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const riskInsights: AIInsight[] = [
          {
            id: Date.now().toString(),
            category: 'risk',
            title: 'Project Risk Analysis Complete',
            description: 'Medium risk detected due to resource constraints and timeline pressure',
            impact: 'medium',
            actionable: true,
            recommendations: [
              'Add additional developer to critical path',
              'Consider scope reduction for non-essential features',
              'Implement daily standups for better coordination'
            ],
            metrics: {
              current: 65,
              target: 80,
              trend: 'down'
            },
            createdAt: new Date().toISOString()
          }
        ];
        
        setInsights(prev => [...riskInsights, ...prev]);
        setIsProcessing(false);
        
        addNotification({
          type: 'warning',
          title: 'Risk Analysis Complete',
          message: 'AI has identified potential project risks',
          userId: '1',
          relatedEntity: {
            type: 'project',
            id: projectId,
            name: 'Risk Analysis'
          }
        });
        
        resolve(riskInsights);
      }, 2500);
    });
  };

  const optimizeResourceAllocation = async (projectId: string): Promise<AISuggestion[]> => {
    setIsProcessing(true);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const optimizationSuggestions: AISuggestion[] = [
          {
            id: Date.now().toString(),
            type: 'resource_allocation',
            title: 'Resource Optimization Opportunity',
            description: 'AI suggests redistributing tasks to balance workload and improve delivery timeline',
            confidence: 88,
            data: { 
              projectId,
              reallocation: [
                { from: 'Mike Johnson', to: 'Alex Rodriguez', tasks: ['Task A', 'Task B'] },
                { from: 'Sarah Chen', to: 'Emily Davis', tasks: ['Task C'] }
              ],
              expectedImprovement: '15% faster delivery'
            },
            status: 'pending',
            priority: 'medium',
            actionable: true,
            estimatedImpact: 'Improved team efficiency and faster delivery',
            createdAt: new Date().toISOString()
          }
        ];
        
        setSuggestions(prev => [...optimizationSuggestions, ...prev]);
        setIsProcessing(false);
        
        addNotification({
          type: 'success',
          title: 'Optimization Suggestions Ready',
          message: 'AI has generated resource optimization recommendations',
          userId: '1',
          relatedEntity: {
            type: 'project',
            id: projectId,
            name: 'Resource Optimization'
          }
        });
        
        resolve(optimizationSuggestions);
      }, 3000);
    });
  };

  const generateProjectAnalysis = async (projectId: string): Promise<AIAnalysis> => {
    setIsProcessing(true);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const projectAnalysis: AIAnalysis = {
          projectHealth: {
            score: 78,
            factors: ['On-time delivery', 'Team collaboration', 'Budget adherence'],
            risks: ['Resource constraints', 'Scope creep', 'Technical debt']
          },
          teamPerformance: {
            efficiency: 85,
            bottlenecks: ['Code review process', 'Design approval delays'],
            recommendations: [
              'Implement automated testing',
              'Streamline approval process',
              'Add senior developer for mentoring'
            ]
          },
          budgetForecast: {
            projectedSpend: 52000,
            variance: 4000,
            alerts: ['Development costs trending high', 'Design phase over budget']
          }
        };
        
        setAnalysis(projectAnalysis);
        setIsProcessing(false);
        
        addNotification({
          type: 'info',
          title: 'Project Analysis Complete',
          message: 'Comprehensive AI analysis is now available',
          userId: '1',
          relatedEntity: {
            type: 'project',
            id: projectId,
            name: 'Project Analysis'
          }
        });
        
        resolve(projectAnalysis);
      }, 4000);
    });
  };

  const acceptSuggestion = (id: string) => {
    setSuggestions(prev => prev.map(suggestion => 
      suggestion.id === id 
        ? { ...suggestion, status: 'accepted' as const }
        : suggestion
    ));

    const suggestion = suggestions.find(s => s.id === id);
    if (suggestion) {
      addNotification({
        type: 'success',
        title: 'AI Suggestion Implemented',
        message: `Applied suggestion: ${suggestion.title}`,
        userId: '1',
        relatedEntity: {
          type: 'project',
          id: 'ai',
          name: suggestion.title
        }
      });
    }
  };

  const dismissSuggestion = (id: string) => {
    setSuggestions(prev => prev.map(suggestion => 
      suggestion.id === id 
        ? { ...suggestion, status: 'dismissed' as const }
        : suggestion
    ));
  };

  const processNaturalLanguage = async (input: string): Promise<any> => {
    setIsProcessing(true);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Advanced NLP processing simulation
        let result: any = {};
        
        if (input.toLowerCase().includes('create') && input.toLowerCase().includes('project')) {
          result = {
            intent: 'create_project',
            entities: {
              projectName: extractProjectName(input),
              teamSize: extractNumber(input) || 3,
              duration: extractDuration(input) || '1 month',
              priority: extractPriority(input) || 'medium'
            },
            confidence: 0.92,
            suggestedActions: [
              'Create new project',
              'Assign team members',
              'Set up initial tasks',
              'Define milestones'
            ]
          };
        } else if (input.toLowerCase().includes('task') || input.toLowerCase().includes('todo')) {
          result = {
            intent: 'create_task',
            entities: {
              taskName: extractTaskName(input),
              assignee: extractAssignee(input),
              priority: extractPriority(input) || 'medium',
              dueDate: extractDate(input)
            },
            confidence: 0.87,
            suggestedActions: [
              'Create new task',
              'Assign to team member',
              'Set due date',
              'Add to project'
            ]
          };
        } else if (input.toLowerCase().includes('meeting') || input.toLowerCase().includes('schedule')) {
          result = {
            intent: 'schedule_meeting',
            entities: {
              title: extractMeetingTitle(input),
              attendees: extractAttendees(input),
              date: extractDate(input),
              duration: extractDuration(input) || '1 hour'
            },
            confidence: 0.89,
            suggestedActions: [
              'Create calendar event',
              'Send invitations',
              'Set up meeting room',
              'Prepare agenda'
            ]
          };
        } else {
          result = {
            intent: 'general_query',
            entities: {},
            confidence: 0.65,
            suggestedActions: [
              'Clarify request',
              'Provide more context',
              'Try specific commands'
            ]
          };
        }
        
        setIsProcessing(false);
        
        addNotification({
          type: 'info',
          title: 'AI Processing Complete',
          message: `Processed: "${input.substring(0, 50)}${input.length > 50 ? '...' : ''}"`,
          userId: '1',
          relatedEntity: {
            type: 'project',
            id: 'ai',
            name: 'Natural Language Processing'
          }
        });
        
        resolve(result);
      }, 1500);
    });
  };

  const generateMeetingSummary = async (transcript: string): Promise<string> => {
    setIsProcessing(true);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const summary = `
**Meeting Summary**

**Key Points Discussed:**
- Project timeline review and milestone updates
- Resource allocation for upcoming sprint
- Budget review and expense approvals

**Action Items:**
- Sarah to complete design mockups by Friday
- Mike to review code and provide feedback
- Team to schedule follow-up meeting next week

**Decisions Made:**
- Approved additional budget for design tools
- Agreed to extend deadline by 3 days
- Decided to add one more developer to the team
        `;
        
        setIsProcessing(false);
        
        addNotification({
          type: 'success',
          title: 'Meeting Summary Generated',
          message: 'AI has generated a comprehensive meeting summary',
          userId: '1',
          relatedEntity: {
            type: 'project',
            id: 'meeting',
            name: 'Meeting Summary'
          }
        });
        
        resolve(summary);
      }, 3000);
    });
  };

  const suggestTaskPriority = async (taskData: any): Promise<string> => {
    setIsProcessing(true);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // AI logic for priority suggestion
        let priority = 'Medium';
        
        if (taskData.dueDate) {
          const daysUntilDue = Math.ceil((new Date(taskData.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          if (daysUntilDue <= 2) priority = 'High';
          else if (daysUntilDue <= 7) priority = 'Medium';
          else priority = 'Low';
        }
        
        if (taskData.description?.toLowerCase().includes('urgent') || 
            taskData.description?.toLowerCase().includes('critical')) {
          priority = 'High';
        }
        
        setIsProcessing(false);
        resolve(priority);
      }, 1000);
    });
  };

  const detectAnomalies = async (): Promise<AISuggestion[]> => {
    setIsProcessing(true);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const anomalies: AISuggestion[] = [
          {
            id: Date.now().toString(),
            type: 'risk_detection',
            title: 'Unusual Activity Detected',
            description: 'Task completion rate has dropped 25% in the last week',
            confidence: 91,
            data: {
              metric: 'completion_rate',
              change: -25,
              timeframe: '1 week'
            },
            status: 'pending',
            priority: 'high',
            actionable: true,
            estimatedImpact: 'Project delivery may be at risk',
            createdAt: new Date().toISOString()
          }
        ];
        
        setSuggestions(prev => [...anomalies, ...prev]);
        setIsProcessing(false);
        
        addNotification({
          type: 'warning',
          title: 'Anomaly Detected',
          message: 'AI has detected unusual patterns in project activity',
          userId: '1',
          relatedEntity: {
            type: 'project',
            id: 'anomaly',
            name: 'Anomaly Detection'
          }
        });
        
        resolve(anomalies);
      }, 2000);
    });
  };

  // Helper functions for NLP
  const extractProjectName = (input: string): string => {
    const match = input.match(/project\s+(?:called\s+|named\s+)?["']?([^"']+)["']?/i);
    return match ? match[1].trim() : 'New Project';
  };

  const extractTaskName = (input: string): string => {
    const match = input.match(/task\s+(?:to\s+|called\s+)?["']?([^"']+)["']?/i);
    return match ? match[1].trim() : 'New Task';
  };

  const extractMeetingTitle = (input: string): string => {
    const match = input.match(/meeting\s+(?:about\s+|for\s+)?["']?([^"']+)["']?/i);
    return match ? match[1].trim() : 'Team Meeting';
  };

  const extractNumber = (input: string): number | null => {
    const match = input.match(/(\d+)/);
    return match ? parseInt(match[1]) : null;
  };

  const extractDuration = (input: string): string | null => {
    const match = input.match(/(\d+\s*(?:day|week|month|hour)s?)/i);
    return match ? match[1] : null;
  };

  const extractPriority = (input: string): string | null => {
    if (input.toLowerCase().includes('urgent') || input.toLowerCase().includes('high')) return 'high';
    if (input.toLowerCase().includes('low')) return 'low';
    return null;
  };

  const extractAssignee = (input: string): string | null => {
    const match = input.match(/assign\s+(?:to\s+)?(\w+\s+\w+)/i);
    return match ? match[1] : null;
  };

  const extractDate = (input: string): string | null => {
    const match = input.match(/(?:by\s+|due\s+|on\s+)(\w+\s+\d+)/i);
    return match ? match[1] : null;
  };

  const extractAttendees = (input: string): string[] => {
    const matches = input.match(/@(\w+)/g);
    return matches ? matches.map(m => m.substring(1)) : [];
  };

  return (
    <AIContext.Provider value={{
      suggestions,
      insights,
      analysis,
      isProcessing,
      generateTaskSuggestions,
      predictDeadline,
      analyzeProjectRisk,
      optimizeResourceAllocation,
      generateProjectAnalysis,
      acceptSuggestion,
      dismissSuggestion,
      processNaturalLanguage,
      generateMeetingSummary,
      suggestTaskPriority,
      detectAnomalies
    }}>
      {children}
    </AIContext.Provider>
  );
};