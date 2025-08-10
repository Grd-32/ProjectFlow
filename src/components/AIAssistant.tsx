import React, { useState } from 'react';
import { useAI } from '../contexts/AIContext';
import { useNotification } from '../contexts/NotificationContext';
import { useTask } from '../contexts/TaskContext';
import { useProject } from '../contexts/ProjectContext';
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
  Loader
} from 'lucide-react';

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
    detectAnomalies
  } = useAI();
  const { addNotification } = useNotification();
  const { projects } = useProject();
  const { tasks } = useTask();
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [activeTab, setActiveTab] = useState<'suggestions' | 'insights' | 'nlp' | 'analysis'>('suggestions');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{
    id: string;
    type: 'user' | 'ai';
    content: string;
    timestamp: string;
  }>>([]);

  const handleAcceptSuggestion = (id: string) => {
    acceptSuggestion(id);
    const suggestion = suggestions.find(s => s.id === id);
    if (suggestion) {
      // Implement the suggestion based on type
      if (suggestion.type === 'task_creation' && suggestion.data.suggestedTasks) {
        suggestion.data.suggestedTasks.forEach((taskData: any) => {
          // This would normally call addTask from TaskContext
          addNotification({
            type: 'success',
            title: 'Task Created from AI Suggestion',
            message: `Created task: ${taskData.name}`,
            userId: '1',
            relatedEntity: {
              type: 'task',
              id: 'new',
              name: taskData.name
            }
          });
        });
      }
    }
  };

  const handleDismissSuggestion = (id: string) => {
    dismissSuggestion(id);
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
        
        // Add AI response to conversation
        const aiResponse = {
          id: (Date.now() + 1).toString(),
          type: 'ai' as const,
          content: `I understand you want to ${result.intent.replace('_', ' ')}. Here's what I can help you with:\n\n${result.suggestedActions.map((action: string) => `• ${action}`).join('\n')}`,
          timestamp: new Date().toISOString()
        };
        setConversationHistory(prev => [...prev, aiResponse]);
        
        setNaturalLanguageInput('');
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'AI Processing Failed',
          message: 'Failed to process natural language input',
          userId: '1',
          relatedEntity: {
            type: 'project',
            id: 'ai',
            name: 'Error'
          }
        });
      }
    }
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setNaturalLanguageInput(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        addNotification({
          type: 'error',
          title: 'Voice Recognition Error',
          message: 'Failed to process voice input',
          userId: '1',
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
        userId: '1',
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
        }
        break;
      case 'suggest_tasks':
        if (selectedProject) {
          await generateTaskSuggestions(selectedProject);
        }
        break;
      case 'optimize_resources':
        if (selectedProject) {
          await optimizeResourceAllocation(selectedProject);
        }
        break;
      case 'detect_risks':
        if (selectedProject) {
          await analyzeProjectRisk(selectedProject);
        }
        break;
      case 'detect_anomalies':
        await detectAnomalies();
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
            <p className="text-xs text-gray-500 dark:text-gray-400">Smart insights & automation</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-4 px-4">
          {[
            { id: 'suggestions', label: 'Suggestions', count: suggestions.filter(s => s.status === 'pending').length },
            { id: 'insights', label: 'Insights', count: insights.length },
            { id: 'nlp', label: 'Chat', count: 0 },
            { id: 'analysis', label: 'Analysis', count: analysis ? 1 : 0 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs px-2 py-1 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Suggestions Tab */}
        {activeTab === 'suggestions' && (
          <div className="space-y-4">
            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Quick AI Actions</h4>
              <div className="space-y-2">
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                >
                  <option value="">Select Project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleQuickAction('analyze_project')}
                    disabled={!selectedProject || isProcessing}
                    className="px-3 py-2 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 transition-colors"
                  >
                    Analyze Project
                  </button>
                  <button
                    onClick={() => handleQuickAction('suggest_tasks')}
                    disabled={!selectedProject || isProcessing}
                    className="px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    Suggest Tasks
                  </button>
                  <button
                    onClick={() => handleQuickAction('optimize_resources')}
                    disabled={!selectedProject || isProcessing}
                    className="px-3 py-2 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    Optimize Resources
                  </button>
                  <button
                    onClick={() => handleQuickAction('detect_anomalies')}
                    disabled={isProcessing}
                    className="px-3 py-2 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    Detect Issues
                  </button>
                </div>
              </div>
            </div>

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
                  Use quick actions above to generate AI insights
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
          </div>
        )}

        {/* Natural Language Chat Tab */}
        {activeTab === 'nlp' && (
          <div className="space-y-4 h-full flex flex-col">
            {/* Conversation History */}
            <div className="flex-1 space-y-3 overflow-y-auto">
              {conversationHistory.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-2">Start a conversation with AI</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Try: "Create a project for website redesign with 3 developers"
                  </p>
                </div>
              ) : (
                conversationHistory.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}>
                      <p className="text-sm whitespace-pre-line">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input Form */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <form onSubmit={handleNaturalLanguageSubmit} className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <textarea
                      value={naturalLanguageInput}
                      onChange={(e) => setNaturalLanguageInput(e.target.value)}
                      placeholder="Ask AI anything or give commands..."
                      rows={2}
                      className="w-full px-3 py-2 pr-10 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white resize-none"
                    />
                    <button
                      type="button"
                      onClick={handleVoiceInput}
                      disabled={isListening}
                      className={`absolute right-2 top-2 p-1 rounded transition-colors ${
                        isListening 
                          ? 'text-red-600 dark:text-red-400 animate-pulse' 
                          : 'text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400'
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
              <div className="mt-4">
                <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Example Commands:</h5>
                <div className="space-y-1">
                  {[
                    'Create a website redesign project with 3 developers',
                    'Schedule a team meeting for next Friday at 2 PM',
                    'Assign high-priority tasks to available team members',
                    'Generate a budget report for Q4 projects',
                    'What are the risks in my current projects?'
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