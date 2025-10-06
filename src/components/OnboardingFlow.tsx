import React, { useState } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { 
  CheckCircle, 
  ArrowRight, 
  Users, 
  FolderOpen, 
  Target,
  Settings,
  Rocket,
  Play,
  Building,
  UserPlus,
  Zap
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  completed: boolean;
  action?: () => void;
  optional?: boolean;
}

interface OnboardingFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ isOpen, onClose, onComplete }) => {
  const { currentTenant, updateTenant } = useTenant();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const [onboardingData, setOnboardingData] = useState({
    teamMembers: [] as Array<{ email: string; role: string; department: string }>,
    firstProject: {
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      budget: 0
    },
    goals: [] as Array<{ title: string; target: number; dueDate: string }>,
    preferences: {
      defaultView: 'kanban',
      notifications: true,
      timeTracking: true,
      integrations: [] as string[]
    }
  });

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to ProjectFlow',
      description: 'Let\'s get your organization set up for success',
      icon: Rocket,
      completed: completedSteps.includes('welcome')
    },
    {
      id: 'team',
      title: 'Invite Your Team',
      description: 'Add team members to start collaborating',
      icon: UserPlus,
      completed: completedSteps.includes('team'),
      optional: true
    },
    {
      id: 'project',
      title: 'Create Your First Project',
      description: 'Set up your first project to get started',
      icon: FolderOpen,
      completed: completedSteps.includes('project')
    },
    {
      id: 'goals',
      title: 'Set Your Goals',
      description: 'Define what success looks like for your team',
      icon: Target,
      completed: completedSteps.includes('goals'),
      optional: true
    },
    {
      id: 'preferences',
      title: 'Configure Preferences',
      description: 'Customize ProjectFlow to match your workflow',
      icon: Settings,
      completed: completedSteps.includes('preferences')
    },
    {
      id: 'complete',
      title: 'You\'re All Set!',
      description: 'Start managing your projects like a pro',
      icon: CheckCircle,
      completed: completedSteps.includes('complete')
    }
  ];

  const completeStep = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps(prev => [...prev, stepId]);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      completeStep(steps[currentStep].id);
      setCurrentStep(prev => prev + 1);
    } else {
      handleCompleteOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const skipStep = () => {
    completeStep(steps[currentStep].id);
    nextStep();
  };

  const handleCompleteOnboarding = async () => {
    try {
      if (currentTenant) {
        await updateTenant({
          settings: {
            ...currentTenant.settings,
            onboardingCompleted: true,
            onboardingCompletedAt: new Date().toISOString()
          }
        });
      }

      addNotification({
        type: 'success',
        title: 'Onboarding Complete!',
        message: 'Welcome to ProjectFlow! You\'re ready to start managing projects.',
        userId: user?.id || 'system'
      });

      onComplete();
    } catch (error) {
      console.error('Onboarding completion failed:', error);
    }
  };

  const addTeamMember = () => {
    setOnboardingData(prev => ({
      ...prev,
      teamMembers: [...prev.teamMembers, { email: '', role: 'Member', department: '' }]
    }));
  };

  const updateTeamMember = (index: number, field: string, value: string) => {
    setOnboardingData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      )
    }));
  };

  const removeTeamMember = (index: number) => {
    setOnboardingData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_, i) => i !== index)
    }));
  };

  const addGoal = () => {
    setOnboardingData(prev => ({
      ...prev,
      goals: [...prev.goals, { title: '', target: 100, dueDate: '' }]
    }));
  };

  const updateGoal = (index: number, field: string, value: string | number) => {
    setOnboardingData(prev => ({
      ...prev,
      goals: prev.goals.map((goal, i) => 
        i === index ? { ...goal, [field]: value } : goal
      )
    }));
  };

  const removeGoal = (index: number) => {
    setOnboardingData(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];
  const StepIcon = currentStepData.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Getting Started with ProjectFlow
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentStep 
                        ? 'bg-blue-600' 
                        : index < currentStep 
                        ? 'bg-green-500' 
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <StepIcon className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {currentStepData.title}
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {currentStepData.description}
            </p>
          </div>

          {/* Step Content */}
          <div className="max-w-2xl mx-auto">
            {currentStepData.id === 'welcome' && (
              <div className="text-center space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8">
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Welcome to {currentTenant.name}!
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Your organization has been created and your {trialInfo.daysRemaining}-day trial is now active. 
                    Let's set up your workspace to maximize your team's productivity.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                      <Users className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Team Collaboration</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                      <FolderOpen className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Project Management</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                      <Zap className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Smart Automation</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStepData.id === 'team' && (
              <div className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Invite Team Members
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Add your team members to start collaborating. You can always add more later.
                  </p>
                  
                  <div className="space-y-3">
                    {onboardingData.teamMembers.map((member, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <input
                          type="email"
                          placeholder="Email address"
                          value={member.email}
                          onChange={(e) => updateTeamMember(index, 'email', e.target.value)}
                          className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <select
                          value={member.role}
                          onChange={(e) => updateTeamMember(index, 'role', e.target.value)}
                          className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="Member">Member</option>
                          <option value="Manager">Manager</option>
                          <option value="Admin">Admin</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Department"
                          value={member.department}
                          onChange={(e) => updateTeamMember(index, 'department', e.target.value)}
                          className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <button
                          onClick={() => removeTeamMember(index)}
                          className="px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    
                    <button
                      onClick={addTeamMember}
                      className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      + Add Team Member
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentStepData.id === 'project' && (
              <div className="space-y-6">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Create Your First Project
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Start with a project to organize your team's work and track progress.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Project Name *
                      </label>
                      <input
                        type="text"
                        value={onboardingData.firstProject.name}
                        onChange={(e) => setOnboardingData(prev => ({
                          ...prev,
                          firstProject: { ...prev.firstProject, name: e.target.value }
                        }))}
                        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="e.g., Website Redesign, Mobile App Launch"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        value={onboardingData.firstProject.description}
                        onChange={(e) => setOnboardingData(prev => ({
                          ...prev,
                          firstProject: { ...prev.firstProject, description: e.target.value }
                        }))}
                        rows={3}
                        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Describe what this project aims to achieve"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={onboardingData.firstProject.startDate}
                          onChange={(e) => setOnboardingData(prev => ({
                            ...prev,
                            firstProject: { ...prev.firstProject, startDate: e.target.value }
                          }))}
                          className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Target End Date
                        </label>
                        <input
                          type="date"
                          value={onboardingData.firstProject.endDate}
                          onChange={(e) => setOnboardingData(prev => ({
                            ...prev,
                            firstProject: { ...prev.firstProject, endDate: e.target.value }
                          }))}
                          className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Budget (Optional)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={onboardingData.firstProject.budget || ''}
                        onChange={(e) => setOnboardingData(prev => ({
                          ...prev,
                          firstProject: { ...prev.firstProject, budget: Number(e.target.value) }
                        }))}
                        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter project budget"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStepData.id === 'goals' && (
              <div className="space-y-6">
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Set Your Goals
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Define measurable goals to track your team's success and progress.
                  </p>
                  
                  <div className="space-y-3">
                    {onboardingData.goals.map((goal, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <input
                          type="text"
                          placeholder="Goal title"
                          value={goal.title}
                          onChange={(e) => updateGoal(index, 'title', e.target.value)}
                          className="md:col-span-2 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <input
                          type="number"
                          placeholder="Target"
                          value={goal.target || ''}
                          onChange={(e) => updateGoal(index, 'target', Number(e.target.value))}
                          className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <button
                          onClick={() => removeGoal(index)}
                          className="px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    
                    <button
                      onClick={addGoal}
                      className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    >
                      + Add Goal
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentStepData.id === 'preferences' && (
              <div className="space-y-6">
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Configure Your Preferences
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Customize ProjectFlow to match your team's workflow and preferences.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Default Task View
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {['list', 'kanban', 'calendar'].map((view) => (
                          <button
                            key={view}
                            onClick={() => setOnboardingData(prev => ({
                              ...prev,
                              preferences: { ...prev.preferences, defaultView: view }
                            }))}
                            className={`p-3 text-center border-2 rounded-lg transition-colors capitalize ${
                              onboardingData.preferences.defaultView === view
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                            }`}
                          >
                            {view}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {[
                        { key: 'notifications', label: 'Enable Email Notifications' },
                        { key: 'timeTracking', label: 'Enable Time Tracking' }
                      ].map((pref) => (
                        <div key={pref.key} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{pref.label}</span>
                          <button
                            onClick={() => setOnboardingData(prev => ({
                              ...prev,
                              preferences: { 
                                ...prev.preferences, 
                                [pref.key]: !prev.preferences[pref.key as keyof typeof prev.preferences] 
                              }
                            }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              onboardingData.preferences[pref.key as keyof typeof onboardingData.preferences] 
                                ? 'bg-blue-600' 
                                : 'bg-gray-200 dark:bg-gray-600'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                onboardingData.preferences[pref.key as keyof typeof onboardingData.preferences] 
                                  ? 'translate-x-6' 
                                  : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStepData.id === 'complete' && (
              <div className="text-center space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-10 w-10 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Congratulations! 🎉
                  </h4>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                    Your organization is now set up and ready to go. You have {trialInfo?.daysRemaining} days 
                    remaining in your trial to explore all features.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                      <h5 className="font-semibold text-gray-900 dark:text-white mb-2">What's Next?</h5>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• Create tasks and assign to team members</li>
                        <li>• Set up project milestones</li>
                        <li>• Configure integrations</li>
                        <li>• Explore automation features</li>
                      </ul>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                      <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Need Help?</h5>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• Check out our help center</li>
                        <li>• Schedule a demo call</li>
                        <li>• Contact our support team</li>
                        <li>• Join our community</li>
                      </ul>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleCompleteOnboarding}
                    className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
                  >
                    Start Using ProjectFlow
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {currentStep > 0 && (
                <button
                  onClick={prevStep}
                  className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
                >
                  Previous
                </button>
              )}
              {currentStepData.optional && (
                <button
                  onClick={skipStep}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
                >
                  Skip this step
                </button>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              {currentStep < steps.length - 1 ? (
                <button
                  onClick={nextStep}
                  className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  <span>Continue</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleCompleteOnboarding}
                  className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200"
                >
                  <span>Complete Setup</span>
                  <CheckCircle className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;