import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface AISuggestion {
  id: string;
  type: 'task_creation' | 'deadline_prediction' | 'resource_allocation' | 'risk_detection' | 'optimization';
  title: string;
  description: string;
  confidence: number;
  data: any;
  status: 'pending' | 'accepted' | 'dismissed';
  createdAt: string;
}

export interface AIInsight {
  id: string;
  category: 'productivity' | 'budget' | 'timeline' | 'team' | 'risk';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
  recommendations: string[];
  createdAt: string;
}

interface AIContextType {
  suggestions: AISuggestion[];
  insights: AIInsight[];
  isProcessing: boolean;
  generateTaskSuggestions: (projectId: string) => Promise<void>;
  predictDeadline: (taskId: string) => Promise<string>;
  analyzeProjectRisk: (projectId: string) => Promise<AIInsight[]>;
  optimizeResourceAllocation: (projectId: string) => Promise<AISuggestion[]>;
  acceptSuggestion: (id: string) => void;
  dismissSuggestion: (id: string) => void;
  processNaturalLanguage: (input: string) => Promise<any>;
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
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([
    {
      id: '1',
      type: 'deadline_prediction',
      title: 'Deadline Risk Detected',
      description: 'Based on current progress, "Design new landing page" may be delayed by 3 days',
      confidence: 85,
      data: { taskId: '1', predictedDelay: 3, currentProgress: 45 },
      status: 'pending',
      createdAt: '2024-12-11T10:00:00Z'
    },
    {
      id: '2',
      type: 'resource_allocation',
      title: 'Resource Optimization',
      description: 'Sarah Chen has 20% available capacity that could be allocated to high-priority tasks',
      confidence: 92,
      data: { userId: '2', availableCapacity: 20, suggestedTasks: ['4', '6'] },
      status: 'pending',
      createdAt: '2024-12-11T11:30:00Z'
    }
  ]);

  const [insights, setInsights] = useState<AIInsight[]>([
    {
      id: '1',
      category: 'productivity',
      title: 'Team Productivity Trend',
      description: 'Team productivity has increased by 15% this month compared to last month',
      impact: 'medium',
      actionable: true,
      recommendations: [
        'Continue current workflow practices',
        'Consider expanding successful strategies to other teams',
        'Document best practices for future reference'
      ],
      createdAt: '2024-12-11T09:00:00Z'
    },
    {
      id: '2',
      category: 'budget',
      title: 'Budget Variance Alert',
      description: 'Website Redesign project is trending 12% over budget due to scope changes',
      impact: 'high',
      actionable: true,
      recommendations: [
        'Review and approve pending change requests',
        'Negotiate scope reduction with stakeholders',
        'Allocate additional budget if ROI justifies'
      ],
      createdAt: '2024-12-11T12:00:00Z'
    }
  ]);

  const [isProcessing, setIsProcessing] = useState(false);

  const generateTaskSuggestions = async (projectId: string) => {
    setIsProcessing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const newSuggestion: AISuggestion = {
        id: Date.now().toString(),
        type: 'task_creation',
        title: 'Suggested Tasks for Project',
        description: 'AI suggests creating 3 additional tasks based on project scope and similar projects',
        confidence: 78,
        data: { 
          projectId,
          suggestedTasks: [
            'User acceptance testing',
            'Performance optimization',
            'Documentation update'
          ]
        },
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      setSuggestions(prev => [newSuggestion, ...prev]);
      setIsProcessing(false);
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
            title: 'Project Risk Analysis',
            description: 'Medium risk detected due to resource constraints and timeline pressure',
            impact: 'medium',
            actionable: true,
            recommendations: [
              'Add additional developer to critical path',
              'Consider scope reduction for non-essential features',
              'Implement daily standups for better coordination'
            ],
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
            description: 'Redistribute tasks to balance workload and improve delivery timeline',
            confidence: 88,
            data: { 
              projectId,
              reallocation: [
                { from: 'Mike Johnson', to: 'Alex Rodriguez', tasks: ['Task A', 'Task B'] },
                { from: 'Sarah Chen', to: 'Emily Davis', tasks: ['Task C'] }
              ]
            },
            status: 'pending',
            createdAt: new Date().toISOString()
          }
        ];
        
        setSuggestions(prev => [...optimizationSuggestions, ...prev]);
        setIsProcessing(false);
        resolve(optimizationSuggestions);
      }, 3000);
    });
  };

  const acceptSuggestion = (id: string) => {
    setSuggestions(prev => prev.map(suggestion => 
      suggestion.id === id 
        ? { ...suggestion, status: 'accepted' as const }
        : suggestion
    ));
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
        // Simulate NLP processing
        const result = {
          intent: 'create_project',
          entities: {
            projectName: 'Marketing Campaign',
            teamSize: 5,
            duration: '1 month',
            priority: 'high'
          },
          confidence: 0.92
        };
        
        setIsProcessing(false);
        resolve(result);
      }, 1500);
    });
  };

  return (
    <AIContext.Provider value={{
      suggestions,
      insights,
      isProcessing,
      generateTaskSuggestions,
      predictDeadline,
      analyzeProjectRisk,
      optimizeResourceAllocation,
      acceptSuggestion,
      dismissSuggestion,
      processNaturalLanguage
    }}>
      {children}
    </AIContext.Provider>
  );
};