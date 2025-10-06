import React, { useState, useEffect } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { 
  CreditCard, 
  Crown, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Users,
  Database,
  Zap,
  Shield,
  Calendar,
  DollarSign,
  RefreshCw,
  Download,
  ExternalLink
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

interface Invoice {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  date: string;
  dueDate: string;
  downloadUrl: string;
  description: string;
}

const SubscriptionManager = () => {
  const { currentTenant, subscription, trialInfo, upgradePlan, cancelSubscription } = useTenant();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: 'pm_1',
      type: 'card',
      last4: '4242',
      brand: 'visa',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true
    }
  ]);
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: 'inv_1',
      number: 'INV-2024-001',
      amount: 2900,
      currency: 'USD',
      status: 'paid',
      date: '2024-12-01T00:00:00Z',
      dueDate: '2024-12-01T00:00:00Z',
      downloadUrl: '#',
      description: 'Professional Plan - December 2024'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 9,
      yearlyPrice: 90,
      description: 'Perfect for small teams',
      features: [
        'Up to 10 users',
        'Unlimited projects',
        '10GB storage',
        'Basic integrations',
        'Email support'
      ],
      limits: { users: 10, storage: 10, apiCalls: 1000 }
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 29,
      yearlyPrice: 290,
      description: 'Advanced features for growing teams',
      features: [
        'Up to 50 users',
        'Unlimited projects',
        '100GB storage',
        'Advanced integrations',
        'Time tracking',
        'Custom fields',
        'Priority support'
      ],
      limits: { users: 50, storage: 100, apiCalls: 10000 },
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 99,
      yearlyPrice: 990,
      description: 'Complete solution for large organizations',
      features: [
        'Unlimited users',
        'Unlimited projects',
        '1TB storage',
        'All integrations',
        'Advanced analytics',
        'Custom branding',
        'SSO integration',
        'Audit logs',
        '24/7 support'
      ],
      limits: { users: -1, storage: 1000, apiCalls: 100000 }
    }
  ];

  const currentPlan = plans.find(p => p.id === currentTenant?.plan);

  const handleUpgrade = async (planId: string) => {
    setIsLoading(true);
    try {
      await upgradePlan(planId);
      addNotification({
        type: 'success',
        title: 'Plan Upgraded',
        message: `Successfully upgraded to ${planId} plan`,
        userId: user?.id || 'system'
      });
    } catch (error) {
      console.error('Upgrade failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsLoading(true);
    try {
      await cancelSubscription();
      setShowCancelConfirm(false);
    } catch (error) {
      console.error('Cancellation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600 dark:text-red-400';
    if (percentage >= 75) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  if (!currentTenant) {
    return (
      <div className="text-center py-12">
        <Building className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Organization</h3>
        <p className="text-gray-500 dark:text-gray-400">Please create or join an organization first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Trial Status */}
      {trialInfo?.isActive && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Free Trial Active</h3>
                <p className="text-blue-100">
                  {trialInfo.daysRemaining} day{trialInfo.daysRemaining === 1 ? '' : 's'} remaining
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-100 mb-2">Trial ends</p>
              <p className="font-semibold">
                {format(new Date(trialInfo.endsAt), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Current Plan */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Current Plan</h3>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
              currentTenant.status === 'active' 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                : currentTenant.status === 'trial'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
            }`}>
              {currentTenant.status}
            </span>
          </div>
        </div>

        {currentPlan && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">{currentPlan.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ${currentPlan.price}/user/month
                  </p>
                </div>
              </div>
              
              {subscription && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Next billing:</span>
                    <span className="text-gray-900 dark:text-white">
                      {format(new Date(subscription.currentPeriodEnd), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                    <span className="text-gray-900 dark:text-white">
                      ${(subscription.amount / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-2">
              <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Usage This Period</h5>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Users</span>
                    <span className={`text-sm font-medium ${getUsageColor(getUsagePercentage(currentTenant.usage.users, currentPlan.limits.users))}`}>
                      {currentTenant.usage.users} / {currentPlan.limits.users === -1 ? '∞' : currentPlan.limits.users}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        getUsagePercentage(currentTenant.usage.users, currentPlan.limits.users) >= 90 ? 'bg-red-500' :
                        getUsagePercentage(currentTenant.usage.users, currentPlan.limits.users) >= 75 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${getUsagePercentage(currentTenant.usage.users, currentPlan.limits.users)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Storage</span>
                    <span className={`text-sm font-medium ${getUsageColor(getUsagePercentage(currentTenant.usage.storage, currentPlan.limits.storage))}`}>
                      {currentTenant.usage.storage.toFixed(1)}GB / {currentPlan.limits.storage === -1 ? '∞' : `${currentPlan.limits.storage}GB`}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        getUsagePercentage(currentTenant.usage.storage, currentPlan.limits.storage) >= 90 ? 'bg-red-500' :
                        getUsagePercentage(currentTenant.usage.storage, currentPlan.limits.storage) >= 75 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${getUsagePercentage(currentTenant.usage.storage, currentPlan.limits.storage)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">API Calls</span>
                    <span className={`text-sm font-medium ${getUsageColor(getUsagePercentage(currentTenant.usage.apiCalls, currentPlan.limits.apiCalls))}`}>
                      {currentTenant.usage.apiCalls.toLocaleString()} / {currentPlan.limits.apiCalls === -1 ? '∞' : currentPlan.limits.apiCalls.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        getUsagePercentage(currentTenant.usage.apiCalls, currentPlan.limits.apiCalls) >= 90 ? 'bg-red-500' :
                        getUsagePercentage(currentTenant.usage.apiCalls, currentPlan.limits.apiCalls) >= 75 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${getUsagePercentage(currentTenant.usage.apiCalls, currentPlan.limits.apiCalls)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Available Plans */}
      {trialInfo?.isActive && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Upgrade Your Plan</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white dark:bg-gray-800 rounded-xl border-2 p-6 transition-all duration-200 hover:shadow-lg ${
                  plan.popular 
                    ? 'border-purple-500 shadow-lg ring-4 ring-purple-100 dark:ring-purple-900/30' 
                    : currentTenant.plan === plan.id
                    ? 'border-green-500'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-500 text-white px-4 py-1 text-xs font-bold rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                
                {currentTenant.plan === plan.id && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-green-500 text-white px-4 py-1 text-xs font-bold rounded-full">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h4>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">${plan.price}</span>
                    <span className="text-gray-500 dark:text-gray-400">/user/month</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                    </li>
                  ))}
                </ul>

                {currentTenant.plan === plan.id ? (
                  <button
                    disabled
                    className="w-full px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isLoading}
                    className={`w-full px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                      plan.popular 
                        ? 'bg-purple-600 hover:bg-purple-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    } disabled:opacity-50`}
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin mx-auto" />
                    ) : (
                      `Upgrade to ${plan.name}`
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Methods */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Payment Methods</h3>
          <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
            <CreditCard className="h-4 w-4" />
            <span>Add Payment Method</span>
          </button>
        </div>

        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <div key={method.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {method.brand?.toUpperCase()} •••• {method.last4}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Expires {method.expiryMonth}/{method.expiryYear}
                    {method.isDefault && <span className="ml-2 text-blue-600 dark:text-blue-400">• Default</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  Edit
                </button>
                <button className="text-sm text-red-600 dark:text-red-400 hover:underline">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Billing History</h3>
          <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
            <Download className="h-4 w-4" />
            <span>Download All</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Invoice</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-gray-100 dark:border-gray-600">
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{invoice.number}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{invoice.description}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {format(new Date(invoice.date), 'MMM d, yyyy')}
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    ${(invoice.amount / 100).toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      invoice.status === 'paid' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        : invoice.status === 'pending'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Danger Zone */}
      {subscription && subscription.status === 'active' && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Danger Zone
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-900 dark:text-red-100">Cancel Subscription</p>
              <p className="text-sm text-red-700 dark:text-red-300">
                Your subscription will remain active until {format(new Date(subscription.currentPeriodEnd), 'MMM d, yyyy')}
              </p>
            </div>
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="px-4 py-2 text-sm font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
            >
              Cancel Subscription
            </button>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cancel Subscription</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to cancel your subscription? You'll lose access to premium features at the end of your current billing period.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={isLoading}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Cancelling...' : 'Cancel Subscription'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManager;