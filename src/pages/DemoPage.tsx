import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Maximize, 
  ArrowRight,
  CheckCircle,
  Users,
  Target,
  BarChart3,
  Clock,
  MessageSquare,
  Calendar,
  FileText,
  Settings,
  Zap,
  Shield
} from 'lucide-react';

interface DemoStep {
  id: string;
  title: string;
  description: string;
  component: string;
  duration: number;
  highlights: string[];
}

const DemoPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    company: '',
    role: ''
  });
  const [showForm, setShowForm] = useState(true);

  const demoSteps: DemoStep[] = [
    {
      id: 'dashboard',
      title: 'Dashboard Overview',
      description: 'Get a bird\'s eye view of all your projects, tasks, and team performance',
      component: 'Dashboard',
      duration: 30,
      highlights: ['Real-time metrics', 'Project status', 'Team activity', 'Upcoming deadlines']
    },
    {
      id: 'projects',
      title: 'Project Management',
      description: 'Create and manage projects with advanced planning tools',
      component: 'Projects',
      duration: 45,
      highlights: ['Gantt charts', 'Milestone tracking', 'Budget management', 'Resource allocation']
    },
    {
      id: 'tasks',
      title: 'Task Management',
      description: 'Organize work with powerful task management features',
      component: 'Tasks',
      duration: 40,
      highlights: ['Kanban boards', 'Task dependencies', 'Time tracking', 'Automated workflows']
    },
    {
      id: 'collaboration',
      title: 'Team Collaboration',
      description: 'Seamless communication and file sharing',
      component: 'Chat',
      duration: 35,
      highlights: ['Real-time chat', 'File sharing', 'Video calls', 'Team workspaces']
    },
    {
      id: 'analytics',
      title: 'Analytics & Reports',
      description: 'Powerful insights and custom reporting',
      component: 'Reports',
      duration: 30,
      highlights: ['Custom reports', 'Performance metrics', 'Predictive analytics', 'Export options']
    },
    {
      id: 'ai',
      title: 'AI-Powered Features',
      description: 'Intelligent automation and insights',
      component: 'AI',
      duration: 25,
      highlights: ['Smart scheduling', 'Risk detection', 'Task suggestions', 'Workflow optimization']
    }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 1;
          if (newProgress >= demoSteps[currentStep].duration) {
            if (currentStep < demoSteps.length - 1) {
              setCurrentStep(prev => prev + 1);
              return 0;
            } else {
              setIsPlaying(false);
              return demoSteps[currentStep].duration;
            }
          }
          return newProgress;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isPlaying, currentStep, demoSteps]);

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setProgress(0);
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    setProgress(0);
    setIsPlaying(false);
  };

  const handleStartTrial = () => {
    navigate('/auth?mode=register');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowForm(false);
  };

  const progressPercentage = (progress / demoSteps[currentStep].duration) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PF</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">ProjectFlow Demo</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Back to Home
              </button>
              <button
                onClick={handleStartTrial}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showForm ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Experience ProjectFlow Demo
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  Tell us a bit about yourself to get a personalized demo experience
                </p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={userInfo.name}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={userInfo.email}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      value={userInfo.company}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, company: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Your company"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Role
                    </label>
                    <select
                      value={userInfo.role}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select your role</option>
                      <option value="project-manager">Project Manager</option>
                      <option value="team-lead">Team Lead</option>
                      <option value="developer">Developer</option>
                      <option value="designer">Designer</option>
                      <option value="executive">Executive</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center"
                >
                  Start Demo Experience
                  <ArrowRight className="h-5 w-5 ml-2" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Demo Steps Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 sticky top-8">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Demo Steps</h3>
                <div className="space-y-3">
                  {demoSteps.map((step, index) => (
                    <button
                      key={step.id}
                      onClick={() => handleStepClick(index)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        index === currentStep
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : index < currentStep
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === currentStep
                            ? 'bg-blue-600 text-white'
                            : index < currentStep
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                        }`}>
                          {index < currentStep ? <CheckCircle className="h-4 w-4" /> : index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{step.title}</div>
                          <div className="text-xs opacity-75">{step.duration}s</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {Math.round(((currentStep * 100) + (progress / demoSteps[currentStep].duration * 100)) / demoSteps.length)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${((currentStep * 100) + (progress / demoSteps[currentStep].duration * 100)) / demoSteps.length}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Demo Content */}
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Demo Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {demoSteps[currentStep].title}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {demoSteps[currentStep].description}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleReset}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
                        title="Reset Demo"
                      >
                        <RotateCcw className="h-5 w-5" />
                      </button>
                      <button
                        onClick={handlePlay}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        <span>{isPlaying ? 'Pause' : 'Play'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Step {currentStep + 1} of {demoSteps.length}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {progress}s / {demoSteps[currentStep].duration}s
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Demo Screen */}
                <div className="relative">
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        {currentStep === 0 && <BarChart3 className="h-12 w-12 text-white" />}
                        {currentStep === 1 && <Target className="h-12 w-12 text-white" />}
                        {currentStep === 2 && <CheckCircle className="h-12 w-12 text-white" />}
                        {currentStep === 3 && <MessageSquare className="h-12 w-12 text-white" />}
                        {currentStep === 4 && <BarChart3 className="h-12 w-12 text-white" />}
                        {currentStep === 5 && <Zap className="h-12 w-12 text-white" />}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        {demoSteps[currentStep].title} Demo
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        {demoSteps[currentStep].description}
                      </p>
                      <button
                        onClick={() => navigate('/dashboard')}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
                      >
                        Try Interactive Demo
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </button>
                    </div>
                  </div>

                  {/* Demo Overlay */}
                  {isPlaying && (
                    <div className="absolute inset-0 bg-blue-600 bg-opacity-10 flex items-center justify-center">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
                        <div className="flex items-center space-x-3">
                          <div className="animate-pulse w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Demo Playing...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Demo Features */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Key Features in this Step:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {demoSteps[currentStep].highlights.map((highlight, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Demo Navigation */}
              <div className="mt-8 flex items-center justify-between">
                <button
                  onClick={() => currentStep > 0 && handleStepClick(currentStep - 1)}
                  disabled={currentStep === 0}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <ArrowRight className="h-4 w-4 rotate-180" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center space-x-2">
                  {demoSteps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleStepClick(index)}
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
                  onClick={() => currentStep < demoSteps.length - 1 ? handleStepClick(currentStep + 1) : handleStartTrial()}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <span>{currentStep < demoSteps.length - 1 ? 'Next' : 'Start Trial'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* CTA Section */}
              <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Ready to get started with ProjectFlow?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Join thousands of teams who have transformed their project management with ProjectFlow.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleStartTrial}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                  >
                    Start 14-Day Free Trial
                  </button>
                  <button
                    onClick={() => window.location.href = 'mailto:sales@projectflow.com'}
                    className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-lg font-semibold hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                  >
                    Contact Sales
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoPage;