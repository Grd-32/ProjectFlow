import React, { useState } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { useNotification } from '../contexts/NotificationContext';
import { 
  CreditCard, 
  DollarSign, 
  Calendar, 
  Download, 
  AlertTriangle,
  CheckCircle,
  Crown,
  Zap,
  Users,
  Database,
  Shield,
  Smartphone,
  Globe,
  BarChart3,
  Clock,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    users: number;
    projects: number;
    storage: number; // GB
    apiCalls: number;
  };
  popular?: boolean;
}

const BillingManager = () => {
  const { currentTenant, subscription, usage, updateSubscription, cancelSubscription, upgradeSubscription } = useTenant();
  const { addNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const pricingPlans: PricingPlan[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: 9,
      interval: 'month',
      features: [
        'Up to 10 users',
        'Unlimited projects',
        '10GB storage',
        'Basic integrations',
        'Email support'
      ],
      limits: {
        users: 10,
        projects: -1, // unlimited
        storage: 10,
        apiCalls: 1000
      }
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 29,
      interval: 'month',
      popular: true,
      features: [
        'Up to 50 users',
        'Unlimited projects',
        '100GB storage',
        'Advanced integrations',
        'Time tracking',
        'Custom fields',
        'Priority support'
      ],
      limits: {
        users: 50,
        projects: -1,
        storage: 100,
        apiCalls: 10000
      }
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 99,
      interval: 'month',
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
      limits: {
        users: -1,
        projects: -1,
        storage: 1000,
        apiCalls: 100000
      }
    }
  ];

  const handleUpgrade = async (planId: string) => {
    setIsLoading(true);
    try {
      await upgradeSubscription(planId);
      addNotification({
        type: 'success',
        title: 'Plan Upgraded',
        message: `Successfully upgraded to ${planId} plan`,
        userId: currentTenant?.owner.id || '1',
        relatedEntity: {
          type: 'project',
          id: 'billing',
          name: 'Plan Upgrade'
        }
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Upgrade Failed',
        message: 'Failed to upgrade plan. Please try again.',
        userId: currentTenant?.owner.id || '1',
        relatedEntity: {
          type: 'project',
          id: 'billing',
          name: 'Upgrade Error'
        }
      });
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
      addNotification({
        type: 'error',
        title: 'Cancellation Failed',
        message: 'Failed to cancel subscription. Please contact support.',
        userId: currentTenant?.owner.id || '1',
        relatedEntity: {
          type: 'project',
          id: 'billing',
          name: 'Cancellation Error'
        }
      });
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

  const currentPlan = pricingPlans.find(plan => plan.id === subscription?.plan);

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Current Subscription</h3>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
              subscription?.status === 'active' 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
            }`}>
              {subscription?.status}
            </span>
          </div>
        </div>

        {currentPlan && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Crown className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">{currentPlan.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ${currentPlan.price}/{currentPlan.interval}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Next billing</span>
                  <span className="text-gray-900 dark:text-white">
                    {subscription && format(new Date(subscription.currentPeriodEnd), 'MMM d, yyyy')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Amount</span>
                  <span className="text-gray-900 dark:text-white">
                    ${subscription?.amount ? (subscription.amount / 100).toFixed(2) : '0.00'}
                  </span>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Usage This Period</h5>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Users</span>
                    <span className={`text-sm font-medium ${getUsageColor(getUsagePercentage(usage?.metrics.activeUsers || 0, currentPlan.limits.users))}`}>
                      {usage?.metrics.activeUsers || 0} / {currentPlan.limits.users === -1 ? '∞' : currentPlan.limits.users}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        getUsagePercentage(usage?.metrics.activeUsers || 0, currentPlan.limits.users) >= 90 ? 'bg-red-500' :
                        getUsagePercentage(usage?.metrics.activeUsers || 0, currentPlan.limits.users) >= 75 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${getUsagePercentage(usage?.metrics.activeUsers || 0, currentPlan.limits.users)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Storage</span>
                    <span className={`text-sm font-medium ${getUsageColor(getUsagePercentage(usage?.metrics.storageUsed || 0, currentPlan.limits.storage))}`}>
                      {usage?.metrics.storageUsed?.toFixed(1) || 0}GB / {currentPlan.limits.storage === -1 ? '∞' : `${currentPlan.limits.storage}GB`}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        getUsagePercentage(usage?.metrics.storageUsed || 0, currentPlan.limits.storage) >= 90 ? 'bg-red-500' :
                        getUsagePercentage(usage?.metrics.storageUsed || 0, currentPlan.limits.storage) >= 75 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${getUsagePercentage(usage?.metrics.storageUsed || 0, currentPlan.limits.storage)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">API Calls</span>
                    <span className={`text-sm font-medium ${getUsageColor(getUsagePercentage(usage?.metrics.apiCalls || 0, currentPlan.limits.apiCalls))}`}>
                      {usage?.metrics.apiCalls?.toLocaleString() || 0} / {currentPlan.limits.apiCalls === -1 ? '∞' : currentPlan.limits.apiCalls.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        getUsagePercentage(usage?.metrics.apiCalls || 0, currentPlan.limits.apiCalls) >= 90 ? 'bg-red-500' :
                        getUsagePercentage(usage?.metrics.apiCalls || 0, currentPlan.limits.apiCalls) >= 75 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${getUsagePercentage(usage?.metrics.apiCalls || 0, currentPlan.limits.apiCalls)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Available Plans */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Available Plans</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white dark:bg-gray-800 rounded-lg border-2 p-6 ${
                plan.popular 
                  ? 'border-blue-500 shadow-lg' 
                  : subscription?.plan === plan.id
                  ? 'border-green-500'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 text-xs font-medium rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              
              {subscription?.plan === plan.id && (
                <div className="absolute -top-3 right-4">
                  <span className="bg-green-500 text-white px-3 py-1 text-xs font-medium rounded-full">
                    Current Plan
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h4>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">${plan.price}</span>
                  <span className="text-gray-500 dark:text-gray-400">/{plan.interval}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="space-y-2 mb-6 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Users:</span>
                  <span>{plan.limits.users === -1 ? 'Unlimited' : plan.limits.users}</span>
                </div>
                <div className="flex justify-between">
                  <span>Projects:</span>
                  <span>{plan.limits.projects === -1 ? 'Unlimited' : plan.limits.projects}</span>
                </div>
                <div className="flex justify-between">
                  <span>Storage:</span>
                  <span>{plan.limits.storage}GB</span>
                </div>
                <div className="flex justify-between">
                  <span>API Calls:</span>
                  <span>{plan.limits.apiCalls.toLocaleString()}/month</span>
                </div>
              </div>

              {subscription?.plan === plan.id ? (
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
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-600 hover:bg-gray-700'
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

      {/* Billing History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Billing History</h3>
          <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
            <Download className="h-4 w-4" />
            <span>Download Invoice</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Description</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Invoice</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 dark:border-gray-600">
                <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                  {subscription && format(new Date(subscription.currentPeriodStart), 'MMM d, yyyy')}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                  {currentPlan?.name} Plan - Monthly
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                  ${subscription?.amount ? (subscription.amount / 100).toFixed(2) : '0.00'}
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full">
                    Paid
                  </span>
                </td>
                <td className="py-3 px-4">
                  <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    Download
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Method</h3>
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <CreditCard className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">•••• •••• •••• 4242</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Expires 12/2025</p>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
            Update
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      {subscription?.status === 'active' && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Danger Zone
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-900 dark:text-red-100">Cancel Subscription</p>
              <p className="text-sm text-red-700 dark:text-red-300">
                Your subscription will remain active until the end of the current billing period.
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

export default BillingManager;