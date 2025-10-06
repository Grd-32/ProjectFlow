import React from 'react';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';
import { Clock, Crown, ArrowRight, X } from 'lucide-react';
import { useState } from 'react';

const TrialBanner = () => {
  const { currentTenant, trialInfo, upgradePlan } = useTenant();
  const { user } = useAuth();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!currentTenant || !trialInfo || !trialInfo.isActive || isDismissed) {
    return null;
  }

  const handleUpgrade = async () => {
    try {
      await upgradePlan(currentTenant.plan);
    } catch (error) {
      console.error('Upgrade failed:', error);
    }
  };

  const getBannerColor = () => {
    if (trialInfo.daysRemaining <= 1) return 'bg-red-500';
    if (trialInfo.daysRemaining <= 3) return 'bg-orange-500';
    if (trialInfo.daysRemaining <= 7) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getUrgencyText = () => {
    if (trialInfo.daysRemaining <= 1) return 'Trial expires today!';
    if (trialInfo.daysRemaining <= 3) return 'Trial expires soon!';
    return 'Free trial active';
  };

  return (
    <div className={`${getBannerColor()} text-white px-4 py-3 relative`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span className="font-medium">{getUrgencyText()}</span>
          </div>
          <div className="hidden md:block">
            <span className="text-sm opacity-90">
              {trialInfo.daysRemaining} day{trialInfo.daysRemaining === 1 ? '' : 's'} remaining in your {currentTenant.plan} trial
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleUpgrade}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
          >
            <Crown className="h-4 w-4" />
            <span>Upgrade Now</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrialBanner;