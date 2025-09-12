import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNotification } from './NotificationContext';
import { useTheme } from './ThemeContext';

export interface SettingsState {
  profile: {
    name: string;
    email: string;
    phone: string;
    location: string;
    bio: string;
    timezone: string;
    avatar: string;
  };
  notifications: {
    inApp: boolean;
    email: boolean;
    push: boolean;
    types: {
      taskAssigned: boolean;
      taskCompleted: boolean;
      projectUpdates: boolean;
      mentions: boolean;
      deadlines: boolean;
      budgetAlerts: boolean;
    };
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    density: 'comfortable' | 'compact';
    animations: boolean;
    fontSize: 'small' | 'medium' | 'large';
    sidebarCollapsed: boolean;
  };
  regional: {
    language: string;
    dateFormat: string;
    timeFormat: string;
    currency: string;
    firstDayOfWeek: string;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: string;
    loginNotifications: boolean;
    lastPasswordChange: string;
    trustedDevices: string[];
  };
  organization: {
    name: string;
    domain: string;
    logo: string;
    defaultRole: string;
    allowGuestAccess: boolean;
    requireApproval: boolean;
  };
  integrations: {
    slack: { enabled: boolean; webhookUrl: string; channel: string };
    googleDrive: { enabled: boolean; apiKey: string; folderId: string };
    github: { enabled: boolean; token: string; organization: string };
    jira: { enabled: boolean; domain: string; email: string; apiToken: string };
  };
  advanced: {
    debugMode: boolean;
    apiLogging: boolean;
    performanceMonitoring: boolean;
    autoBackup: boolean;
    backupFrequency: string;
  };
}

export interface IntegrationConfig {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'error';
  config: any;
  lastSync?: string;
  features: string[];
}

interface SettingsContextType {
  settings: SettingsState;
  integrations: IntegrationConfig[];
  updateSettings: (section: keyof SettingsState, updates: any) => void;
  resetSettings: () => void;
  connectIntegration: (type: string, config: any) => Promise<void>;
  disconnectIntegration: (id: string) => void;
  testIntegration: (id: string) => Promise<boolean>;
  exportData: (format: string) => Promise<void>;
  importData: (file: File) => Promise<void>;
  applySettingsToSystem: () => void;
}

const defaultSettings: SettingsState = {
  profile: {
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    timezone: 'UTC',
    avatar: ''
  },
  notifications: {
    inApp: true,
    email: true,
    push: false,
    types: {
      taskAssigned: true,
      taskCompleted: true,
      projectUpdates: true,
      mentions: true,
      deadlines: true,
      budgetAlerts: true
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  },
  appearance: {
    theme: 'system',
    density: 'comfortable',
    animations: true,
    fontSize: 'medium',
    sidebarCollapsed: false
  },
  regional: {
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12',
    currency: 'USD',
    firstDayOfWeek: 'sunday'
  },
  security: {
    twoFactorEnabled: false,
    sessionTimeout: '60',
    loginNotifications: true,
    lastPasswordChange: '',
    trustedDevices: []
  },
  organization: {
    name: 'My Organization',
    domain: '',
    logo: '',
    defaultRole: 'Member',
    allowGuestAccess: false,
    requireApproval: true
  },
  integrations: {
    slack: { enabled: false, webhookUrl: '', channel: '' },
    googleDrive: { enabled: false, apiKey: '', folderId: '' },
    github: { enabled: false, token: '', organization: '' },
    jira: { enabled: false, domain: '', email: '', apiToken: '' }
  },
  advanced: {
    debugMode: false,
    apiLogging: false,
    performanceMonitoring: true,
    autoBackup: true,
    backupFrequency: 'daily'
  }
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { addNotification } = useNotification();
  const { setTheme } = useTheme();
  
  const [settings, setSettings] = useState<SettingsState>(() => {
    const saved = localStorage.getItem('projectflow-settings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([
    {
      id: 'slack-1',
      name: 'Slack',
      type: 'slack',
      status: 'connected',
      config: {
        webhookUrl: 'https://hooks.slack.com/services/...',
        channel: '#general'
      },
      lastSync: new Date().toISOString(),
      features: ['notifications', 'task_updates']
    }
  ]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('projectflow-settings', JSON.stringify(settings));
    applySettingsToSystem();
  }, [settings]);

  const updateSettings = (section: keyof SettingsState, updates: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: updates
    }));

    addNotification({
      type: 'success',
      title: 'Settings Updated',
      message: `${section.charAt(0).toUpperCase() + section.slice(1)} settings have been updated`,
      userId: '1',
      relatedEntity: {
        type: 'project',
        id: 'settings',
        name: 'Settings Update'
      }
    });
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('projectflow-settings');
    
    addNotification({
      type: 'warning',
      title: 'Settings Reset',
      message: 'All settings have been reset to default values',
      userId: '1',
      relatedEntity: {
        type: 'project',
        id: 'settings',
        name: 'Settings Reset'
      }
    });
  };

  const connectIntegration = async (type: string, config: any): Promise<void> => {
    // Simulate API call to connect integration
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newIntegration: IntegrationConfig = {
      id: `${type}-${Date.now()}`,
      name: type.charAt(0).toUpperCase() + type.slice(1),
      type,
      status: 'connected',
      config,
      lastSync: new Date().toISOString(),
      features: getIntegrationFeatures(type)
    };

    setIntegrations(prev => [...prev, newIntegration]);

    // Test the connection immediately
    const testResult = await testIntegrationConnection(type, config);
    if (!testResult) {
      setIntegrations(prev => prev.map(i => 
        i.id === newIntegration.id ? { ...i, status: 'error' } : i
      ));
      throw new Error('Connection test failed');
    }

    addNotification({
      type: 'success',
      title: 'Integration Connected',
      message: `${newIntegration.name} has been connected successfully`,
      userId: '1',
      relatedEntity: {
        type: 'project',
        id: 'integration',
        name: newIntegration.name
      }
    });
  };

  const disconnectIntegration = (id: string) => {
    const integration = integrations.find(i => i.id === id);
    setIntegrations(prev => prev.filter(i => i.id !== id));

    if (integration) {
      addNotification({
        type: 'warning',
        title: 'Integration Disconnected',
        message: `${integration.name} has been disconnected`,
        userId: '1',
        relatedEntity: {
          type: 'project',
          id: 'integration',
          name: integration.name
        }
      });
    }
  };

  const testIntegration = async (id: string): Promise<boolean> => {
    const integration = integrations.find(i => i.id === id);
    if (!integration) return false;

    // Simulate testing the integration
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const result = await testIntegrationConnection(integration.type, integration.config);
    
    setIntegrations(prev => prev.map(i => 
      i.id === id ? { 
        ...i, 
        status: result ? 'connected' : 'error',
        lastSync: result ? new Date().toISOString() : i.lastSync
      } : i
    ));

    addNotification({
      type: result ? 'success' : 'error',
      title: `Integration Test ${result ? 'Successful' : 'Failed'}`,
      message: `${integration.name} connection test ${result ? 'passed' : 'failed'}`,
      userId: '1',
      relatedEntity: {
        type: 'project',
        id: 'integration',
        name: integration.name
      }
    });

    return result;
  };

  const testIntegrationConnection = async (type: string, config: any): Promise<boolean> => {
    switch (type) {
      case 'slack':
        return testSlackConnection(config.webhookUrl);
      case 'google-drive':
        return testGoogleDriveConnection(config.apiKey);
      case 'github':
        return testGitHubConnection(config.token);
      case 'jira':
        return testJiraConnection(config.domain, config.email, config.apiToken);
      default:
        return Math.random() > 0.3; // 70% success rate for demo
    }
  };

  const testSlackConnection = async (webhookUrl: string): Promise<boolean> => {
    if (!webhookUrl) return false;
    
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'ProjectFlow integration test - connection successful! 🎉'
        })
      });
      return response.ok;
    } catch (error) {
      console.error('Slack test failed:', error);
      return false;
    }
  };

  const testGoogleDriveConnection = async (apiKey: string): Promise<boolean> => {
    if (!apiKey) return false;
    
    try {
      const response = await fetch(`https://www.googleapis.com/drive/v3/about?key=${apiKey}`);
      return response.ok;
    } catch (error) {
      console.error('Google Drive test failed:', error);
      return false;
    }
  };

  const testGitHubConnection = async (token: string): Promise<boolean> => {
    if (!token) return false;
    
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: { 'Authorization': `token ${token}` }
      });
      return response.ok;
    } catch (error) {
      console.error('GitHub test failed:', error);
      return false;
    }
  };

  const testJiraConnection = async (domain: string, email: string, apiToken: string): Promise<boolean> => {
    if (!domain || !email || !apiToken) return false;
    
    try {
      const auth = btoa(`${email}:${apiToken}`);
      const response = await fetch(`https://${domain}.atlassian.net/rest/api/3/myself`, {
        headers: { 'Authorization': `Basic ${auth}` }
      });
      return response.ok;
    } catch (error) {
      console.error('Jira test failed:', error);
      return false;
    }
  };

  const getIntegrationFeatures = (type: string): string[] => {
    switch (type) {
      case 'slack':
        return ['notifications', 'task_updates', 'project_updates'];
      case 'google-drive':
        return ['file_storage', 'document_sync', 'backup'];
      case 'github':
        return ['code_sync', 'issue_tracking', 'pull_requests'];
      case 'jira':
        return ['issue_sync', 'task_tracking', 'sprint_planning'];
      default:
        return [];
    }
  };

  const exportData = async (format: string): Promise<void> => {
    // Simulate data export
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const data = {
      settings,
      integrations,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `projectflow-settings-${new Date().toISOString().split('T')[0]}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addNotification({
      type: 'success',
      title: 'Data Exported',
      message: `Settings and data exported as ${format.toUpperCase()}`,
      userId: '1',
      relatedEntity: {
        type: 'project',
        id: 'export',
        name: 'Data Export'
      }
    });
  };

  const importData = async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.settings) {
            setSettings({ ...defaultSettings, ...data.settings });
          }
          if (data.integrations) {
            setIntegrations(data.integrations);
          }
          
          addNotification({
            type: 'success',
            title: 'Data Imported',
            message: 'Settings and data imported successfully',
            userId: '1',
            relatedEntity: {
              type: 'project',
              id: 'import',
              name: 'Data Import'
            }
          });
          resolve();
        } catch (error) {
          addNotification({
            type: 'error',
            title: 'Import Failed',
            message: 'Failed to import data. Please check the file format.',
            userId: '1',
            relatedEntity: {
              type: 'project',
              id: 'import',
              name: 'Import Error'
            }
          });
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  };

  const applySettingsToSystem = () => {
    // Apply theme changes
    setTheme(settings.appearance.theme);
    
    // Apply other system-wide settings
    document.documentElement.style.fontSize = settings.appearance.fontSize === 'small' ? '14px' : 
                                              settings.appearance.fontSize === 'large' ? '18px' : '16px';
    
    // Apply animations
    if (!settings.appearance.animations) {
      document.documentElement.style.setProperty('--animation-duration', '0s');
    } else {
      document.documentElement.style.removeProperty('--animation-duration');
    }

    // Apply density
    document.documentElement.classList.toggle('compact-mode', settings.appearance.density === 'compact');
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      integrations,
      updateSettings,
      resetSettings,
      connectIntegration,
      disconnectIntegration,
      testIntegration,
      exportData,
      importData,
      applySettingsToSystem
    }}>
      {children}
    </SettingsContext.Provider>
  );
};