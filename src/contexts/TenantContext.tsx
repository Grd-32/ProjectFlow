import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNotification } from './NotificationContext';

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  subdomain: string;
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'suspended' | 'trial' | 'cancelled';
  settings: {
    maxUsers: number;
    maxProjects: number;
    maxStorage: number; // in GB
    features: string[];
    customBranding: boolean;
    apiAccess: boolean;
    ssoEnabled: boolean;
    auditLogs: boolean;
  };
  billing: {
    subscriptionId: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    nextBillingDate: string;
  };
  usage: {
    users: number;
    projects: number;
    storage: number; // in GB
    apiCalls: number;
    lastUpdated: string;
  };
  owner: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  tenantId: string;
  plan: string;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  addOns: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}

export interface Usage {
  tenantId: string;
  period: string;
  metrics: {
    activeUsers: number;
    projectsCreated: number;
    tasksCompleted: number;
    storageUsed: number;
    apiCalls: number;
    integrationsSynced: number;
  };
  limits: {
    maxUsers: number;
    maxProjects: number;
    maxStorage: number;
    maxApiCalls: number;
  };
  overages: {
    users: number;
    storage: number;
    apiCalls: number;
  };
}

interface TenantContextType {
  currentTenant: Tenant | null;
  tenants: Tenant[];
  subscription: Subscription | null;
  usage: Usage | null;
  isLoading: boolean;
  switchTenant: (tenantId: string) => Promise<void>;
  updateTenant: (tenantId: string, updates: Partial<Tenant>) => Promise<void>;
  createTenant: (tenantData: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Tenant>;
  deleteTenant: (tenantId: string) => Promise<void>;
  updateSubscription: (subscriptionData: Partial<Subscription>) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  upgradeSubscription: (newPlan: string) => Promise<void>;
  getUsageMetrics: () => Promise<Usage>;
  checkFeatureAccess: (feature: string) => boolean;
  checkUsageLimits: () => { withinLimits: boolean; warnings: string[] };
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

export const TenantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { addNotification } = useNotification();
  
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>({
    id: 'tenant-1',
    name: 'Acme Corporation',
    domain: 'acme.com',
    subdomain: 'acme',
    plan: 'professional',
    status: 'active',
    settings: {
      maxUsers: 50,
      maxProjects: 100,
      maxStorage: 100,
      features: ['advanced_analytics', 'integrations', 'custom_fields', 'automation'],
      customBranding: true,
      apiAccess: true,
      ssoEnabled: false,
      auditLogs: true
    },
    billing: {
      subscriptionId: 'sub_1234567890',
      currentPeriodStart: '2024-12-01T00:00:00Z',
      currentPeriodEnd: '2025-01-01T00:00:00Z',
      amount: 2900, // $29.00
      currency: 'USD',
      paymentMethod: 'card_ending_4242',
      nextBillingDate: '2025-01-01T00:00:00Z'
    },
    usage: {
      users: 12,
      projects: 8,
      storage: 15.7,
      apiCalls: 1250,
      lastUpdated: new Date().toISOString()
    },
    owner: {
      id: '1',
      name: 'John Doe',
      email: 'john@acme.com'
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: new Date().toISOString()
  });

  const [tenants, setTenants] = useState<Tenant[]>([currentTenant!]);
  const [subscription, setSubscription] = useState<Subscription | null>({
    id: 'sub_1234567890',
    tenantId: 'tenant-1',
    plan: 'professional',
    status: 'active',
    currentPeriodStart: '2024-12-01T00:00:00Z',
    currentPeriodEnd: '2025-01-01T00:00:00Z',
    amount: 2900,
    currency: 'USD',
    interval: 'month',
    features: ['advanced_analytics', 'integrations', 'custom_fields', 'automation'],
    addOns: []
  });

  const [usage, setUsage] = useState<Usage | null>({
    tenantId: 'tenant-1',
    period: '2024-12',
    metrics: {
      activeUsers: 12,
      projectsCreated: 8,
      tasksCompleted: 156,
      storageUsed: 15.7,
      apiCalls: 1250,
      integrationsSynced: 45
    },
    limits: {
      maxUsers: 50,
      maxProjects: 100,
      maxStorage: 100,
      maxApiCalls: 10000
    },
    overages: {
      users: 0,
      storage: 0,
      apiCalls: 0
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  const switchTenant = async (tenantId: string): Promise<void> => {
    setIsLoading(true);
    try {
      const tenant = tenants.find(t => t.id === tenantId);
      if (tenant) {
        setCurrentTenant(tenant);
        // In a real app, this would switch the entire application context
        addNotification({
          type: 'info',
          title: 'Tenant Switched',
          message: `Switched to ${tenant.name}`,
          userId: tenant.owner.id,
          relatedEntity: {
            type: 'project',
            id: 'tenant',
            name: tenant.name
          }
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateTenant = async (tenantId: string, updates: Partial<Tenant>): Promise<void> => {
    setTenants(prev => prev.map(tenant => 
      tenant.id === tenantId 
        ? { ...tenant, ...updates, updatedAt: new Date().toISOString() }
        : tenant
    ));
    
    if (currentTenant?.id === tenantId) {
      setCurrentTenant(prev => prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : null);
    }
  };

  const createTenant = async (tenantData: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tenant> => {
    const newTenant: Tenant = {
      ...tenantData,
      id: `tenant-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setTenants(prev => [...prev, newTenant]);
    return newTenant;
  };

  const deleteTenant = async (tenantId: string): Promise<void> => {
    setTenants(prev => prev.filter(t => t.id !== tenantId));
    if (currentTenant?.id === tenantId) {
      setCurrentTenant(tenants.find(t => t.id !== tenantId) || null);
    }
  };

  const updateSubscription = async (subscriptionData: Partial<Subscription>): Promise<void> => {
    setSubscription(prev => prev ? { ...prev, ...subscriptionData } : null);
  };

  const cancelSubscription = async (): Promise<void> => {
    if (subscription) {
      setSubscription(prev => prev ? { ...prev, status: 'cancelled' } : null);
      addNotification({
        type: 'warning',
        title: 'Subscription Cancelled',
        message: 'Your subscription has been cancelled',
        userId: currentTenant?.owner.id || '1',
        relatedEntity: {
          type: 'project',
          id: 'billing',
          name: 'Subscription'
        }
      });
    }
  };

  const upgradeSubscription = async (newPlan: string): Promise<void> => {
    if (subscription) {
      setSubscription(prev => prev ? { ...prev, plan: newPlan } : null);
      addNotification({
        type: 'success',
        title: 'Plan Upgraded',
        message: `Successfully upgraded to ${newPlan} plan`,
        userId: currentTenant?.owner.id || '1',
        relatedEntity: {
          type: 'project',
          id: 'billing',
          name: 'Plan Upgrade'
        }
      });
    }
  };

  const getUsageMetrics = async (): Promise<Usage> => {
    // Simulate API call to get real-time usage
    await new Promise(resolve => setTimeout(resolve, 1000));
    return usage!;
  };

  const checkFeatureAccess = (feature: string): boolean => {
    return currentTenant?.settings.features.includes(feature) || false;
  };

  const checkUsageLimits = (): { withinLimits: boolean; warnings: string[] } => {
    if (!currentTenant || !usage) return { withinLimits: true, warnings: [] };
    
    const warnings: string[] = [];
    let withinLimits = true;

    if (usage.metrics.activeUsers >= currentTenant.settings.maxUsers * 0.9) {
      warnings.push(`Approaching user limit (${usage.metrics.activeUsers}/${currentTenant.settings.maxUsers})`);
    }
    
    if (usage.metrics.storageUsed >= currentTenant.settings.maxStorage * 0.9) {
      warnings.push(`Approaching storage limit (${usage.metrics.storageUsed}GB/${currentTenant.settings.maxStorage}GB)`);
    }

    if (usage.metrics.activeUsers > currentTenant.settings.maxUsers ||
        usage.metrics.storageUsed > currentTenant.settings.maxStorage) {
      withinLimits = false;
    }

    return { withinLimits, warnings };
  };

  // Monitor usage and send alerts
  useEffect(() => {
    const { warnings } = checkUsageLimits();
    warnings.forEach(warning => {
      addNotification({
        type: 'warning',
        title: 'Usage Alert',
        message: warning,
        userId: currentTenant?.owner.id || '1',
        relatedEntity: {
          type: 'project',
          id: 'usage',
          name: 'Usage Monitoring'
        }
      });
    });
  }, [usage, currentTenant]);

  return (
    <TenantContext.Provider value={{
      currentTenant,
      tenants,
      subscription,
      usage,
      isLoading,
      switchTenant,
      updateTenant,
      createTenant,
      deleteTenant,
      updateSubscription,
      cancelSubscription,
      upgradeSubscription,
      getUsageMetrics,
      checkFeatureAccess,
      checkUsageLimits
    }}>
      {children}
    </TenantContext.Provider>
  );
};