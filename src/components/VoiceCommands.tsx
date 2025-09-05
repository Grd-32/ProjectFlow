import React, { useState, useEffect } from 'react';
import { useTask } from '../contexts/TaskContext';
import { useProject } from '../contexts/ProjectContext';
import { useNotification } from '../contexts/NotificationContext';
import { Mic, MicOff, Volume2, VolumeX, Settings } from 'lucide-react';

interface VoiceCommandsProps {
  isEnabled: boolean;
  onToggle: () => void;
}

const VoiceCommands: React.FC<VoiceCommandsProps> = ({ isEnabled, onToggle }) => {
  const { addTask } = useTask();
  const { addProject } = useProject();
  const { addNotification } = useNotification();
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [lastCommand, setLastCommand] = useState<string>('');

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        setIsListening(true);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
        if (isEnabled) {
          // Restart listening if enabled
          setTimeout(() => {
            try {
              recognitionInstance.start();
            } catch (error) {
              console.log('Recognition restart failed:', error);
            }
          }, 1000);
        }
      };

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
        setLastCommand(transcript);
        processVoiceCommand(transcript);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  useEffect(() => {
    if (recognition && isEnabled) {
      try {
        recognition.start();
      } catch (error) {
        console.log('Recognition start failed:', error);
      }
    } else if (recognition && !isEnabled) {
      recognition.stop();
      setIsListening(false);
    }
  }, [isEnabled, recognition]);

  const processVoiceCommand = (command: string) => {
    // Task creation commands
    if (command.includes('create task') || command.includes('new task') || command.includes('add task')) {
      const taskName = extractTaskName(command);
      const priority = extractPriority(command);
      const assignee = extractAssignee(command);
      
      if (taskName) {
        addTask({
          name: taskName,
          description: `Created via voice command: "${command}"`,
          status: 'Pending',
          priority: priority || 'Medium',
          assignee: {
            name: assignee || 'John Doe',
            avatar: '',
            initials: (assignee || 'John Doe').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
          },
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          project: 'Voice Commands',
          tags: ['voice-created'],
          estimatedHours: 0,
          dependencies: [],
          subtasks: [],
          comments: [],
          attachments: []
        });

        addNotification({
          type: 'success',
          title: 'Task Created by Voice',
          message: `Task "${taskName}" created successfully`,
          userId: '1',
          relatedEntity: {
            type: 'task',
            id: 'voice-created',
            name: taskName
          }
        });

        speak(`Task "${taskName}" has been created successfully.`);
      }
    }
    
    // Project creation commands
    else if (command.includes('create project') || command.includes('new project')) {
      const projectName = extractProjectName(command);
      
      if (projectName) {
        addProject({
          name: projectName,
          description: `Created via voice command: "${command}"`,
          status: 'Planning',
          priority: 'Medium',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          budget: 0,
          spent: 0,
          progress: 0,
          manager: { name: 'John Doe', initials: 'JD' },
          team: [],
          milestones: [],
          risks: [],
          changes: []
        });

        addNotification({
          type: 'success',
          title: 'Project Created by Voice',
          message: `Project "${projectName}" created successfully`,
          userId: '1',
          relatedEntity: {
            type: 'project',
            id: 'voice-created',
            name: projectName
          }
        });

        speak(`Project "${projectName}" has been created successfully.`);
      }
    }
    
    // Status update commands
    else if (command.includes('mark') && command.includes('complete')) {
      addNotification({
        type: 'info',
        title: 'Voice Command Recognized',
        message: 'Task completion command recognized. Please specify which task.',
        userId: '1',
        relatedEntity: {
          type: 'task',
          id: 'voice-command',
          name: 'Voice Command'
        }
      });
      speak('Which task would you like to mark as complete?');
    }
    
    // Help commands
    else if (command.includes('help') || command.includes('what can you do')) {
      const helpMessage = 'I can help you create tasks and projects. Try saying "create task for website design" or "new project called mobile app".';
      addNotification({
        type: 'info',
        title: 'Voice Commands Help',
        message: helpMessage,
        userId: '1',
        relatedEntity: {
          type: 'project',
          id: 'voice-help',
          name: 'Voice Help'
        }
      });
      speak(helpMessage);
    }
    
    // Unknown command
    else {
      addNotification({
        type: 'warning',
        title: 'Command Not Recognized',
        message: `Command "${command}" not recognized. Try "create task" or "new project".`,
        userId: '1',
        relatedEntity: {
          type: 'project',
          id: 'voice-error',
          name: 'Voice Command'
        }
      });
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const extractTaskName = (command: string): string | null => {
    const patterns = [
      /create task (?:for |called |named )?(.+)/i,
      /new task (?:for |called |named )?(.+)/i,
      /add task (?:for |called |named )?(.+)/i
    ];
    
    for (const pattern of patterns) {
      const match = command.match(pattern);
      if (match) {
        return match[1].trim().replace(/\b(with|for|assigned to)\b.*$/i, '').trim();
      }
    }
    return null;
  };

  const extractProjectName = (command: string): string | null => {
    const patterns = [
      /create project (?:for |called |named )?(.+)/i,
      /new project (?:for |called |named )?(.+)/i
    ];
    
    for (const pattern of patterns) {
      const match = command.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    return null;
  };

  const extractPriority = (command: string): string | null => {
    if (command.includes('high priority') || command.includes('urgent')) return 'High';
    if (command.includes('low priority')) return 'Low';
    return null;
  };

  const extractAssignee = (command: string): string | null => {
    const match = command.match(/assign(?:ed)? to (\w+(?:\s+\w+)?)/i);
    return match ? match[1] : null;
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className={`p-3 rounded-lg shadow-lg border ${
        isEnabled 
          ? isListening
            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      }`}>
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleVoiceCommands}
            className={`p-2 rounded-lg transition-colors ${
              isEnabled 
                ? isListening
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
            title={isEnabled ? 'Disable voice commands' : 'Enable voice commands'}
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>
          <div>
            <p className={`text-sm font-medium ${
              isEnabled 
                ? isListening
                  ? 'text-red-900 dark:text-red-100'
                  : 'text-blue-900 dark:text-blue-100'
                : 'text-gray-900 dark:text-gray-100'
            }`}>
              {isListening ? 'Listening...' : isEnabled ? 'Voice Ready' : 'Voice Disabled'}
            </p>
            {lastCommand && (
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-48">
                Last: "{lastCommand}"
              </p>
            )}
          </div>
        </div>
        
        {isEnabled && (
          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            <p>Try: "Create task for website design"</p>
            <p>Or: "New project called mobile app"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceCommands;