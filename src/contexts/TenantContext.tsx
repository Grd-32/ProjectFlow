import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useNotification } from './NotificationContext';

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  subdomain: string;
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'trial' | 'suspended' | 'cancelled';
  settings: {
    maxUsers: number;
    maxProjects: number;
    maxStorage: number; // GB
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
    storage: number;
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
}

export interface Usage {
  tenantId: string;
  metrics: {
    activeUsers: number;
    totalProjects: number;
    storageUsed: number;
    apiCalls: number;
    bandwidth: number;
  };
  limits: {
    maxUsers: number;
    maxProjects: number;
    maxStorage: number;
    maxApiCalls: number;
  };
  period: {
    start: string;
    end: string;
  };
}

interface TenantContextType {
  tenants: Tenant[];
  currentTenant: Tenant | null;
  subscription: Subscription | null;
  usage: Usage | null;
  switchTenant: (tenantId: string) => Promise<void>;
  createTenant: (tenantData: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Tenant>;
  updateTenant: (id: string, updates: Partial<Tenant>) => void;
  deleteTenant: (id: string) => void;
  updateSubscription: (subscriptionData: Partial<Subscription>) => void;
  cancelSubscription: () => Promise<void>;
  upgradeSubscription: (planId: string) => Promise<void>;
  refreshUsage: () => Promise<void>;
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
  
  const [tenants, setTenants] = useState<Tenant[]>([
    {
      id: '1',
      name: 'Acme Corporation',
      domain: 'acme.com',
      subdomain: 'acme',
      plan: 'professional',
      status: 'active',
      settings: {
        maxUsers: 50,
        maxProjects: -1,
        maxStorage: 100,
        features: ['basic_features', 'advanced_analytics', 'integrations', 'time_tracking', 'priority_support'],
        customBranding: false,
        apiAccess: true,
        ssoEnabled: false,
        auditLogs: true
      },
      billing: {
        subscriptionId: 'sub_1234567890',
        currentPeriodStart: '2024-12-01T00:00:00Z',
        currentPeriodEnd: '2025-01-01T00:00:00Z',
        amount: 2900,
        currency: 'USD',
        paymentMethod: 'card_1234',
        nextBillingDate: '2025-01-01T00:00:00Z'
      },
      usage: {
        users: 12,
        projects: 8,
        storage: 45.2,
        apiCalls: 2847,
        lastUpdated: new Date().toISOString()
      },
      owner: {
        id: '1',
        name: 'John Doe',
        email: 'john@acme.com'
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString()
    }
  ]);

  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(tenants[0]);
  const [subscription, setSubscription] = useState<Subscription | null>({
    id: 'sub_1234567890',
    tenantId: '1',
    plan: 'professional',
    status: 'active',
    currentPeriodStart: '2024-12-01T00:00:00Z',
    currentPeriodEnd: '2025-01-01T00:00:00Z',
    amount: 2900,
    currency: 'USD'
  });

  const [usage, setUsage] = useState<Usage | null>({
    tenantId: '1',
    metrics: {
      activeUsers: 12,
      totalProjects: 8,
      storageUsed: 45.2,
      apiCalls: 2847,
      bandwidth: 125.8
    },
    limits: {
      maxUsers: 50,
      maxProjects: -1,
      maxStorage: 100,
      maxApiCalls: 10000
    },
    period: {
      start: '2024-12-01T00:00:00Z',
      end: '2025-01-01T00:00:00Z'
    }
  });

  const switchTenant = async (tenantId: string): Promise<void> => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (tenant) {
      setCurrentTenant(tenant);
      
      // Update subscription and usage for new tenant
      setSubscription({
        id: `sub_${tenantId}`,
        tenantId,
        plan: tenant.plan,
        status: 'active',
        currentPeriodStart: tenant.billing.currentPeriodStart,
        currentPeriodEnd: tenant.billing.currentPeriodEnd,
        amount: tenant.billing.amount,
        currency: tenant.billing.currency
      });

      setUsage({
        tenantId,
        metrics: {
          activeUsers: tenant.usage.users,
          totalProjects: tenant.usage.projects,
          storageUsed: tenant.usage.storage,
          apiCalls: tenant.usage.apiCalls,
          bandwidth: Math.random() * 200
        },
        limits: {
          maxUsers: tenant.settings.maxUsers,
          maxProjects: tenant.settings.maxProjects,
          maxStorage: tenant.settings.maxStorage,
          maxApiCalls: 10000
        },
        period: {
          start: tenant.billing.currentPeriodStart,
          end: tenant.billing.currentPeriodEnd
        }
      });

      addNotification({
        type: 'info',
        title: 'Tenant Switched',
        message: `Switched to ${tenant.name}`,
        userId: tenant.owner.id,
        relatedEntity: {
          type: 'project',
          id: tenant.id,
          name: tenant.name
        }
      });
    }
  };

  const createTenant = async (tenantData: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tenant> => {
    const newTenant: Tenant = {
      ...tenantData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setTenants(prev => [...prev, newTenant]);
    setCurrentTenant(newTenant);

    addNotification({
      type: 'success',
      title: 'Organization Created',
      message: `Welcome to ${newTenant.name}!`,
      userId: newTenant.owner.id,
      relatedEntity: {
        type: 'project',
        id: newTenant.id,
        name: newTenant.name
      }
    });

    return newTenant;
  };

  const updateTenant = (id: string, updates: Partial<Tenant>) => {
    setTenants(prev => prev.map(tenant => 
      tenant.id === id 
        ? { ...tenant, ...updates, updatedAt: new Date().toISOString() }
        : tenant
    ));

    if (currentTenant?.id === id) {
      setCurrentTenant(prev => prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : null);
    }
  };

  const deleteTenant = (id: string) => {
    setTenants(prev => prev.filter(tenant => tenant.id !== id));
    
    if (currentTenant?.id === id) {
      const remainingTenants = tenants.filter(t => t.id !== id);
      setCurrentTenant(remainingTenants.length > 0 ? remainingTenants[0] : null);
    }
  };

  const updateSubscription = (subscriptionData: Partial<Subscription>) => {
    setSubscription(prev => prev ? { ...prev, ...subscriptionData } : null);
  };

  const cancelSubscription = async (): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
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

  const upgradeSubscription = async (planId: string): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const planPrices = {
      starter: 900,
      professional: 2900,
      enterprise: 9900
    };

    if (subscription && currentTenant) {
      const newAmount = planPrices[planId as keyof typeof planPrices];
      
      setSubscription(prev => prev ? { 
        ...prev, 
        plan: planId,
        amount: newAmount
      } : null);

      updateTenant(currentTenant.id, { plan: planId as any });

      addNotification({
        type: 'success',
        title: 'Plan Upgraded',
        message: `Successfully upgraded to ${planId} plan`,
        userId: currentTenant.owner.id,
        relatedEntity: {
          type: 'project',
          id: 'billing',
          name: 'Plan Upgrade'
        }
      });
    }
  };

  const refreshUsage = async (): Promise<void> => {
    // Simulate API call to refresh usage data
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (currentTenant) {
      setUsage(prev => prev ? {
        ...prev,
        metrics: {
          ...prev.metrics,
          apiCalls: prev.metrics.apiCalls + Math.floor(Math.random() * 100),
          bandwidth: Math.random() * 200
        },
        lastUpdated: new Date().toISOString()
      } : null);
    }
  };

  return (
    <TenantContext.Provider value={{
      tenants,
      currentTenant,
      subscription,
      usage,
      switchTenant,
      createTenant,
      updateTenant,
      deleteTenant,
      updateSubscription,
      cancelSubscription,
      upgradeSubscription,
      refreshUsage
    }}>
      {children}
    </TenantContext.Provider>
  );
};