import React, { useState, useEffect } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { useUser } from '../contexts/UserContext';
import { useNotification } from '../contexts/NotificationContext';
import { 
  Building, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Loader,
  Globe,
  Shield,
  Users,
  Crown
} from 'lucide-react';

interface AuthProps {
  onAuthSuccess: () => void;
}

const MultiTenantAuth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const { tenants, switchTenant, createTenant } = useTenant();
  const { setCurrentUser } = useUser();
  const { addNotification } = useNotification();
  
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'tenant-select'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    tenantDomain: ''
  });

  const [registerData, setRegisterData] = useState({
    // Personal info
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Organization info
    organizationName: '',
    domain: '',
    subdomain: '',
    plan: 'professional'
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Find tenant by domain
      const tenant = tenants.find(t => 
        t.domain === loginData.tenantDomain || 
        t.subdomain === loginData.tenantDomain
      );

      if (!tenant) {
        throw new Error('Organization not found');
      }

      // Switch to tenant context
      await switchTenant(tenant.id);

      // Set user (in real app, this would come from API)
      setCurrentUser({
        id: '1',
        name: 'John Doe',
        email: loginData.email,
        avatar: '',
        initials: 'JD',
        role: 'Admin',
        department: 'Engineering',
        status: 'Active',
        lastLogin: new Date().toISOString(),
        createdAt: '2024-01-01T00:00:00Z'
      });

      addNotification({
        type: 'success',
        title: 'Welcome Back!',
        message: `Successfully logged into ${tenant.name}`,
        userId: '1',
        relatedEntity: {
          type: 'user',
          id: '1',
          name: 'Login'
        }
      });

      onAuthSuccess();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Login Failed',
        message: error instanceof Error ? error.message : 'Invalid credentials',
        userId: '1',
        relatedEntity: {
          type: 'user',
          id: 'login',
          name: 'Authentication'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      addNotification({
        type: 'error',
        title: 'Password Mismatch',
        message: 'Passwords do not match',
        userId: '1',
        relatedEntity: {
          type: 'user',
          id: 'register',
          name: 'Registration'
        }
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create new tenant
      const newTenant = await createTenant({
        name: registerData.organizationName,
        domain: registerData.domain,
        subdomain: registerData.subdomain,
        plan: registerData.plan as any,
        status: 'trial',
        settings: {
          maxUsers: registerData.plan === 'starter' ? 10 : registerData.plan === 'professional' ? 50 : -1,
          maxProjects: -1,
          maxStorage: registerData.plan === 'starter' ? 10 : registerData.plan === 'professional' ? 100 : 1000,
          features: getPlanFeatures(registerData.plan),
          customBranding: registerData.plan === 'enterprise',
          apiAccess: registerData.plan !== 'starter',
          ssoEnabled: registerData.plan === 'enterprise',
          auditLogs: registerData.plan !== 'starter'
        },
        billing: {
          subscriptionId: '',
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 day trial
          amount: 0,
          currency: 'USD',
          paymentMethod: '',
          nextBillingDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        },
        usage: {
          users: 1,
          projects: 0,
          storage: 0,
          apiCalls: 0,
          lastUpdated: new Date().toISOString()
        },
        owner: {
          id: '1',
          name: `${registerData.firstName} ${registerData.lastName}`,
          email: registerData.email
        }
      });

      // Switch to new tenant
      await switchTenant(newTenant.id);

      // Set user
      setCurrentUser({
        id: '1',
        name: `${registerData.firstName} ${registerData.lastName}`,
        email: registerData.email,
        avatar: '',
        initials: `${registerData.firstName[0]}${registerData.lastName[0]}`.toUpperCase(),
        role: 'Admin',
        department: 'Management',
        status: 'Active',
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });

      addNotification({
        type: 'success',
        title: 'Welcome to ProjectFlow!',
        message: `Your organization "${registerData.organizationName}" has been created successfully`,
        userId: '1',
        relatedEntity: {
          type: 'project',
          id: newTenant.id,
          name: registerData.organizationName
        }
      });

      onAuthSuccess();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Registration Failed',
        message: 'Failed to create organization. Please try again.',
        userId: '1',
        relatedEntity: {
          type: 'user',
          id: 'register',
          name: 'Registration'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanFeatures = (plan: string): string[] => {
    switch (plan) {
      case 'starter':
        return ['basic_features', 'email_support'];
      case 'professional':
        return ['basic_features', 'advanced_analytics', 'integrations', 'time_tracking', 'priority_support'];
      case 'enterprise':
        return ['basic_features', 'advanced_analytics', 'integrations', 'time_tracking', 'custom_branding', 'sso', 'audit_logs', 'dedicated_support'];
      default:
        return ['basic_features'];
    }
  };

  const validateSubdomain = (subdomain: string): boolean => {
    const regex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
    return regex.test(subdomain) && subdomain.length >= 3 && subdomain.length <= 63;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">PF</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ProjectFlow</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {authMode === 'login' ? 'Sign in to your workspace' : 'Create your organization'}
          </p>
        </div>

        {/* Auth Forms */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          {authMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Organization Domain
                </label>
                <input
                  type="text"
                  required
                  value={loginData.tenantDomain}
                  onChange={(e) => setLoginData(prev => ({ ...prev, tenantDomain: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  placeholder="your-company or company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={loginData.email}
                  onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 pr-10 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Don't have an organization? Create one
                </button>
              </div>
            </form>
          )}

          {authMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create Your Organization</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Start your 14-day free trial</p>
              </div>

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={registerData.firstName}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={registerData.lastName}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={registerData.email}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={registerData.password}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      required
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Organization Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Organization Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    required
                    value={registerData.organizationName}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, organizationName: e.target.value }))}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                    placeholder="Acme Corporation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subdomain
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      required
                      value={registerData.subdomain}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, subdomain: e.target.value.toLowerCase() }))}
                      className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                      placeholder="acme"
                    />
                    <div className="px-3 py-2 bg-gray-100 dark:bg-gray-600 border border-l-0 border-gray-200 dark:border-gray-600 rounded-r-lg text-sm text-gray-600 dark:text-gray-400">
                      .projectflow.app
                    </div>
                  </div>
                  {registerData.subdomain && !validateSubdomain(registerData.subdomain) && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      Subdomain must be 3-63 characters, lowercase letters, numbers, and hyphens only
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Plan
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['starter', 'professional', 'enterprise'].map((plan) => (
                      <button
                        key={plan}
                        type="button"
                        onClick={() => setRegisterData(prev => ({ ...prev, plan }))}
                        className={`p-3 text-center border-2 rounded-lg transition-colors ${
                          registerData.plan === plan
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {plan}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          ${plan === 'starter' ? '9' : plan === 'professional' ? '29' : '99'}/mo
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !validateSubdomain(registerData.subdomain)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>Create Organization</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Already have an organization? Sign in
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Features */}
        <div className="mt-8 text-center">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Secure</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Collaborative</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Globe className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Global</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiTenantAuth;