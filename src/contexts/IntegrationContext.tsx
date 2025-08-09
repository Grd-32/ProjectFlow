import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Integration {
  id: string;
  name: string;
  type: 'communication' | 'storage' | 'calendar' | 'development' | 'crm' | 'accounting';
  status: 'connected' | 'disconnected' | 'error';
  config: {
    apiKey?: string;
    webhook?: string;
    syncEnabled?: boolean;
    settings?: Record<string, any>;
  };
  lastSync?: string;
  syncStatus?: 'success' | 'error' | 'pending';
  features: string[];
  connectedAt?: string;
}

export interface WebhookEvent {
  id: string;
  integrationId: string;
  event: string;
  payload: any;
  timestamp: string;
  processed: boolean;
}

interface IntegrationContextType {
  integrations: Integration[];
  webhookEvents: WebhookEvent[];
  connectIntegration: (integration: Omit<Integration, 'id' | 'connectedAt'>) => void;
  disconnectIntegration: (id: string) => void;
  updateIntegrationConfig: (id: string, config: Partial<Integration['config']>) => void;
  syncIntegration: (id: string) => Promise<void>;
  processWebhook: (event: Omit<WebhookEvent, 'id' | 'timestamp' | 'processed'>) => void;
  getIntegrationByType: (type: string) => Integration[];
}

const IntegrationContext = createContext<IntegrationContextType | undefined>(undefined);

export const useIntegration = () => {
  const context = useContext(IntegrationContext);
  if (context === undefined) {
    throw new Error('useIntegration must be used within an IntegrationProvider');
  }
  return context;
};

export const IntegrationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'slack-1',
      name: 'Slack',
      type: 'communication',
      status: 'connected',
      config: {
        webhook: 'https://hooks.slack.com/services/...',
        syncEnabled: true,
        settings: {
          channel: '#general',
          notifyOnTaskComplete: true,
          notifyOnProjectUpdate: true
        }
      },
      lastSync: '2024-12-11T15:30:00Z',
      syncStatus: 'success',
      features: ['notifications', 'task_updates', 'project_updates'],
      connectedAt: '2024-11-01T10:00:00Z'
    },
    {
      id: 'google-drive-1',
      name: 'Google Drive',
      type: 'storage',
      status: 'connected',
      config: {
        apiKey: 'AIza...',
        syncEnabled: true,
        settings: {
          autoSync: true,
          folder: '/ProjectFlow'
        }
      },
      lastSync: '2024-12-11T14:45:00Z',
      syncStatus: 'success',
      features: ['file_storage', 'document_sync', 'backup'],
      connectedAt: '2024-10-15T09:00:00Z'
    },
    {
      id: 'google-calendar-1',
      name: 'Google Calendar',
      type: 'calendar',
      status: 'connected',
      config: {
        apiKey: 'AIza...',
        syncEnabled: true,
        settings: {
          calendarId: 'primary',
          syncTasks: true,
          syncMeetings: true
        }
      },
      lastSync: '2024-12-11T16:00:00Z',
      syncStatus: 'success',
      features: ['calendar_sync', 'task_sync', 'meeting_sync'],
      connectedAt: '2024-09-20T11:00:00Z'
    }
  ]);

  const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>([]);

  const connectIntegration = (integrationData: Omit<Integration, 'id' | 'connectedAt'>) => {
    const newIntegration: Integration = {
      ...integrationData,
      id: `${integrationData.name.toLowerCase()}-${Date.now()}`,
      connectedAt: new Date().toISOString()
    };
    setIntegrations(prev => [...prev, newIntegration]);
  };

  const disconnectIntegration = (id: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === id 
        ? { ...integration, status: 'disconnected' as const, connectedAt: undefined }
        : integration
    ));
  };

  const updateIntegrationConfig = (id: string, config: Partial<Integration['config']>) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === id 
        ? { 
            ...integration, 
            config: { ...integration.config, ...config },
            lastSync: new Date().toISOString()
          }
        : integration
    ));
  };

  const syncIntegration = async (id: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === id 
        ? { ...integration, syncStatus: 'pending' as const }
        : integration
    ));

    // Simulate API call
    setTimeout(() => {
      setIntegrations(prev => prev.map(integration => 
        integration.id === id 
          ? { 
              ...integration, 
              syncStatus: 'success' as const,
              lastSync: new Date().toISOString()
            }
          : integration
      ));
    }, 2000);
  };

  const processWebhook = (eventData: Omit<WebhookEvent, 'id' | 'timestamp' | 'processed'>) => {
    const newEvent: WebhookEvent = {
      ...eventData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      processed: false
    };
    setWebhookEvents(prev => [...prev, newEvent]);
  };

  const getIntegrationByType = (type: string) => {
    return integrations.filter(integration => integration.type === type);
  };

  return (
    <IntegrationContext.Provider value={{
      integrations,
      webhookEvents,
      connectIntegration,
      disconnectIntegration,
      updateIntegrationConfig,
      syncIntegration,
      processWebhook,
      getIntegrationByType
    }}>
      {children}
    </IntegrationContext.Provider>
  );
};