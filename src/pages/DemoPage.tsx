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
  Shield,
  Brain,
  Workflow,
  Database,
  Globe,
  Smartphone,
  Monitor,
  X,
  Star,
  Award,
  TrendingUp,
  Activity,
  PieChart
} from 'lucide-react';

interface DemoStep {
  id: string;
  title: string;
  description: string;
  component: string;
  duration: number;
  highlights: string[];
  screenshot: string;
  features: string[];
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
    role: '',
    teamSize: '',
    interests: [] as string[]
  });
  const [showForm, setShowForm] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const demoSteps: DemoStep[] = [
    {
      id: 'dashboard',
      title: 'AI-Powered Dashboard',
      description: 'Get intelligent insights and real-time overview of all your projects with AI-powered analytics',
      component: 'Dashboard',
      duration: 45,
      highlights: ['Real-time metrics', 'AI predictions', 'Custom widgets', 'Team activity'],
      screenshot: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
      features: ['Predictive Analytics', 'Custom Dashboards', 'Real-time Updates', 'Performance Metrics']
    },
    {
      id: 'projects',
      title: 'Advanced Project Planning',
      description: 'Comprehensive project management with interactive Gantt charts, resource allocation, and budget tracking',
      component: 'Projects',
      duration: 60,
      highlights: ['Interactive Gantt', 'Resource planning', 'Budget tracking', 'Milestone management'],
      screenshot: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
      features: ['Gantt Charts', 'Resource Management', 'Budget Control', 'Risk Assessment']
    },
    {
      id: 'tasks',
      title: 'Smart Task Management',
      description: 'Organize work with AI-powered task suggestions, dependencies, and automated workflows',
      component: 'Tasks',
      duration: 50,
      highlights: ['Kanban boards', 'Task dependencies', 'AI suggestions', 'Automated workflows'],
      screenshot: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800',
      features: ['Kanban Boards', 'Task Dependencies', 'Time Tracking', 'Workflow Automation']
    },
    {
      id: 'collaboration',
      title: 'Team Collaboration Hub',
      description: 'Real-time communication, file sharing, and video conferencing integrated into your workflow',
      component: 'Chat',
      duration: 40,
      highlights: ['Live chat', 'Video calls', 'File sharing', 'Team channels'],
      screenshot: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800',
      features: ['Real-time Chat', 'Video Conferencing', 'File Sharing', 'Team Workspaces']
    },
    {
      id: 'analytics',
      title: 'Comprehensive Analytics',
      description: 'Deep insights with custom reporting, predictive analytics, and performance tracking',
      component: 'Reports',
      duration: 35,
      highlights: ['Custom reports', 'Performance metrics', 'Predictive analytics', 'Export options'],
      screenshot: 'https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg?auto=compress&cs=tinysrgb&w=800',
      features: ['Custom Reports', 'Data Visualization', 'Predictive Insights', 'Export Tools']
    },
    {
      id: 'automation',
      title: 'Intelligent Automation',
      description: 'AI-powered workflow automation that learns from your team\'s patterns and optimizes processes',
      component: 'Automations',
      duration: 30,
      highlights: ['Smart triggers', 'Custom workflows', 'AI optimization', 'Integration hub'],
      screenshot: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800',
      features: ['Smart Automation', 'Custom Triggers', 'AI Optimization', 'Integration Hub']
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

  const toggleInterest = (interest: string) => {
    setUserInfo(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const progressPercentage = (progress / demoSteps[currentStep].duration) * 100;
  const overallProgress = ((currentStep * 100) + (progress / demoSteps[currentStep].duration * 100)) / demoSteps.length;

  const interestOptions = [
    'Project Management', 'Team Collaboration', 'Time Tracking', 'Analytics & Reporting',
    'Workflow Automation', 'Resource Planning', 'Budget Management', 'Risk Assessment'
  ];

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
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-xl">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Play className="h-10 w-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Experience ProjectFlow Demo
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  Get a personalized demo experience tailored to your needs and interests
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
                      <option value="ceo">CEO/Founder</option>
                      <option value="cto">CTO</option>
                      <option value="project-manager">Project Manager</option>
                      <option value="team-lead">Team Lead</option>
                      <option value="developer">Developer</option>
                      <option value="designer">Designer</option>
                      <option value="operations">Operations</option>
                      <option value="consultant">Consultant</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Team Size
                  </label>
                  <select
                    value={userInfo.teamSize}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, teamSize: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select team size</option>
                    <option value="1-5">1-5 people</option>
                    <option value="6-20">6-20 people</option>
                    <option value="21-50">21-50 people</option>
                    <option value="51-200">51-200 people</option>
                    <option value="200+">200+ people</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    What are you most interested in? (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {interestOptions.map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`p-3 text-sm rounded-lg border-2 transition-all duration-200 ${
                          userInfo.interests.includes(interest)
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
                  <div className="flex items-start space-x-3">
                    <Star className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      <p className="font-medium mb-2">What you'll see in this demo:</p>
                      <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                        <li>• AI-powered project insights and predictions</li>
                        <li>• Advanced collaboration and communication tools</li>
                        <li>• Comprehensive analytics and reporting features</li>
                        <li>• Intelligent workflow automation capabilities</li>
                        <li>• Enterprise-grade security and compliance features</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center transform hover:scale-105"
                >
                  Start Personalized Demo
                  <ArrowRight className="h-5 w-5 ml-2" />
                </button>

                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  This demo will be customized based on your selections above
                </p>
              </form>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Demo Header */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Welcome {userInfo.name ? userInfo.name.split(' ')[0] : 'to the'} ProjectFlow Demo
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {userInfo.company && `Customized for ${userInfo.company} • `}
                    {userInfo.teamSize && `Team size: ${userInfo.teamSize} • `}
                    Interactive experience
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
                    title="Toggle fullscreen"
                  >
                    <Maximize className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleReset}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
                    title="Reset Demo"
                  >
                    <RotateCcw className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handlePlay}
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    <span>{isPlaying ? 'Pause' : 'Play'} Demo</span>
                  </button>
                </div>
              </div>

              {/* Overall Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Demo Progress
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {Math.round(overallProgress)}% Complete
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${overallProgress}%` }}
                  ></div>
                </div>
              </div>

              {/* Step Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Step {currentStep + 1} of {demoSteps.length}: {demoSteps[currentStep].title}
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

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Demo Steps Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 sticky top-8">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Demo Steps
                  </h3>
                  <div className="space-y-3">
                    {demoSteps.map((step, index) => (
                      <button
                        key={step.id}
                        onClick={() => handleStepClick(index)}
                        className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
                          index === currentStep
                            ? 'bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 shadow-lg transform scale-105'
                            : index < currentStep
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === currentStep
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                              : index < currentStep
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                          }`}>
                            {index < currentStep ? <CheckCircle className="h-5 w-5" /> : index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{step.title}</div>
                            <div className="text-xs opacity-75">{step.duration}s</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Personalization Info */}
                  {userInfo.interests.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Your Interests</h4>
                      <div className="flex flex-wrap gap-2">
                        {userInfo.interests.map((interest) => (
                          <span
                            key={interest}
                            className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Demo Content */}
              <div className="lg:col-span-3">
                <div className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-xl ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
                  {isFullscreen && (
                    <button
                      onClick={() => setIsFullscreen(false)}
                      className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}

                  {/* Demo Header */}
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {demoSteps[currentStep].title}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          {demoSteps[currentStep].description}
                        </p>
                      </div>
                      <div className={`p-3 rounded-xl ${
                        isPlaying ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'
                      }`}>
                        <div className={`w-3 h-3 rounded-full ${
                          isPlaying ? 'bg-red-500 animate-pulse' : 'bg-green-500'
                        }`}></div>
                      </div>
                    </div>
                  </div>

                  {/* Demo Screen */}
                  <div className="relative">
                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                      <div className="text-center p-8 max-w-2xl">
                        <img
                          src={demoSteps[currentStep].screenshot}
                          alt={demoSteps[currentStep].title}
                          className="w-full h-64 object-cover rounded-xl shadow-2xl mb-6"
                        />
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                          {demoSteps[currentStep].title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          {demoSteps[currentStep].description}
                        </p>
                        <button
                          onClick={() => navigate('/dashboard')}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 inline-flex items-center"
                        >
                          Try Interactive Demo
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </button>
                      </div>
                    </div>

                    {/* Demo Overlay */}
                    {isPlaying && (
                      <div className="absolute inset-0 bg-blue-600 bg-opacity-10 flex items-center justify-center">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center space-x-4">
                            <div className="animate-pulse w-4 h-4 bg-red-500 rounded-full"></div>
                            <div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">Demo Playing...</span>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Showing {demoSteps[currentStep].title}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Demo Features */}
                  <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                          <Target className="h-4 w-4 mr-2" />
                          Key Features in this Step:
                        </h4>
                        <div className="space-y-2">
                          {demoSteps[currentStep].highlights.map((highlight, index) => (
                            <div key={index} className="flex items-center space-x-3">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                              <span className="text-gray-700 dark:text-gray-300">{highlight}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                          <Zap className="h-4 w-4 mr-2" />
                          Capabilities:
                        </h4>
                        <div className="space-y-2">
                          {demoSteps[currentStep].features.map((feature, index) => (
                            <div key={index} className="flex items-center space-x-3">
                              <Star className="h-4 w-4 text-blue-500 flex-shrink-0" />
                              <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Demo Navigation */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => currentStep > 0 && handleStepClick(currentStep - 1)}
                      disabled={currentStep === 0}
                      className="flex items-center space-x-2 px-6 py-3 text-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <ArrowRight className="h-4 w-4 rotate-180" />
                      <span>Previous</span>
                    </button>

                    <div className="flex items-center space-x-3">
                      {demoSteps.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => handleStepClick(index)}
                          className={`w-4 h-4 rounded-full transition-all duration-300 ${
                            index === currentStep 
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 scale-125' 
                              : index < currentStep 
                              ? 'bg-green-500' 
                              : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => currentStep < demoSteps.length - 1 ? handleStepClick(currentStep + 1) : handleStartTrial()}
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                    >
                      <span>{currentStep < demoSteps.length - 1 ? 'Next Step' : 'Start Free Trial'}</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* CTA Section */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-center text-white">
                  <h3 className="text-2xl font-bold mb-4">
                    Ready to transform your {userInfo.company || 'team\'s'} project management?
                  </h3>
                  <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                    {userInfo.teamSize 
                      ? `Perfect for teams of ${userInfo.teamSize}. ` 
                      : ''
                    }Join thousands of teams who have improved their productivity with ProjectFlow.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={handleStartTrial}
                      className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
                    >
                      Start 14-Day Free Trial
                    </button>
                    <button
                      onClick={() => navigate('/contact')}
                      className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200 transform hover:scale-105"
                    >
                      Contact Sales Team
                    </button>
                  </div>
                  
                  <div className="flex justify-center space-x-8 mt-8 text-blue-100">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5" />
                      <span>No credit card required</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5" />
                      <span>Enterprise security</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>24/7 support</span>
                    </div>
                  </div>
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