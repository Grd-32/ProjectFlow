import React, { useState, useEffect } from 'react';
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
  Zap,
  Shield,
  Brain,
  Activity,
  TrendingUp,
  Star,
  Award,
  Globe,
  Smartphone,
  Monitor,
  X
} from 'lucide-react';

interface DemoShowcaseProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTrial: () => void;
}

const DemoShowcase: React.FC<DemoShowcaseProps> = ({ isOpen, onClose, onStartTrial }) => {
  const [currentDemo, setCurrentDemo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const demoSections = [
    {
      id: 'dashboard',
      title: 'AI-Powered Dashboard',
      description: 'Get intelligent insights and real-time project overview',
      duration: 30,
      features: ['Real-time metrics', 'AI predictions', 'Custom widgets', 'Performance tracking'],
      screenshot: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
      icon: BarChart3
    },
    {
      id: 'projects',
      title: 'Advanced Project Management',
      description: 'Comprehensive project planning with Gantt charts and resource allocation',
      duration: 45,
      features: ['Interactive Gantt', 'Resource planning', 'Budget tracking', 'Milestone management'],
      screenshot: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
      icon: Target
    },
    {
      id: 'collaboration',
      title: 'Team Collaboration',
      description: 'Real-time communication and seamless teamwork',
      duration: 35,
      features: ['Live chat', 'Video calls', 'File sharing', 'Team workspaces'],
      screenshot: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800',
      icon: MessageSquare
    },
    {
      id: 'automation',
      title: 'Intelligent Automation',
      description: 'Smart workflows that adapt to your team',
      duration: 40,
      features: ['Smart triggers', 'Custom workflows', 'AI optimization', 'Integration hub'],
      screenshot: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800',
      icon: Zap
    }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 1;
          if (newProgress >= demoSections[currentDemo].duration) {
            if (currentDemo < demoSections.length - 1) {
              setCurrentDemo(prev => prev + 1);
              return 0;
            } else {
              setIsPlaying(false);
              return demoSections[currentDemo].duration;
            }
          }
          return newProgress;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isPlaying, currentDemo, demoSections]);

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentDemo(0);
    setProgress(0);
  };

  const progressPercentage = (progress / demoSections[currentDemo].duration) * 100;
  const overallProgress = ((currentDemo * 100) + progressPercentage) / demoSections.length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">ProjectFlow Interactive Demo</h3>
            <p className="text-gray-600 dark:text-gray-400">Experience the future of project management</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
          {/* Demo Navigation */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Demo Sections</h4>
                <div className="space-y-2">
                  {demoSections.map((section, index) => (
                    <button
                      key={section.id}
                      onClick={() => {
                        setCurrentDemo(index);
                        setProgress(0);
                        setIsPlaying(false);
                      }}
                      className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                        index === currentDemo
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <section.icon className="h-5 w-5" />
                        <div>
                          <div className="font-medium">{section.title}</div>
                          <div className="text-xs opacity-75">{section.duration}s</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">Current Section</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {demoSections[currentDemo].description}
                </p>
                <div className="space-y-1">
                  {demoSections[currentDemo].features.map((feature, index) => (
                    <div key={index} className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                      <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Demo Content */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Demo Controls */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {demoSections[currentDemo].title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {demoSections[currentDemo].description}
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
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    <span>{isPlaying ? 'Pause' : 'Play'}</span>
                  </button>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Overall Progress</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {Math.round(overallProgress)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${overallProgress}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Section {currentDemo + 1} of {demoSections.length}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {progress}s / {demoSections[currentDemo].duration}s
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
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-600">
                  <img
                    src={demoSections[currentDemo].screenshot}
                    alt={demoSections[currentDemo].title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Demo Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
                    <div className="p-6 text-white">
                      <h5 className="text-xl font-semibold mb-2">{demoSections[currentDemo].title}</h5>
                      <p className="text-blue-100">{demoSections[currentDemo].description}</p>
                    </div>
                  </div>

                  {isPlaying && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
                      LIVE
                    </div>
                  )}
                </div>
              </div>

              {/* Demo Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onStartTrial}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center transform hover:scale-105"
                >
                  Start Free Trial
                  <ArrowRight className="h-4 w-4 ml-2" />
                </button>
                <button
                  onClick={() => {
                    onClose();
                    // Navigate to interactive demo
                  }}
                  className="flex-1 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl font-semibold hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Try Interactive Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoShowcase;