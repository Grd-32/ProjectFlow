import React, { useState, useRef, useEffect } from 'react';
import { useAI } from '../contexts/AIContext';
import { useNotification } from '../contexts/NotificationContext';
import { useTask } from '../contexts/TaskContext';
import { useProject } from '../contexts/ProjectContext';
import { useUser } from '../contexts/UserContext';
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  X,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  Target,
  Users,
  Clock,
  DollarSign,
  Zap,
  BarChart3,
  MessageSquare,
  Mic,
  MicOff,
  Send,
  Loader,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings,
  RefreshCw,
  Download,
  Upload,
  FileText,
  Calendar,
  User
} from 'lucide-react';
import { format } from 'date-fns';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onClose }) => {
  const { 
    suggestions, 
    insights, 
    analysis,
    isProcessing, 
    acceptSuggestion, 
    dismissSuggestion,
    processNaturalLanguage,
    generateTaskSuggestions,
    analyzeProjectRisk,
    optimizeResourceAllocation,
    generateProjectAnalysis,
    generateMeetingSummary,
    detectAnomalies,
    predictDeadline,
    suggestTaskPriority
  } = useAI();
  const { addNotification } = useNotification();
  const { projects } = useProject();
  const { tasks, addTask } = useTask();
  const { currentUser } = useUser();
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'suggestions' | 'insights' | 'analysis' | 'tools'>('chat');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
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
  const [voiceSettings, setVoiceSettings] = useState({
    enabled: true,
    language: 'en-US',
    autoSpeak: false
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationHistory]);

  const handleAcceptSuggestion = (id: string) => {
    acceptSuggestion(id);
    const suggestion = suggestions.find(s => s.id === id);
    if (suggestion) {
      // Implement the suggestion based on type
      if (suggestion.type === 'task_creation' && suggestion.data.suggestedTasks) {
        suggestion.data.suggestedTasks.forEach((taskData: any) => {
          addTask({
            name: taskData.name,
            description: taskData.description,
            status: 'Pending',
            priority: taskData.priority,
            assignee: { name: currentUser.name, avatar: '', initials: currentUser.initials },
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            project: projects.find(p => p.id === suggestion.data.projectId)?.name || 'General',
            tags: [],
            estimatedHours: taskData.estimatedHours || 0,
            dependencies: [],
            subtasks: [],
            comments: [],
            attachments: []
          });
        });

        addNotification({
          type: 'success',
          title: 'AI Suggestion Implemented',
          message: `Created ${suggestion.data.suggestedTasks.length} tasks from AI suggestion`,
          userId: currentUser.id,
          relatedEntity: {
            type: 'task',
            id: 'ai-generated',
            name: 'AI Task Creation'
          }
        });
      }
    }
  };

  const handleDismissSuggestion = (id: string) => {
    dismissSuggestion(id);
    addNotification({
      type: 'info',
      title: 'AI Suggestion Dismissed',
      message: 'Suggestion has been dismissed',
      userId: currentUser.id,
      relatedEntity: {
        type: 'project',
        id: 'ai',
        name: 'AI Assistant'
      }
    });
  };

  const handleNaturalLanguageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (naturalLanguageInput.trim()) {
      // Add user message to conversation
      const userMessage = {
        id: Date.now().toString(),
        type: 'user' as const,
        content: naturalLanguageInput,
        timestamp: new Date().toISOString()
      };
      setConversationHistory(prev => [...prev, userMessage]);

      try {
        const result = await processNaturalLanguage(naturalLanguageInput);
        
        // Generate AI response based on intent
        let aiResponse = '';
        let actions: any[] = [];

        switch (result.intent) {
          case 'create_project':
            aiResponse = `I'll help you create a project called "${result.entities.projectName}". Here's what I suggest:\n\n• Team size: ${result.entities.teamSize} members\n• Duration: ${result.entities.duration}\n• Priority: ${result.entities.priority}\n\nWould you like me to create this project now?`;
            actions = [
              {
                label: 'Create Project',
                action: () => {
                  // This would create the actual project
                  addNotification({
                    type: 'success',
                    title: 'Project Created by AI',
                    message: `Project "${result.entities.projectName}" has been created`,
                    userId: currentUser.id,
                    relatedEntity: {
                      type: 'project',
                      id: 'ai-created',
                      name: result.entities.projectName
                    }
                  });
                },
                type: 'primary'
              }
            ];
            break;
          
          case 'create_task':
            aiResponse = `I'll create a task called "${result.entities.taskName}". Here are the details:\n\n• Assignee: ${result.entities.assignee || 'Unassigned'}\n• Priority: ${result.entities.priority}\n• Due date: ${result.entities.dueDate || 'Not set'}\n\nShall I proceed?`;
            actions = [
              {
                label: 'Create Task',
                action: () => {
                  addTask({
                    name: result.entities.taskName,
                    description: '',
                    status: 'Pending',
                    priority: result.entities.priority || 'Medium',
                    assignee: { 
                      name: result.entities.assignee || currentUser.name, 
                      avatar: '', 
                      initials: result.entities.assignee ? result.entities.assignee.split(' ').map((n: string) => n[0]).join('').toUpperCase() : currentUser.initials 
                    },
                    dueDate: result.entities.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    project: 'General',
                    tags: [],
                    estimatedHours: 0,
                    dependencies: [],
                    subtasks: [],
                    comments: [],
                    attachments: []
                  });

                  addNotification({
                    type: 'success',
                    title: 'Task Created by AI',
                    message: `Task "${result.entities.taskName}" has been created`,
                    userId: currentUser.id,
                    relatedEntity: {
                      type: 'task',
                      id: 'ai-created',
                      name: result.entities.taskName
                    }
                  });
                },
                type: 'primary'
              }
            ];
            break;

          case 'schedule_meeting':
            aiResponse = `I'll help you schedule "${result.entities.title}". Details:\n\n• Attendees: ${result.entities.attendees?.join(', ') || 'Not specified'}\n• Date: ${result.entities.date || 'Not specified'}\n• Duration: ${result.entities.duration}\n\nWould you like me to create this calendar event?`;
            actions = [
              {
                label: 'Create Meeting',
                action: () => {
                  addNotification({
                    type: 'info',
                    title: 'Meeting Scheduled by AI',
                    message: `Meeting "${result.entities.title}" has been scheduled`,
                    userId: currentUser.id,
                    relatedEntity: {
                      type: 'project',
                      id: 'calendar',
                      name: result.entities.title
                    }
                  });
                },
                type: 'primary'
              }
            ];
            break;

          case 'analyze_project':
            if (selectedProject) {
              await analyzeProjectRisk(selectedProject);
              aiResponse = `I've analyzed the selected project for risks and opportunities. Check the Insights tab for detailed analysis.`;
            } else {
              aiResponse = `I'd be happy to analyze a project for you! Please select a project first, then ask me to analyze it.`;
            }
            break;

          case 'generate_report':
            aiResponse = `I can generate various reports for you:\n\n• Project progress reports\n• Team productivity analysis\n• Budget utilization reports\n• Risk assessment reports\n\nWhich type of report would you like me to generate?`;
            break;

          default:
            aiResponse = `I understand you're asking about "${naturalLanguageInput}". Here's what I can help you with:\n\n${result.suggestedActions.map((action: string) => `• ${action}`).join('\n')}\n\nTry being more specific, like "Create a task for..." or "Analyze project risks"`;
        }
        
        // Add AI response to conversation
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai' as const,
          content: aiResponse,
          timestamp: new Date().toISOString(),
          actions
        };
        setConversationHistory(prev => [...prev, aiMessage]);
        
        setNaturalLanguageInput('');
      } catch (error) {
        const errorMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai' as const,
          content: 'I apologize, but I encountered an error processing your request. Please try rephrasing your question or try again later.',
          timestamp: new Date().toISOString()
        };
        setConversationHistory(prev => [...prev, errorMessage]);
      }
    }
  };

  const handleVoiceInput = () => {
    if (!voiceSettings.enabled) {
      addNotification({
        type: 'warning',
        title: 'Voice Input Disabled',
        message: 'Voice input is disabled in settings',
        userId: currentUser.id,
        relatedEntity: {
          type: 'project',
          id: 'ai',
          name: 'Voice Settings'
        }
      });
      return;
    }

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = voiceSettings.language;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setNaturalLanguageInput(transcript);
        setIsListening(false);
        
        if (voiceSettings.autoSpeak) {
          // Auto-submit voice input
          setTimeout(() => {
            const form = document.querySelector('form');
            if (form) {
              form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            }
          }, 500);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        addNotification({
          type: 'error',
          title: 'Voice Recognition Error',
          message: 'Failed to process voice input',
          userId: currentUser.id,
          relatedEntity: {
            type: 'project',
            id: 'ai',
            name: 'Voice Input'
          }
        });
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      addNotification({
        type: 'warning',
        title: 'Voice Input Not Supported',
        message: 'Your browser does not support voice recognition',
        userId: currentUser.id,
        relatedEntity: {
          type: 'project',
          id: 'ai',
          name: 'Voice Input'
        }
      });
    }
  };

  const handleQuickAction = async (action: string) => {
    switch (action) {
      case 'analyze_project':
        if (selectedProject) {
          await generateProjectAnalysis(selectedProject);
          const aiMessage = {
            id: Date.now().toString(),
            type: 'ai' as const,
            content: `I've completed a comprehensive analysis of your project. Check the Analysis tab for detailed insights including project health score, team performance metrics, and budget forecasts.`,
            timestamp: new Date().toISOString()
          };
          setConversationHistory(prev => [...prev, aiMessage]);
        }
        break;
      case 'suggest_tasks':
        if (selectedProject) {
          await generateTaskSuggestions(selectedProject);
          const aiMessage = {
            id: Date.now().toString(),
            type: 'ai' as const,
            content: `I've generated task suggestions for your project. Check the Suggestions tab to review and implement them.`,
            timestamp: new Date().toISOString()
          };
          setConversationHistory(prev => [...prev, aiMessage]);
        }
        break;
      case 'optimize_resources':
        if (selectedProject) {
          await optimizeResourceAllocation(selectedProject);
          const aiMessage = {
            id: Date.now().toString(),
            type: 'ai' as const,
            content: `I've analyzed your resource allocation and found optimization opportunities. Check the Suggestions tab for recommendations.`,
            timestamp: new Date().toISOString()
          };
          setConversationHistory(prev => [...prev, aiMessage]);
        }
        break;
      case 'detect_risks':
        if (selectedProject) {
          await analyzeProjectRisk(selectedProject);
          const aiMessage = {
            id: Date.now().toString(),
            type: 'ai' as const,
            content: `I've completed a risk analysis for your project. Check the Insights tab for detailed risk assessment and mitigation strategies.`,
            timestamp: new Date().toISOString()
          };
          setConversationHistory(prev => [...prev, aiMessage]);
        }
        break;
      case 'detect_anomalies':
        await detectAnomalies();
        const aiMessage = {
          id: Date.now().toString(),
          type: 'ai' as const,
          content: `I've scanned your projects for anomalies and unusual patterns. Check the Suggestions tab for any issues that need attention.`,
          timestamp: new Date().toISOString()
        };
        setConversationHistory(prev => [...prev, aiMessage]);
        break;
      case 'productivity_report':
        const productivityMessage = {
          id: Date.now().toString(),
          type: 'ai' as const,
          content: `📊 **Productivity Report**\n\n**This Week:**\n• Tasks completed: ${tasks.filter(t => t.status === 'Complete').length}\n• Average completion time: 2.3 days\n• Team efficiency: 87%\n\n**Recommendations:**\n• Focus on high-priority tasks first\n• Consider breaking down large tasks\n• Schedule regular check-ins`,
          timestamp: new Date().toISOString(),
          actions: [
            {
              label: 'Export Report',
              action: () => {
                addNotification({
                  type: 'info',
                  title: 'Report Exported',
                  message: 'Productivity report has been exported',
                  userId: currentUser.id,
                  relatedEntity: {
                    type: 'project',
                    id: 'report',
                    name: 'Productivity Report'
                  }
                });
              },
              type: 'secondary'
            }
          ]
        };
        setConversationHistory(prev => [...prev, productivityMessage]);
        break;
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'task_creation':
        return <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case 'deadline_prediction':
        return <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />;
      case 'resource_allocation':
        return <Users className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'risk_detection':
        return <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case 'budget_alert':
        return <DollarSign className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      case 'workflow_improvement':
        return <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
      default:
        return <Lightbulb className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
    }
  };

  const getInsightIcon = (category: string) => {
    switch (category) {
      case 'productivity':
        return <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'budget':
        return <DollarSign className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      case 'timeline':
        return <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case 'team':
        return <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
      case 'risk':
        return <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case 'performance':
        return <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />;
      default:
        return <Brain className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const quickActions = [
    { id: 'analyze_project', label: 'Analyze Project', icon: BarChart3, requiresProject: true },
    { id: 'suggest_tasks', label: 'Suggest Tasks', icon: Target, requiresProject: true },
    { id: 'optimize_resources', label: 'Optimize Resources', icon: Users, requiresProject: true },
    { id: 'detect_risks', label: 'Detect Risks', icon: AlertTriangle, requiresProject: true },
    { id: 'detect_anomalies', label: 'Find Issues', icon: Zap, requiresProject: false },
    { id: 'productivity_report', label: 'Productivity Report', icon: TrendingUp, requiresProject: false }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed right-4 bottom-20 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col z-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">AI Assistant</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isProcessing ? 'Processing...' : 'Ready to help'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setVoiceSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
            className={`p-1 rounded transition-colors ${
              voiceSettings.enabled 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-gray-400 dark:text-gray-500'
            }`}
            title={voiceSettings.enabled ? 'Voice enabled' : 'Voice disabled'}
          >
            {voiceSettings.enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-1 px-4">
          {[
            { id: 'chat', label: 'Chat', icon: MessageSquare },
            { id: 'suggestions', label: 'Suggestions', icon: Lightbulb, count: suggestions.filter(s => s.status === 'pending').length },
            { id: 'insights', label: 'Insights', icon: TrendingUp, count: insights.length },
            { id: 'analysis', label: 'Analysis', icon: BarChart3 },
            { id: 'tools', label: 'Tools', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-2 border-b-2 font-medium text-xs flex items-center space-x-1 ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="h-3 w-3" />
              <span>{tab.label}</span>
              {tab.count && tab.count > 0 && (
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs px-1 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="space-y-4 h-full flex flex-col">
            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-3">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Quick Actions</h4>
              <div className="space-y-2">
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full px-2 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 text-gray-900 dark:text-white"
                >
                  <option value="">Select Project (Optional)</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-1">
                  {quickActions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleQuickAction(action.id)}
                      disabled={action.requiresProject && !selectedProject || isProcessing}
                      className="flex items-center space-x-1 px-2 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                    >
                      <action.icon className="h-3 w-3" />
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Conversation History */}
            <div className="flex-1 space-y-3 overflow-y-auto">
              {conversationHistory.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-lg ${
                    message.type === 'user' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}>
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {format(new Date(message.timestamp), 'HH:mm')}
                    </p>
                    
                    {/* Action Buttons */}
                    {message.actions && message.actions.length > 0 && (
                      <div className="flex space-x-2 mt-2">
                        {message.actions.map((action, index) => (
                          <button
                            key={index}
                            onClick={action.action}
                            className={`px-2 py-1 text-xs rounded transition-colors ${
                              action.type === 'primary'
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                            }`}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <form onSubmit={handleNaturalLanguageSubmit} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <textarea
                      value={naturalLanguageInput}
                      onChange={(e) => setNaturalLanguageInput(e.target.value)}
                      placeholder="Ask AI anything or give commands..."
                      rows={2}
                      className="w-full px-3 py-2 pr-10 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white resize-none"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleNaturalLanguageSubmit(e);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleVoiceInput}
                      disabled={isListening || !voiceSettings.enabled}
                      className={`absolute right-2 top-2 p-1 rounded transition-colors ${
                        isListening 
                          ? 'text-red-600 dark:text-red-400 animate-pulse' 
                          : voiceSettings.enabled
                          ? 'text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                      title="Voice input"
                    >
                      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!naturalLanguageInput.trim() || isProcessing}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Send to AI</span>
                    </>
                  )}
                </button>
              </form>

              {/* Example Commands */}
              <div className="mt-3">
                <h5 className="text-xs font-medium text-gray-900 dark:text-white mb-2">Try these commands:</h5>
                <div className="space-y-1">
                  {[
                    'Create a task for website testing',
                    'Analyze risks in Website Redesign project',
                    'Generate a productivity report',
                    'Optimize resource allocation',
                    'What are my overdue tasks?'
                  ].map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setNaturalLanguageInput(example)}
                      className="w-full text-left p-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      "{example}"
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Suggestions Tab */}
        {activeTab === 'suggestions' && (
          <div className="space-y-4">
            {suggestions.filter(s => s.status === 'pending').map((suggestion) => (
              <div key={suggestion.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex-shrink-0">
                    {getSuggestionIcon(suggestion.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {suggestion.title}
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(suggestion.priority)}`}>
                        {suggestion.priority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {suggestion.description}
                    </p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Confidence: {suggestion.confidence}%
                      </span>
                      <span className="text-xs text-blue-600 dark:text-blue-400">
                        {suggestion.estimatedImpact}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAcceptSuggestion(suggestion.id)}
                          className="flex items-center space-x-1 px-3 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                        >
                          <ThumbsUp className="h-3 w-3" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => handleDismissSuggestion(suggestion.id)}
                          className="flex items-center space-x-1 px-3 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                        >
                          <ThumbsDown className="h-3 w-3" />
                          <span>Dismiss</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {suggestions.filter(s => s.status === 'pending').length === 0 && (
              <div className="text-center py-8">
                <Sparkles className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No new suggestions</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Use quick actions or ask me to analyze your projects
                </p>
              </div>
            )}
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="space-y-4">
            {insights.map((insight) => (
              <div key={insight.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                    {getInsightIcon(insight.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {insight.title}
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        insight.impact === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                        insight.impact === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                        'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                      }`}>
                        {insight.impact} impact
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {insight.description}
                    </p>
                    
                    {/* Metrics */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded p-2 mb-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">Current: {insight.metrics.current}</span>
                        <span className="text-gray-600 dark:text-gray-400">Target: {insight.metrics.target}</span>
                        <span className={`flex items-center ${
                          insight.metrics.trend === 'up' ? 'text-green-600' :
                          insight.metrics.trend === 'down' ? 'text-red-600' :
                          'text-gray-600'
                        }`}>
                          <TrendingUp className={`h-3 w-3 mr-1 ${insight.metrics.trend === 'down' ? 'rotate-180' : ''}`} />
                          {insight.metrics.trend}
                        </span>
                      </div>
                    </div>

                    {insight.recommendations.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Recommendations:</p>
                        {insight.recommendations.map((rec, index) => (
                          <p key={index} className="text-xs text-gray-600 dark:text-gray-400 pl-2">
                            • {rec}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {insights.length === 0 && (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No insights available</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Generate insights by analyzing your projects
                </p>
              </div>
            )}
          </div>
        )}

        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="space-y-4">
            {analysis ? (
              <div className="space-y-4">
                {/* Project Health */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    Project Health Score
                  </h4>
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {analysis.projectHealth.score}/100
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${analysis.projectHealth.score}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Positive Factors:</p>
                    {analysis.projectHealth.factors.map((factor, index) => (
                      <p key={index} className="text-xs text-green-600 dark:text-green-400">• {factor}</p>
                    ))}
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-2">Risk Areas:</p>
                    {analysis.projectHealth.risks.map((risk, index) => (
                      <p key={index} className="text-xs text-red-600 dark:text-red-400">• {risk}</p>
                    ))}
                  </div>
                </div>

                {/* Team Performance */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                    <Users className="h-4 w-4 mr-2 text-blue-600" />
                    Team Performance
                  </h4>
                  <div className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {analysis.teamPerformance.efficiency}% Efficiency
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Bottlenecks:</p>
                    {analysis.teamPerformance.bottlenecks.map((bottleneck, index) => (
                      <p key={index} className="text-xs text-yellow-600 dark:text-yellow-400">• {bottleneck}</p>
                    ))}
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-2">Recommendations:</p>
                    {analysis.teamPerformance.recommendations.map((rec, index) => (
                      <p key={index} className="text-xs text-blue-600 dark:text-blue-400">• {rec}</p>
                    ))}
                  </div>
                </div>

                {/* Budget Forecast */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-yellow-600" />
                    Budget Forecast
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Projected Spend:</span>
                      <span className="text-xs font-medium text-gray-900 dark:text-white">
                        ${analysis.budgetForecast.projectedSpend.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Variance:</span>
                      <span className={`text-xs font-medium ${
                        analysis.budgetForecast.variance > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {analysis.budgetForecast.variance > 0 ? '+' : ''}${analysis.budgetForecast.variance.toLocaleString()}
                      </span>
                    </div>
                    <div className="space-y-1 mt-2">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Alerts:</p>
                      {analysis.budgetForecast.alerts.map((alert, index) => (
                        <p key={index} className="text-xs text-orange-600 dark:text-orange-400">• {alert}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">No analysis available</p>
                <button
                  onClick={() => selectedProject && handleQuickAction('analyze_project')}
                  disabled={!selectedProject || isProcessing}
                  className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  Generate Analysis
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tools Tab */}
        {activeTab === 'tools' && (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">AI Tools & Settings</h4>
              
              {/* Voice Settings */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Voice Input</span>
                  <button
                    onClick={() => setVoiceSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      voiceSettings.enabled ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        voiceSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Auto-speak Responses</span>
                  <button
                    onClick={() => setVoiceSettings(prev => ({ ...prev, autoSpeak: !prev.autoSpeak }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      voiceSettings.autoSpeak ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        voiceSettings.autoSpeak ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Language</label>
                  <select
                    value={voiceSettings.language}
                    onChange={(e) => setVoiceSettings(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                  >
                    <option value="en-US">English (US)</option>
                    <option value="en-GB">English (UK)</option>
                    <option value="es-ES">Spanish</option>
                    <option value="fr-FR">French</option>
                    <option value="de-DE">German</option>
                  </select>
                </div>
              </div>
            </div>

            {/* AI Capabilities */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">AI Capabilities</h4>
              <div className="space-y-2">
                {[
                  { icon: Target, label: 'Task Creation & Management', description: 'Create and organize tasks intelligently' },
                  { icon: BarChart3, label: 'Project Analysis', description: 'Deep project health and performance analysis' },
                  { icon: AlertTriangle, label: 'Risk Detection', description: 'Identify potential project risks early' },
                  { icon: Users, label: 'Resource Optimization', description: 'Optimize team allocation and workload' },
                  { icon: Clock, label: 'Deadline Prediction', description: 'Predict realistic completion dates' },
                  { icon: TrendingUp, label: 'Performance Insights', description: 'Generate productivity and efficiency insights' }
                ].map((capability, index) => (
                  <div key={index} className="flex items-start space-x-3 p-2 bg-white dark:bg-gray-800 rounded">
                    <capability.icon className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-gray-900 dark:text-white">{capability.label}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{capability.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Export/Import */}
            <div className="space-y-2">
              <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="h-4 w-4" />
                <span>Export AI Data</span>
              </button>
              <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                <RefreshCw className="h-4 w-4" />
                <span>Reset AI Learning</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-90 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">AI is thinking...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;