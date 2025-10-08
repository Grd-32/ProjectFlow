import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  Crown,
  Zap,
  Star
} from 'lucide-react';

const AuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createTenant, switchTenant } = useTenant();
  const { setCurrentUser } = useUser();
  const { addNotification } = useNotification();
  
  const initialMode = searchParams.get('mode') || 'login';
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot-password'>(initialMode as any);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  
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
    plan: 'professional',
    // Additional info
    teamSize: '',
    industry: '',
    useCase: ''
  });

  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: ''
  });

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 9,
      description: 'Perfect for small teams',
      features: ['Up to 10 users', 'Basic features', 'Email support'],
      icon: Users
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 29,
      description: 'Advanced features for growing teams',
      features: ['Up to 50 users', 'Advanced analytics', 'Priority support'],
      icon: Star,
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 99,
      description: 'Complete solution for large organizations',
      features: ['Unlimited users', 'Custom integrations', '24/7 support'],
      icon: Crown
    }
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful login
      setCurrentUser({
        id: '1',
        name: 'Demo User',
        email: loginData.email,
        avatar: '',
        initials: 'DU',
        role: 'Admin',
        department: 'Engineering',
        status: 'Active',
        lastLogin: new Date().toISOString(),
        createdAt: '2024-01-01T00:00:00Z'
      });

      addNotification({
        type: 'success',
        title: 'Welcome Back!',
        message: 'Successfully logged in to your workspace',
        userId: '1',
        relatedEntity: {
          type: 'user',
          id: '1',
          name: 'Login'
        }
      });

      navigate('/dashboard');
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Login Failed',
        message: 'Invalid credentials. Please try again.',
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
          currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
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

      navigate('/dashboard');
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      addNotification({
        type: 'success',
        title: 'Reset Link Sent',
        message: `Password reset instructions sent to ${forgotPasswordData.email}`,
        userId: '1',
        relatedEntity: {
          type: 'user',
          id: 'reset',
          name: 'Password Reset'
        }
      });

      setAuthMode('login');
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Reset Failed',
        message: 'Failed to send reset email. Please try again.',
        userId: '1',
        relatedEntity: {
          type: 'user',
          id: 'reset',
          name: 'Password Reset'
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">PF</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ProjectFlow</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {authMode === 'login' ? 'Sign in to your workspace' : 
             authMode === 'register' ? 'Create your organization' : 
             'Reset your password'}
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

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setAuthMode('forgot-password')}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Forgot password?
                </button>
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

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setLoginData({
                    email: 'demo@demo.com',
                    password: 'demo123',
                    tenantDomain: 'demo'
                  });
                  setTimeout(() => {
                    setIsLoading(true);
                    setTimeout(() => {
                      setCurrentUser({
                        id: '66666666-6666-6666-6666-666666666666',
                        name: 'Demo User',
                        email: 'demo@demo.com',
                        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo',
                        initials: 'DU',
                        role: 'Admin',
                        department: 'Management',
                        status: 'Active',
                        lastLogin: new Date().toISOString(),
                        createdAt: '2024-01-01T00:00:00Z'
                      });
                      addNotification({
                        type: 'success',
                        title: 'Welcome to Demo!',
                        message: 'You are now logged in with demo account. All data is real and stored in Supabase.',
                        userId: '66666666-6666-6666-6666-666666666666',
                        relatedEntity: {
                          type: 'user',
                          id: '66666666-6666-6666-6666-666666666666',
                          name: 'Demo Login'
                        }
                      });
                      navigate('/dashboard');
                      setIsLoading(false);
                    }, 1000);
                  }, 100);
                }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <Zap className="h-4 w-4" />
                <span>Try Demo Account</span>
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
            <div className="space-y-6">
              {step === 1 && (
                <>
                  <div className="text-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Tell us about yourself</p>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-4">
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

                    <button
                      type="submit"
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <span>Continue</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </form>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="text-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Organization Setup</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Set up your workspace</p>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); setStep(3); }} className="space-y-4">
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

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Team Size
                        </label>
                        <select
                          value={registerData.teamSize}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, teamSize: e.target.value }))}
                          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                        >
                          <option value="">Select size</option>
                          <option value="1-10">1-10 people</option>
                          <option value="11-50">11-50 people</option>
                          <option value="51-200">51-200 people</option>
                          <option value="200+">200+ people</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Industry
                        </label>
                        <select
                          value={registerData.industry}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, industry: e.target.value }))}
                          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                        >
                          <option value="">Select industry</option>
                          <option value="technology">Technology</option>
                          <option value="finance">Finance</option>
                          <option value="healthcare">Healthcare</option>
                          <option value="education">Education</option>
                          <option value="retail">Retail</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <span>Continue</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </form>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="text-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Choose Your Plan</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Start with a 14-day free trial</p>
                  </div>

                  <div className="space-y-3">
                    {plans.map((plan) => {
                      const Icon = plan.icon;
                      return (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => setRegisterData(prev => ({ ...prev, plan: plan.id }))}
                          className={`w-full p-4 text-left border-2 rounded-lg transition-colors ${
                            registerData.plan === plan.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${
                                plan.id === 'starter' ? 'bg-blue-100 dark:bg-blue-900/30' :
                                plan.id === 'professional' ? 'bg-purple-100 dark:bg-purple-900/30' :
                                'bg-yellow-100 dark:bg-yellow-900/30'
                              }`}>
                                <Icon className={`h-5 w-5 ${
                                  plan.id === 'starter' ? 'text-blue-600 dark:text-blue-400' :
                                  plan.id === 'professional' ? 'text-purple-600 dark:text-purple-400' :
                                  'text-yellow-600 dark:text-yellow-400'
                                }`} />
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold text-gray-900 dark:text-white">{plan.name}</span>
                                  {plan.popular && (
                                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded-full">
                                      Popular
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{plan.description}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900 dark:text-white">${plan.price}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">per user/month</div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleRegister}
                      disabled={isLoading || !validateSubdomain(registerData.subdomain)}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
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
                  </div>
                </>
              )}

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Already have an organization? Sign in
                </button>
              </div>
            </div>
          )}

          {authMode === 'forgot-password' && (
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Reset Password</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enter your email and we'll send you a reset link
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={forgotPasswordData.email}
                  onChange={(e) => setForgotPasswordData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  placeholder="Enter your email"
                />
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
                    <Mail className="h-4 w-4" />
                    <span>Send Reset Link</span>
                  </>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Back to sign in
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

export default AuthPage;