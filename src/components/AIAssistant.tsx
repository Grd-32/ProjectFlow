import React, { useState } from 'react';
import { useAI } from '../contexts/AIContext';
import { useNotification } from '../contexts/NotificationContext';
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
  Clock
} from 'lucide-react';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onClose }) => {
  const { 
    suggestions, 
    insights, 
    isProcessing, 
    acceptSuggestion, 
    dismissSuggestion,
    processNaturalLanguage 
  } = useAI();
  const { addNotification } = useNotification();
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [activeTab, setActiveTab] = useState<'suggestions' | 'insights' | 'nlp'>('suggestions');

  const handleAcceptSuggestion = (id: string) => {
    acceptSuggestion(id);
    const suggestion = suggestions.find(s => s.id === id);
    if (suggestion) {
      addNotification({
        type: 'success',
        title: 'AI Suggestion Accepted',
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

  const handleDismissSuggestion = (id: string) => {
    dismissSuggestion(id);
  };

  const handleNaturalLanguageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (naturalLanguageInput.trim()) {
      try {
        const result = await processNaturalLanguage(naturalLanguageInput);
        addNotification({
          type: 'info',
          title: 'AI Processing Complete',
          message: `Processed: "${naturalLanguageInput}"`,
          userId: '1',
          relatedEntity: {
            type: 'project',
            id: 'ai',
            name: 'Natural Language Processing'
          }
        });
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
      default:
        return <Lightbulb className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
    }
  };

  const getInsightIcon = (category: string) => {
    switch (category) {
      case 'productivity':
        return <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'budget':
        return <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      case 'timeline':
        return <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case 'team':
        return <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
      case 'risk':
        return <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      default:
        return <Brain className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
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
            <p className="text-xs text-gray-500 dark:text-gray-400">Smart insights & suggestions</p>
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
            { id: 'nlp', label: 'Ask AI', count: 0 }
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
            {suggestions.filter(s => s.status === 'pending').map((suggestion) => (
              <div key={suggestion.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex-shrink-0">
                    {getSuggestionIcon(suggestion.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      {suggestion.title}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {suggestion.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Confidence: {suggestion.confidence}%
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAcceptSuggestion(suggestion.id)}
                          className="p-1 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded"
                        >
                          <ThumbsUp className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDismissSuggestion(suggestion.id)}
                          className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                        >
                          <ThumbsDown className="h-3 w-3" />
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

        {/* Natural Language Processing Tab */}
        {activeTab === 'nlp' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Ask AI Assistant
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                Use natural language to create tasks, projects, or get insights.
              </p>
              
              <form onSubmit={handleNaturalLanguageSubmit} className="space-y-3">
                <textarea
                  value={naturalLanguageInput}
                  onChange={(e) => setNaturalLanguageInput(e.target.value)}
                  placeholder="e.g., 'Create a project to launch a marketing campaign next month with 5 team members'"
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={!naturalLanguageInput.trim() || isProcessing}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4" />
                      <span>Process with AI</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="space-y-3">
              <h5 className="text-sm font-medium text-gray-900 dark:text-white">Example Commands:</h5>
              <div className="space-y-2">
                {[
                  'Create a website redesign project with 3 developers',
                  'Schedule a team meeting for next Friday at 2 PM',
                  'Assign high-priority tasks to available team members',
                  'Generate a budget report for Q4 projects'
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
        )}
      </div>
    </div>
  );
};

export default AIAssistant;