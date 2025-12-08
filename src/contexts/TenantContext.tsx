import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNotification } from './NotificationContext';
import { useAuth } from './AuthContext';

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  subdomain: string;
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'trial' | 'active' | 'suspended' | 'cancelled';
  trialEndsAt?: string;
  subscriptionId?: string;
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
    customerId?: string;
    subscriptionId?: string;
    currentPeriodStart?: string;
    currentPeriodEnd?: string;
    amount: number;
    currency: string;
    paymentMethod?: string;
    nextBillingDate?: string;
    invoiceEmail?: string;
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

export interface TrialInfo {
  isActive: boolean;
  daysRemaining: number;
  endsAt: string;
  features: string[];
  limitations: string[];
}

export interface Subscription {
  id: string;
  tenantId: string;
  plan: string;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing' | 'incomplete';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
}

interface TenantContextType {
  currentTenant: Tenant | null;
  tenants: Tenant[];
  subscription: Subscription | null;
  trialInfo: TrialInfo | null;
  isLoading: boolean;
  createTenant: (tenantData: {
    name: string;
    subdomain: string;
    plan: string;
    industry?: string;
    teamSize?: string;
  }) => Promise<Tenant>;
  updateTenant: (updates: Partial<Tenant>) => Promise<void>;
  switchTenant: (tenantId: string) => Promise<void>;
  startTrial: (planId: string) => Promise<void>;
  upgradePlan: (planId: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  updateUsage: (usage: Partial<Tenant['usage']>) => Promise<void>;
  checkTrialStatus: () => Promise<TrialInfo>;
  extendTrial: (days: number) => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

const PLAN_CONFIGS = {
  starter: {
    maxUsers: 10,
    maxProjects: 50,
    maxStorage: 10,
    features: ['basic_features', 'email_support'],
    price: 9
  },
  professional: {
    maxUsers: 50,
    maxProjects: -1,
    maxStorage: 100,
    features: ['basic_features', 'advanced_analytics', 'integrations', 'time_tracking', 'priority_support'],
    price: 29
  },
  enterprise: {
    maxUsers: -1,
    maxProjects: -1,
    maxStorage: 1000,
    features: ['basic_features', 'advanced_analytics', 'integrations', 'time_tracking', 'custom_branding', 'sso', 'audit_logs', 'dedicated_support'],
    price: 99
  }
};

const DEMO_TENANT: Tenant = {
  id: 'demo-tenant-001',
  name: 'Demo Organization',
  domain: 'demo.projectflow.app',
  subdomain: 'demo',
  plan: 'professional',
  status: 'active',
  trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  settings: {
    maxUsers: 50,
    maxProjects: -1,
    maxStorage: 100,
    features: ['basic_features', 'advanced_analytics', 'integrations', 'time_tracking', 'priority_support'],
    customBranding: false,
    apiAccess: true,
    ssoEnabled: false,
    auditLogs: true,
    onboardingCompleted: true
  },
  billing: {
    amount: 2900,
    currency: 'USD'
  },
  usage: {
    users: 6,
    projects: 3,
    storage: 2.5,
    apiCalls: 1250,
    lastUpdated: new Date().toISOString()
  },
  owner: {
    id: 'demo-user-001',
    name: 'Demo User',
    email: 'demo@demo.com'
  },
  createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString()
};

export const TenantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(DEMO_TENANT);
  const [tenants, setTenants] = useState<Tenant[]>([DEMO_TENANT]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [trialInfo, setTrialInfo] = useState<TrialInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Always use demo tenant - skip authentication
    setCurrentTenant(DEMO_TENANT);
    setTenants([DEMO_TENANT]);
    checkTrialStatus();
  }, []);

  const loadUserTenants = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Load tenants where user is owner or member
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select(`
          *,
          tenant_members!inner(user_id, role)
        `)
        .eq('tenant_members.user_id', user.id);

      if (tenantError) throw tenantError;

      const loadedTenants = tenantData.map(tenant => ({
        id: tenant.id,
        name: tenant.name,
        domain: tenant.domain,
        subdomain: tenant.subdomain,
        plan: tenant.plan,
        status: tenant.status,
        trialEndsAt: tenant.trial_ends_at,
        subscriptionId: tenant.subscription_id,
        settings: tenant.settings || PLAN_CONFIGS[tenant.plan as keyof typeof PLAN_CONFIGS],
        billing: tenant.billing || { amount: 0, currency: 'USD' },
        usage: tenant.usage || { users: 0, projects: 0, storage: 0, apiCalls: 0, lastUpdated: new Date().toISOString() },
        owner: tenant.owner,
        createdAt: tenant.created_at,
        updatedAt: tenant.updated_at
      }));

      setTenants(loadedTenants);

      // Set current tenant (first one or user's primary)
      if (loadedTenants.length > 0) {
        const primaryTenant = loadedTenants.find(t => t.owner.id === user.id) || loadedTenants[0];
        setCurrentTenant(primaryTenant);
        await loadTenantSubscription(primaryTenant.id);
        await checkTrialStatus();
      }
    } catch (error: any) {
      console.error('Failed to load tenants:', error);
      addNotification({
        type: 'error',
        title: 'Loading Failed',
        message: 'Failed to load organization data',
        userId: user.id
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadTenantSubscription = async (tenantId: string) => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSubscription({
          id: data.id,
          tenantId: data.tenant_id,
          plan: data.plan,
          status: data.status,
          currentPeriodStart: data.current_period_start,
          currentPeriodEnd: data.current_period_end,
          amount: data.amount,
          currency: data.currency,
          interval: data.interval,
          cancelAtPeriodEnd: data.cancel_at_period_end,
          trialEnd: data.trial_end
        });
      }
    } catch (error) {
      console.error('Failed to load subscription:', error);
    }
  };

  const createTenant = async (tenantData: {
    name: string;
    subdomain: string;
    plan: string;
    industry?: string;
    teamSize?: string;
  }) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Check subdomain availability
      const { data: existingTenant } = await supabase
        .from('tenants')
        .select('id')
        .eq('subdomain', tenantData.subdomain)
        .single();

      if (existingTenant) {
        throw new Error('Subdomain already taken');
      }

      const planConfig = PLAN_CONFIGS[tenantData.plan as keyof typeof PLAN_CONFIGS];
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 14); // 14-day trial

      const newTenant = {
        name: tenantData.name,
        domain: `${tenantData.subdomain}.projectflow.app`,
        subdomain: tenantData.subdomain,
        plan: tenantData.plan,
        status: 'trial',
        trial_ends_at: trialEndDate.toISOString(),
        settings: {
          ...planConfig,
          industry: tenantData.industry,
          teamSize: tenantData.teamSize
        },
        billing: {
          amount: planConfig.price * 100, // Store in cents
          currency: 'USD'
        },
        usage: {
          users: 1,
          projects: 0,
          storage: 0,
          apiCalls: 0,
          lastUpdated: new Date().toISOString()
        },
        owner: {
          id: user.id,
          name: user.fullName,
          email: user.email
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('tenants')
        .insert([newTenant])
        .select()
        .single();

      if (error) throw error;

      // Add user as owner to tenant_members
      const { error: memberError } = await supabase
        .from('tenant_members')
        .insert([{
          tenant_id: data.id,
          user_id: user.id,
          role: 'owner',
          joined_at: new Date().toISOString()
        }]);

      if (memberError) throw memberError;

      // Update user profile with tenant_id
      await supabase
        .from('user_profiles')
        .update({ tenant_id: data.id })
        .eq('id', user.id);

      const createdTenant: Tenant = {
        id: data.id,
        ...newTenant,
        trialEndsAt: trialEndDate.toISOString()
      };

      setTenants(prev => [...prev, createdTenant]);
      setCurrentTenant(createdTenant);

      // Create trial info
      await checkTrialStatus();

      addNotification({
        type: 'success',
        title: 'Organization Created',
        message: `Welcome to ${tenantData.name}! Your 14-day trial has started.`,
        userId: user.id
      });

      return createdTenant;
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Creation Failed',
        message: error.message || 'Failed to create organization',
        userId: user.id
      });
      throw error;
    }
  };

  const updateTenant = async (updates: Partial<Tenant>) => {
    if (!currentTenant) throw new Error('No current tenant');

    try {
      const { error } = await supabase
        .from('tenants')
        .update({
          name: updates.name,
          domain: updates.domain,
          settings: updates.settings,
          billing: updates.billing,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentTenant.id);

      if (error) throw error;

      const updatedTenant = { ...currentTenant, ...updates };
      setCurrentTenant(updatedTenant);
      setTenants(prev => prev.map(t => t.id === currentTenant.id ? updatedTenant : t));

      addNotification({
        type: 'success',
        title: 'Organization Updated',
        message: 'Organization settings have been updated',
        userId: user?.id || 'system'
      });
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: error.message || 'Failed to update organization',
        userId: user?.id || 'system'
      });
      throw error;
    }
  };

  const switchTenant = async (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (!tenant) throw new Error('Tenant not found');

    setCurrentTenant(tenant);
    await loadTenantSubscription(tenantId);
    await checkTrialStatus();

    addNotification({
      type: 'info',
      title: 'Organization Switched',
      message: `Switched to ${tenant.name}`,
      userId: user?.id || 'system'
    });
  };

  const startTrial = async (planId: string) => {
    if (!currentTenant) throw new Error('No current tenant');

    try {
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 14);

      const { error } = await supabase
        .from('tenants')
        .update({
          plan: planId,
          status: 'trial',
          trial_ends_at: trialEndDate.toISOString(),
          settings: PLAN_CONFIGS[planId as keyof typeof PLAN_CONFIGS],
          updated_at: new Date().toISOString()
        })
        .eq('id', currentTenant.id);

      if (error) throw error;

      await loadUserTenants();
      await checkTrialStatus();

      addNotification({
        type: 'success',
        title: 'Trial Started',
        message: `Your 14-day trial for ${planId} plan has started`,
        userId: user?.id || 'system'
      });
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Trial Failed',
        message: error.message || 'Failed to start trial',
        userId: user?.id || 'system'
      });
      throw error;
    }
  };

  const upgradePlan = async (planId: string) => {
    if (!currentTenant) throw new Error('No current tenant');

    try {
      const planConfig = PLAN_CONFIGS[planId as keyof typeof PLAN_CONFIGS];
      
      // Create subscription record
      const { data: subscriptionData, error: subError } = await supabase
        .from('subscriptions')
        .insert([{
          tenant_id: currentTenant.id,
          plan: planId,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          amount: planConfig.price * 100,
          currency: 'USD',
          interval: 'month',
          cancel_at_period_end: false
        }])
        .select()
        .single();

      if (subError) throw subError;

      // Update tenant
      const { error: tenantError } = await supabase
        .from('tenants')
        .update({
          plan: planId,
          status: 'active',
          subscription_id: subscriptionData.id,
          settings: planConfig,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentTenant.id);

      if (tenantError) throw tenantError;

      await loadUserTenants();
      await loadTenantSubscription(currentTenant.id);

      addNotification({
        type: 'success',
        title: 'Plan Upgraded',
        message: `Successfully upgraded to ${planId} plan`,
        userId: user?.id || 'system'
      });
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Upgrade Failed',
        message: error.message || 'Failed to upgrade plan',
        userId: user?.id || 'system'
      });
      throw error;
    }
  };

  const cancelSubscription = async () => {
    if (!currentTenant || !subscription) throw new Error('No active subscription');

    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
          cancel_at_period_end: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscription.id);

      if (error) throw error;

      await loadTenantSubscription(currentTenant.id);

      addNotification({
        type: 'warning',
        title: 'Subscription Cancelled',
        message: 'Your subscription will remain active until the end of the current billing period',
        userId: user?.id || 'system'
      });
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Cancellation Failed',
        message: error.message || 'Failed to cancel subscription',
        userId: user?.id || 'system'
      });
      throw error;
    }
  };

  const updateUsage = async (usage: Partial<Tenant['usage']>) => {
    if (!currentTenant) return;

    try {
      const updatedUsage = {
        ...currentTenant.usage,
        ...usage,
        lastUpdated: new Date().toISOString()
      };

      const { error } = await supabase
        .from('tenants')
        .update({
          usage: updatedUsage,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentTenant.id);

      if (error) throw error;

      setCurrentTenant(prev => prev ? { ...prev, usage: updatedUsage } : null);

      // Check for usage limits
      const planConfig = PLAN_CONFIGS[currentTenant.plan as keyof typeof PLAN_CONFIGS];
      
      if (planConfig.maxUsers !== -1 && updatedUsage.users >= planConfig.maxUsers * 0.9) {
        addNotification({
          type: 'warning',
          title: 'User Limit Warning',
          message: `You're approaching your user limit (${updatedUsage.users}/${planConfig.maxUsers})`,
          userId: user?.id || 'system'
        });
      }

      if (planConfig.maxStorage !== -1 && updatedUsage.storage >= planConfig.maxStorage * 0.9) {
        addNotification({
          type: 'warning',
          title: 'Storage Limit Warning',
          message: `You're approaching your storage limit (${updatedUsage.storage.toFixed(1)}GB/${planConfig.maxStorage}GB)`,
          userId: user?.id || 'system'
        });
      }
    } catch (error: any) {
      console.error('Failed to update usage:', error);
    }
  };

  const checkTrialStatus = async (tenant?: Tenant): Promise<TrialInfo> => {
    const tenantToCheck = tenant || currentTenant;
    if (!tenantToCheck) {
      const emptyTrialInfo: TrialInfo = {
        isActive: false,
        daysRemaining: 0,
        endsAt: '',
        features: [],
        limitations: []
      };
      setTrialInfo(emptyTrialInfo);
      return emptyTrialInfo;
    }

    const now = new Date();
    const trialEnd = tenantToCheck.trialEndsAt ? new Date(tenantToCheck.trialEndsAt) : null;
    const isTrialActive = tenantToCheck.status === 'trial' && trialEnd && trialEnd > now;
    const daysRemaining = trialEnd ? Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;

    const planConfig = PLAN_CONFIGS[tenantToCheck.plan as keyof typeof PLAN_CONFIGS];

    const trialInfoData: TrialInfo = {
      isActive: isTrialActive,
      daysRemaining,
      endsAt: trialEnd?.toISOString() || '',
      features: planConfig.features,
      limitations: [
        `Up to ${planConfig.maxUsers === -1 ? 'unlimited' : planConfig.maxUsers} users`,
        `${planConfig.maxStorage}GB storage`,
        'Trial expires in ' + daysRemaining + ' days'
      ]
    };

    setTrialInfo(trialInfoData);

    // Send trial expiration warnings
    if (isTrialActive && daysRemaining <= 3 && daysRemaining > 0) {
      addNotification({
        type: 'warning',
        title: 'Trial Expiring Soon',
        message: `Your trial expires in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}. Upgrade to continue using ProjectFlow.`,
        userId: user?.id || 'system'
      });
    }

    return trialInfoData;
  };

  const extendTrial = async (days: number) => {
    if (!currentTenant || !user) throw new Error('No current tenant or user');

    try {
      const currentTrialEnd = currentTenant.trialEndsAt ? new Date(currentTenant.trialEndsAt) : new Date();
      const newTrialEnd = new Date(currentTrialEnd.getTime() + days * 24 * 60 * 60 * 1000);

      const { error } = await supabase
        .from('tenants')
        .update({
          trial_ends_at: newTrialEnd.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', currentTenant.id);

      if (error) throw error;

      await loadUserTenants();
      await checkTrialStatus();

      addNotification({
        type: 'success',
        title: 'Trial Extended',
        message: `Your trial has been extended by ${days} days`,
        userId: user.id
      });
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Extension Failed',
        message: error.message || 'Failed to extend trial',
        userId: user?.id || 'system'
      });
      throw error;
    }
  };

  // Auto-check trial status every hour
  useEffect(() => {
    if (currentTenant && currentTenant.status === 'trial') {
      const interval = setInterval(checkTrialStatus, 60 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [currentTenant]);

  return (
    <TenantContext.Provider value={{
      currentTenant,
      tenants,
      subscription,
      trialInfo,
      isLoading,
      createTenant,
      updateTenant,
      switchTenant,
      startTrial,
      upgradePlan,
      cancelSubscription,
      updateUsage,
      checkTrialStatus,
      extendTrial
    }}>
      {children}
    </TenantContext.Provider>
  );
};