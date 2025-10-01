import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  CheckCircle, 
  Star, 
  Play, 
  Users, 
  Zap, 
  Shield, 
  BarChart3,
  Clock,
  Target,
  Globe,
  Smartphone,
  Monitor,
  Brain,
  Workflow,
  Database,
  Lock,
  Award,
  TrendingUp,
  MessageSquare,
  Calendar,
  FileText,
  Settings,
  ChevronRight,
  Quote,
  Building,
  Mail,
  Phone,
  MapPin,
  Twitter,
  Linkedin,
  Github,
  Menu,
  X,
  Sparkles,
  Rocket,
  Heart,
  Coffee,
  Lightbulb,
  Send,
  Download,
  Upload,
  Code,
  Palette,
  Layers,
  Activity,
  PieChart
} from 'lucide-react';

interface ClientWebsiteProps {
  onNavigateToApp: () => void;
}

const ClientWebsite: React.FC<ClientWebsiteProps> = ({ onNavigateToApp }) => {
  // const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [showDemo, setShowDemo] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [currentFeature, setCurrentFeature] = useState(0);
  const [accessRequestForm, setAccessRequestForm] = useState({
    name: '',
    email: '',
    company: '',
    role: '',
    teamSize: '',
    useCase: '',
    message: ''
  });
  const [showAccessRequest, setShowAccessRequest] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Intelligence',
      description: 'Advanced AI that learns from your team\'s patterns and provides intelligent insights',
      features: ['Predictive Analytics', 'Smart Scheduling', 'Risk Detection', 'Performance Optimization'],
      color: 'from-purple-500 to-pink-500',
      demo: 'ai-insights'
    },
    {
      icon: Target,
      title: 'Advanced Project Management',
      description: 'Comprehensive project planning with Gantt charts, resource allocation, and milestone tracking',
      features: ['Interactive Gantt Charts', 'Resource Planning', 'Budget Management', 'Milestone Tracking'],
      color: 'from-blue-500 to-cyan-500',
      demo: 'project-planning'
    },
    {
      icon: Users,
      title: 'Real-Time Collaboration',
      description: 'Seamless team communication with integrated chat, video calls, and file sharing',
      features: ['Live Chat & Video', 'File Sharing', 'Team Workspaces', 'Activity Feeds'],
      color: 'from-green-500 to-emerald-500',
      demo: 'collaboration'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Powerful insights and custom reporting for data-driven decision making',
      features: ['Custom Dashboards', 'Performance Metrics', 'Predictive Analytics', 'Export Tools'],
      color: 'from-orange-500 to-red-500',
      demo: 'analytics'
    },
    {
      icon: Workflow,
      title: 'Intelligent Automation',
      description: 'Smart workflow automation that adapts to your team\'s working patterns',
      features: ['Smart Triggers', 'Custom Workflows', 'AI Optimization', 'Integration Hub'],
      color: 'from-yellow-500 to-orange-500',
      demo: 'automation'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level security with compliance, audit trails, and advanced access controls',
      features: ['SSO Integration', '2FA Security', 'Audit Logs', 'Data Encryption'],
      color: 'from-red-500 to-pink-500',
      demo: 'security'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'VP of Engineering',
      company: 'TechCorp Inc.',
      content: 'ProjectFlow transformed how we manage projects. The AI-powered insights have improved our delivery time by 40% and reduced project risks significantly.',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      company: 'StartupXYZ',
      content: 'The best project management tool we\'ve used. Seamless integration with our existing tools and excellent team collaboration features. ROI was immediate.',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Operations Director',
      company: 'Global Solutions',
      content: 'ProjectFlow\'s automation features saved us countless hours. The comprehensive analytics help us make better decisions and the security features give us peace of mind.',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: 9,
      period: 'per user/month',
      description: 'Perfect for small teams getting started',
      features: [
        'Up to 10 users',
        'Unlimited projects',
        '10GB storage',
        'Basic integrations',
        'Email support',
        'Mobile apps'
      ],
      cta: 'Start Free Trial',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Professional',
      price: 29,
      period: 'per user/month',
      description: 'Advanced features for growing teams',
      features: [
        'Up to 50 users',
        'Unlimited projects',
        '100GB storage',
        'Advanced integrations',
        'Time tracking',
        'Custom fields',
        'Priority support',
        'Advanced analytics'
      ],
      popular: true,
      cta: 'Start Free Trial',
      color: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Enterprise',
      price: 99,
      period: 'per user/month',
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
      cta: 'Contact Sales',
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    onNavigateToApp();
  };

  // const handleRequestDemo = () => {
  //   navigate('/demo');
  // };

  const handleAccessRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setShowAccessRequest(false);
    
    // Show success message
    alert('Thank you for your interest! We\'ll be in touch within 24 hours.');
    
    // Reset form
    setAccessRequestForm({
      name: '',
      email: '',
      company: '',
      role: '',
      teamSize: '',
      useCase: '',
      message: ''
    });
  };

  const handleNewsletterSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      alert(`Thank you for subscribing with ${email}!`);
      setEmail('');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PF</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">ProjectFlow</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">Features</a>
              <a href="#demo" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">Demo</a>
              <a href="#pricing" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">Pricing</a>
              <a href="#testimonials" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">Testimonials</a>
              <button
                
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Contact
              </button>
              <button
              
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium"
              >
                View Demo
              </button>
              <button
                onClick={() => setShowAccessRequest(true)}
                className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors font-medium"
              >
                Request Access
              </button>
              <button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Get Started
              </button>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 dark:text-gray-300"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            <div className="px-4 py-2 space-y-2">
              <a href="#features" className="block py-2 text-gray-600 dark:text-gray-300">Features</a>
              <a href="#demo" className="block py-2 text-gray-600 dark:text-gray-300">Demo</a>
              <a href="#pricing" className="block py-2 text-gray-600 dark:text-gray-300">Pricing</a>
              <a href="#testimonials" className="block py-2 text-gray-600 dark:text-gray-300">Testimonials</a>
              <button
                
                className="block w-full text-left py-2 text-gray-600 dark:text-gray-300"
              >
                Contact
              </button>
              <button

                className="block w-full text-left py-2 text-blue-600 dark:text-blue-400"
              >
                View Demo
              </button>
              <button
                onClick={() => setShowAccessRequest(true)}
                className="block w-full text-left py-2 text-purple-600 dark:text-purple-400"
              >
                Request Access
              </button>
              <button
                onClick={handleGetStarted}
                className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg mt-2"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-20 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium">
                  <Brain className="h-4 w-4 mr-2" />
                  Next-Generation Project Management
                </div>
                <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight">
                  Project Management
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                    Reimagined
                  </span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                  The world's most advanced project management platform. Powered by AI, built for scale, 
                  designed for teams who demand excellence. Transform how your organization delivers projects.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-xl flex items-center justify-center group"
                >
                  Start Free Trial
                  <ArrowRight className="inline-block ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={handleRequestDemo}
                  className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-xl text-lg font-semibold hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 flex items-center justify-center group"
                >
                  <Play className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>No credit card</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Cancel anytime</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Enterprise ready</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-3xl opacity-20 transform rotate-6"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-1">
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6">
                  <img 
                    src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800" 
                    alt="ProjectFlow Dashboard"
                    className="w-full h-auto rounded-xl shadow-2xl"
                  />
                </div>
              </div>
              <div className="absolute -top-6 -right-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full text-sm font-bold transform rotate-12 shadow-lg">
                #1 Rated Platform
              </div>
              <div className="absolute -bottom-6 -left-6 bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-3 rounded-full text-sm font-bold transform -rotate-12 shadow-lg">
                AI-Powered
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">Trusted by 50,000+ teams worldwide</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 items-center">
            {[
              { name: 'Microsoft', logo: '🏢' },
              { name: 'Google', logo: '🔍' },
              { name: 'Amazon', logo: '📦' },
              { name: 'Apple', logo: '🍎' },
              { name: 'Meta', logo: '👥' },
              { name: 'Netflix', logo: '🎬' }
            ].map((company) => (
              <div key={company.name} className="text-center opacity-60 hover:opacity-100 transition-opacity">
                <div className="text-4xl mb-2">{company.logo}</div>
                <div className="text-lg font-bold text-gray-600 dark:text-gray-400">{company.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section id="demo" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              See ProjectFlow in Action
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Explore our powerful features through an interactive demo. See how ProjectFlow can transform your team's productivity.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentFeature(index)}
                    className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 ${
                      index === currentFeature
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-xl transform scale-105'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.color}`}>
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                          {feature.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {feature.features.map((item, idx) => (
                            <span
                              key={idx}
                              className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="flex space-x-4">
                <button
                  
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center transform hover:scale-105"
                >
                  Try Interactive Demo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </button>
                <button
                  onClick={() => setShowAccessRequest(true)}
                  className="flex-1 border-2 border-purple-500 text-purple-600 dark:text-purple-400 px-6 py-3 rounded-xl font-semibold hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                >
                  Request Access
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-1">
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6">
                  <img 
                    src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt={features[currentFeature].title}
                    className="w-full h-auto rounded-xl shadow-xl"
                  />
                </div>
              </div>
              <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Live Demo</span>
                </div>
              </div>
              <div className="absolute bottom-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg shadow-lg">
                <span className="text-sm font-medium">{features[currentFeature].title}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Everything you need to manage projects
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              From planning to execution, ProjectFlow provides all the tools your team needs to deliver exceptional results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:border-transparent relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {feature.description}
                </p>
                <ul className="space-y-3">
                  {feature.features.map((item, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">50,000+</div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">Active Teams</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">2M+</div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">Projects Completed</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">40%</div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">Faster Delivery</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">99.9%</div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">Uptime SLA</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Loved by teams everywhere
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              See what our customers have to say about ProjectFlow
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <Quote className="h-16 w-16 text-blue-600 dark:text-blue-400 mx-auto mb-8" />
                <blockquote className="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-8 leading-relaxed">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>
                <div className="flex items-center justify-center space-x-4">
                  <img
                    src={testimonials[currentTestimonial].avatar}
                    alt={testimonials[currentTestimonial].name}
                    className="w-16 h-16 rounded-full border-4 border-white shadow-lg"
                  />
                  <div className="text-left">
                    <div className="font-semibold text-gray-900 dark:text-white text-lg">
                      {testimonials[currentTestimonial].name}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {testimonials[currentTestimonial].role}
                    </div>
                    <div className="text-blue-600 dark:text-blue-400 font-medium">
                      {testimonials[currentTestimonial].company}
                    </div>
                  </div>
                </div>
                <div className="flex justify-center mt-6">
                  {Array.from({ length: testimonials[currentTestimonial].rating }).map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
            </div>

            {/* Testimonial Navigation */}
            <div className="flex justify-center mt-8 space-x-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    index === currentTestimonial 
                      ? 'bg-blue-600 scale-125' 
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Choose the plan that's right for your team. All plans include a 14-day free trial.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white dark:bg-gray-800 rounded-3xl p-8 border-2 transition-all duration-300 hover:shadow-2xl transform hover:scale-105 ${
                  plan.popular 
                    ? 'border-purple-500 shadow-2xl ring-4 ring-purple-100 dark:ring-purple-900/30' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className={`w-16 h-16 bg-gradient-to-r ${plan.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <Building className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-5xl font-bold text-gray-900 dark:text-white">${plan.price}</span>
                    <span className="text-gray-600 dark:text-gray-400 ml-2">{plan.period}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={plan.name === 'Enterprise' ? () => setShowAccessRequest(true) : handleGetStarted}
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Ready to transform your project management?
              </h2>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Join thousands of teams who have already improved their productivity with ProjectFlow's AI-powered platform.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 shadow-xl"
              >
                Start Free Trial
              </button>
              <button
                onClick={() => setShowAccessRequest(true)}
                className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200 transform hover:scale-105"
              >
                Request Enterprise Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Access Request Modal */}
      {showAccessRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Request Access to ProjectFlow</h3>
              <button
                onClick={() => setShowAccessRequest(false)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleAccessRequest} className="p-6 space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Rocket className="h-8 w-8 text-white" />
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Tell us about your needs and we'll get you set up with the perfect plan for your team.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={accessRequestForm.name}
                    onChange={(e) => setAccessRequestForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={accessRequestForm.email}
                    onChange={(e) => setAccessRequestForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter your work email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company *
                  </label>
                  <input
                    type="text"
                    required
                    value={accessRequestForm.company}
                    onChange={(e) => setAccessRequestForm(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Your company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role *
                  </label>
                  <select
                    required
                    value={accessRequestForm.role}
                    onChange={(e) => setAccessRequestForm(prev => ({ ...prev, role: e.target.value }))}
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
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Team Size *
                  </label>
                  <select
                    required
                    value={accessRequestForm.teamSize}
                    onChange={(e) => setAccessRequestForm(prev => ({ ...prev, teamSize: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select team size</option>
                    <option value="1-10">1-10 people</option>
                    <option value="11-50">11-50 people</option>
                    <option value="51-200">51-200 people</option>
                    <option value="201-1000">201-1000 people</option>
                    <option value="1000+">1000+ people</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Primary Use Case *
                  </label>
                  <select
                    required
                    value={accessRequestForm.useCase}
                    onChange={(e) => setAccessRequestForm(prev => ({ ...prev, useCase: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select use case</option>
                    <option value="software-development">Software Development</option>
                    <option value="marketing">Marketing Campaigns</option>
                    <option value="consulting">Consulting Projects</option>
                    <option value="construction">Construction</option>
                    <option value="creative">Creative Projects</option>
                    <option value="research">Research & Development</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tell us about your needs
                </label>
                <textarea
                  value={accessRequestForm.message}
                  onChange={(e) => setAccessRequestForm(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  placeholder="What specific challenges are you looking to solve? Any particular features you're interested in?"
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium mb-1">What happens next?</p>
                    <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                      <li>• Our team will review your request within 24 hours</li>
                      <li>• We'll schedule a personalized demo based on your needs</li>
                      <li>• Get a custom quote and implementation plan</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting Request...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Submit Access Request
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">PF</span>
                </div>
                <span className="text-xl font-bold">ProjectFlow</span>
              </div>
              <p className="text-gray-400 max-w-xs">
                The most advanced project management platform for modern teams. Built with AI, designed for scale.
              </p>
              <div className="flex space-x-4">
                <Twitter className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <Linkedin className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <Github className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#integrations" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#security" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#api" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#careers" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#blog" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#press" className="hover:text-white transition-colors">Press</a></li>
                <li><a href="#partners" className="hover:text-white transition-colors">Partners</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#help" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#docs" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#community" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#status" className="hover:text-white transition-colors">System Status</a></li>
                <li>
                  <button 
                    
                    className="hover:text-white transition-colors">Contact</button></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© 2024 ProjectFlow. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              <a href="#cookies" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ClientWebsite;