import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useNotification } from './NotificationContext';
import { useUser } from './UserContext';

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
  conversationHistory: Array<{
    id: string;
    type: 'user' | 'ai';
    content: string;
    timestamp: string;
    actions?: Array<{
      label: string;
      action: () => void;
      type: 'primary' | 'secondary';
    }>;
  }>;
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
  sendMessage: (message: string) => Promise<void>;
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
  const { currentUser } = useUser();
  
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{
    id: string;
    type: 'user' | 'ai';
    content: string;
    timestamp: string;
    actions?: Array<{
      label: string;
      action: () => void;
      type: 'primary' | 'secondary';
    }>;
  }>>([
    {
      id: '1',
      type: 'ai',
      content: `Hello ${currentUser.name}! I'm your AI assistant. I can help you with:\n\n• Creating tasks and projects\n• Analyzing project risks\n• Optimizing resource allocation\n• Generating insights and reports\n• Predicting deadlines\n\nTry asking me something like "Create a task for website redesign" or "Analyze risks in my current projects"`,
      timestamp: new Date().toISOString()
    }
  ]);

  const sendMessage = async (message: string): Promise<void> => {
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: message,
      timestamp: new Date().toISOString()
    };
    setConversationHistory(prev => [...prev, userMessage]);

    setIsProcessing(true);

    try {
      const result = await processNaturalLanguage(message);
      
      // Generate AI response
      let aiResponse = '';
      let actions: any[] = [];

      if (message.toLowerCase().includes('create') && message.toLowerCase().includes('task')) {
        aiResponse = `I'll help you create a task. Based on your request, I suggest:\n\n• Task: "${extractTaskName(message)}"\n• Priority: ${extractPriority(message) || 'Medium'}\n• Assignee: ${extractAssignee(message) || 'You'}\n\nShould I create this task?`;
        actions = [
          {
            label: 'Create Task',
            action: () => {
              // This would integrate with TaskContext
              addNotification({
                type: 'success',
                title: 'Task Created by AI',
                message: `Task created successfully`,
                userId: currentUser.id,
                relatedEntity: {
                  type: 'task',
                  id: 'ai-created',
                  name: extractTaskName(message) || 'New Task'
                }
              });
            },
            type: 'primary'
          }
        ];
      } else if (message.toLowerCase().includes('status') || message.toLowerCase().includes('progress')) {
        aiResponse = `📊 **Current Status Overview**\n\n**Active Projects:** 2\n**Tasks in Progress:** 3\n**Completed This Week:** 5\n**Team Efficiency:** 87%\n\n**Recent Updates:**\n• Website Redesign: 65% complete\n• Mobile App: 15% complete\n\nWould you like a detailed report?`;
        actions = [
          {
            label: 'Generate Report',
            action: () => {
              addNotification({
                type: 'info',
                title: 'Report Generated',
                message: 'Detailed status report has been generated',
                userId: currentUser.id,
                relatedEntity: {
                  type: 'project',
                  id: 'report',
                  name: 'Status Report'
                }
              });
            },
            type: 'secondary'
          }
        ];
      } else {
        aiResponse = `I understand you're asking about "${message}". I can help you with:\n\n• Creating tasks and projects\n• Checking project status\n• Analyzing team performance\n• Managing deadlines\n• Generating reports\n\nTry being more specific, like "Create a task for..." or "What's the status of..."`;
      }
      
      // Add AI response
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai' as const,
        content: aiResponse,
        timestamp: new Date().toISOString(),
        actions
      };
      setConversationHistory(prev => [...prev, aiMessage]);
      
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai' as const,
        content: 'I apologize, but I encountered an error processing your request. Please try rephrasing your question.',
        timestamp: new Date().toISOString()
      };
      setConversationHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateTaskSuggestions = async (projectId: string) => {
    setIsProcessing(true);
    
    setTimeout(() => {
      const newSuggestion: AISuggestion = {
        id: Date.now().toString(),
        type: 'task_creation',
        title: 'AI Task Suggestions',
        description: 'Based on project analysis, I suggest creating 3 additional tasks to improve project completeness',
        confidence: 85,
        data: { 
          projectId,
          suggestedTasks: [
            { name: 'User acceptance testing', priority: 'High', estimatedHours: 8 },
            { name: 'Performance optimization', priority: 'Medium', estimatedHours: 12 },
            { name: 'Documentation update', priority: 'Low', estimatedHours: 4 }
          ]
        },
        status: 'pending',
        priority: 'medium',
        actionable: true,
        estimatedImpact: 'Improved project completeness and quality',
        createdAt: new Date().toISOString()
      };
      
      setSuggestions(prev => [newSuggestion, ...prev]);
      setIsProcessing(false);

      addNotification({
        type: 'info',
        title: 'AI Suggestions Generated',
        message: 'New task suggestions are available for review',
        userId: currentUser.id,
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
        userId: currentUser.id,
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
    return new Promise((resolve) => {
      setTimeout(() => {
        let result: any = {};
        
        if (input.toLowerCase().includes('create') && input.toLowerCase().includes('task')) {
          result = {
            intent: 'create_task',
            entities: {
              taskName: extractTaskName(input),
              assignee: extractAssignee(input),
              priority: extractPriority(input) || 'medium',
              dueDate: extractDate(input)
            },
            confidence: 0.87
          };
        } else if (input.toLowerCase().includes('status') || input.toLowerCase().includes('progress')) {
          result = {
            intent: 'status_query',
            entities: {},
            confidence: 0.92
          };
        } else {
          result = {
            intent: 'general_query',
            entities: {},
            confidence: 0.65
          };
        }
        
        resolve(result);
      }, 1000);
    });
  };

  const generateMeetingSummary = async (transcript: string): Promise<string> => {
    setIsProcessing(true);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const summary = `**Meeting Summary**\n\n**Key Points:**\n• Project timeline review\n• Resource allocation discussion\n• Budget review\n\n**Action Items:**\n• Complete design mockups by Friday\n• Review code and provide feedback\n• Schedule follow-up meeting`;
        setIsProcessing(false);
        resolve(summary);
      }, 3000);
    });
  };

  const suggestTaskPriority = async (taskData: any): Promise<string> => {
    setIsProcessing(true);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        let priority = 'Medium';
        
        if (taskData.dueDate) {
          const daysUntilDue = Math.ceil((new Date(taskData.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          if (daysUntilDue <= 2) priority = 'High';
          else if (daysUntilDue <= 7) priority = 'Medium';
          else priority = 'Low';
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
        resolve(anomalies);
      }, 2000);
    });
  };

  // Helper functions for NLP
  const extractTaskName = (input: string): string => {
    const match = input.match(/task\s+(?:for\s+|called\s+)?["']?([^"']+)["']?/i);
    return match ? match[1].trim() : 'New Task';
  };

  const extractAssignee = (input: string): string | null => {
    const match = input.match(/assign\s+(?:to\s+)?(\w+\s+\w+)/i);
    return match ? match[1] : null;
  };

  const extractPriority = (input: string): string | null => {
    if (input.toLowerCase().includes('urgent') || input.toLowerCase().includes('high')) return 'High';
    if (input.toLowerCase().includes('low')) return 'Low';
    return null;
  };

  const extractDate = (input: string): string | null => {
    const match = input.match(/(?:by\s+|due\s+|on\s+)(\w+\s+\d+)/i);
    return match ? match[1] : null;
  };

  return (
    <AIContext.Provider value={{
      suggestions,
      insights,
      analysis,
      isProcessing,
      conversationHistory,
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
      detectAnomalies,
      sendMessage
    }}>
      {children}
    </AIContext.Provider>
  );
};