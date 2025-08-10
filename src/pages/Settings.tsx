import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import { useNotification } from '../contexts/NotificationContext';
import { useIntegration } from '../contexts/IntegrationContext';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Smartphone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save,
  Database,
  Zap,
  Users,
  Building,
  CreditCard,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  Camera,
  Phone,
  MapPin,
  Calendar,
  Languages,
  Clock,
  Wifi,
  WifiOff,
  RefreshCw,
  Key,
  FileText,
  HardDrive,
  Cloud,
  Monitor,
  Headphones,
  Volume2,
  VolumeX
} from 'lucide-react';
import { format } from 'date-fns';

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { currentUser, updateUser, hasPermission } = useUser();
  const { addNotification } = useNotification();
  const { integrations, connectIntegration, disconnectIntegration, syncIntegration } = useIntegration();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'appearance' | 'integrations' | 'billing' | 'advanced' | 'privacy' | 'accessibility'>('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    department: currentUser.department,
    phone: '',
    location: '',
    bio: '',
    timezone: 'UTC',
    language: 'en',
    dateFormat: 'MM/dd/yyyy',
    timeFormat: '12h',
    avatar: ''
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    desktop: false,
    taskUpdates: true,
    deadlineReminders: true,
    weeklyReports: false,
    projectUpdates: true,
    teamMentions: true,
    systemAlerts: true,
    budgetAlerts: true,
    automationResults: true,
    chatMessages: true,
    calendarEvents: true
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    sessionTimeout: 30,
    loginNotifications: true,
    deviceTracking: true,
    apiAccess: false
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'team',
    activityTracking: true,
    dataCollection: true,
    thirdPartySharing: false,
    analyticsOptOut: false
  });

  const [accessibilitySettings, setAccessibilitySettings] = useState({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: true,
    soundEffects: true
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    
    addNotification({
      type: 'info',
      title: 'Notification Setting Updated',
      message: `${key.replace(/([A-Z])/g, ' $1').toLowerCase()} notifications ${value ? 'enabled' : 'disabled'}`,
      userId: currentUser.id,
      relatedEntity: {
        type: 'user',
        id: currentUser.id,
        name: 'Notification Settings'
      }
    });
  };

  const handleSaveProfile = () => {
    updateUser(currentUser.id, {
      name: formData.name,
      email: formData.email,
      department: formData.department
    });

    addNotification({
      type: 'success',
      title: 'Profile Updated',
      message: 'Your profile has been updated successfully',
      userId: currentUser.id,
      relatedEntity: {
        type: 'user',
        id: currentUser.id,
        name: formData.name
      }
    });
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      addNotification({
        type: 'error',
        title: 'Password Mismatch',
        message: 'New password and confirmation do not match',
        userId: currentUser.id,
        relatedEntity: {
          type: 'user',
          id: currentUser.id,
          name: 'Password Change'
        }
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      addNotification({
        type: 'error',
        title: 'Password Too Short',
        message: 'Password must be at least 8 characters long',
        userId: currentUser.id,
        relatedEntity: {
          type: 'user',
          id: currentUser.id,
          name: 'Password Change'
        }
      });
      return;
    }

    addNotification({
      type: 'success',
      title: 'Password Updated',
      message: 'Your password has been changed successfully',
      userId: currentUser.id,
      relatedEntity: {
        type: 'user',
        id: currentUser.id,
        name: 'Password Change'
      }
    });

    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleConnectIntegration = (integrationName: string) => {
    const integration = integrations.find(i => i.name === integrationName);
    if (integration && integration.status === 'disconnected') {
      connectIntegration({
        name: integrationName,
        type: integration.type,
        status: 'connected',
        config: { syncEnabled: true },
        features: integration.features
      });
    }
  };

  const handleDisconnectIntegration = (integrationName: string) => {
    const integration = integrations.find(i => i.name === integrationName);
    if (integration && integration.status === 'connected') {
      disconnectIntegration(integration.id);
    }
  };

  const handleSyncIntegration = (integrationId: string) => {
    syncIntegration(integrationId);
    
    addNotification({
      type: 'info',
      title: 'Sync Started',
      message: 'Integration sync has been initiated',
      userId: currentUser.id,
      relatedEntity: {
        type: 'project',
        id: integrationId,
        name: 'Integration Sync'
      }
    });
  };

  const exportUserData = () => {
    const userData = {
      profile: formData,
      settings: {
        notifications,
        security: securitySettings,
        privacy: privacySettings,
        accessibility: accessibilitySettings
      },
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'user-data-export.json';
    link.click();

    addNotification({
      type: 'success',
      title: 'Data Exported',
      message: 'Your data has been exported successfully',
      userId: currentUser.id,
      relatedEntity: {
        type: 'user',
        id: currentUser.id,
        name: 'Data Export'
      }
    });
  };

  const deleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      addNotification({
        type: 'error',
        title: 'Account Deletion Initiated',
        message: 'Account deletion process has been started. You will receive an email confirmation.',
        userId: currentUser.id,
        relatedEntity: {
          type: 'user',
          id: currentUser.id,
          name: 'Account Deletion'
        }
      });
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'integrations', label: 'Integrations', icon: Zap },
    { id: 'privacy', label: 'Privacy', icon: Eye },
    { id: 'accessibility', label: 'Accessibility', icon: Monitor },
    ...(hasPermission('manage_settings') ? [
      { id: 'billing', label: 'Billing', icon: CreditCard },
      { id: 'advanced', label: 'Advanced', icon: Database }
    ] : [])
  ];

  return (
    <div className="p-6 max-w-6xl h-full overflow-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account and application preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Profile Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-2xl font-medium">{currentUser.initials}</span>
                    </div>
                    <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <button 
                      onClick={() => {
                        addNotification({
                          type: 'info',
                          title: 'Photo Upload',
                          message: 'Photo upload feature will be available soon',
                          userId: currentUser.id,
                          relatedEntity: {
                            type: 'user',
                            id: currentUser.id,
                            name: 'Profile Photo'
                          }
                        });
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      Change Photo
                    </button>
                    <p className="text-xs text-gray-500 dark:text-gray-400">JPG, GIF or PNG. 1MB max.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <User className="h-4 w-4 inline mr-2" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Mail className="h-4 w-4 inline mr-2" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Building className="h-4 w-4 inline mr-2" />
                      Department
                    </label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Phone className="h-4 w-4 inline mr-2" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <MapPin className="h-4 w-4 inline mr-2" />
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                      placeholder="Enter location"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Clock className="h-4 w-4 inline mr-2" />
                      Time Zone
                    </label>
                    <select
                      value={formData.timezone}
                      onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">London</option>
                      <option value="Europe/Paris">Paris</option>
                      <option value="Asia/Tokyo">Tokyo</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FileText className="h-4 w-4 inline mr-2" />
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Password & Authentication</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full px-3 py-2 pr-10 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <button 
                    onClick={handlePasswordChange}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                  >
                    Update Password
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Security Settings</h2>
                
                <div className="space-y-4">
                  {[
                    { key: 'twoFactorEnabled', label: 'Two-Factor Authentication', description: 'Add an extra layer of security' },
                    { key: 'loginNotifications', label: 'Login Notifications', description: 'Get notified of new login attempts' },
                    { key: 'deviceTracking', label: 'Device Tracking', description: 'Track devices that access your account' },
                    { key: 'apiAccess', label: 'API Access', description: 'Allow third-party API access' }
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">{setting.label}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{setting.description}</p>
                      </div>
                      <button
                        onClick={() => setSecuritySettings(prev => ({ 
                          ...prev, 
                          [setting.key]: !prev[setting.key as keyof typeof prev] 
                        }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          securitySettings[setting.key as keyof typeof securitySettings]
                            ? 'bg-blue-600 dark:bg-blue-500'
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            securitySettings[setting.key as keyof typeof securitySettings] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}

                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Session Timeout</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Automatically log out after inactivity</p>
                      </div>
                      <select
                        value={securitySettings.sessionTimeout}
                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: Number(e.target.value) }))}
                        className="px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                      >
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={60}>1 hour</option>
                        <option value={120}>2 hours</option>
                        <option value={480}>8 hours</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Active Sessions</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Monitor className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Current Session</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Chrome on macOS • Last active now</p>
                      </div>
                    </div>
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <Smartphone className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Mobile Session</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Safari on iPhone • 2 hours ago</p>
                      </div>
                    </div>
                    <button className="text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded">
                      Revoke
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Notification Preferences</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Delivery Methods</h3>
                  <div className="space-y-4">
                    {[
                      { key: 'email', label: 'Email notifications', icon: Mail, description: 'Receive notifications via email' },
                      { key: 'push', label: 'Push notifications', icon: Smartphone, description: 'Browser push notifications' },
                      { key: 'desktop', label: 'Desktop notifications', icon: Monitor, description: 'System desktop notifications' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <item.icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          <div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleNotificationChange(item.key, !notifications[item.key as keyof typeof notifications])}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notifications[item.key as keyof typeof notifications]
                              ? 'bg-blue-600 dark:bg-blue-500'
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notifications[item.key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Notification Types</h3>
                  <div className="space-y-4">
                    {[
                      { key: 'taskUpdates', label: 'Task updates and comments', icon: CheckSquare },
                      { key: 'deadlineReminders', label: 'Deadline reminders', icon: Clock },
                      { key: 'projectUpdates', label: 'Project status changes', icon: FileText },
                      { key: 'teamMentions', label: 'Team mentions and assignments', icon: Users },
                      { key: 'weeklyReports', label: 'Weekly progress reports', icon: BarChart3 },
                      { key: 'systemAlerts', label: 'System alerts and maintenance', icon: AlertTriangle },
                      { key: 'budgetAlerts', label: 'Budget and expense alerts', icon: DollarSign },
                      { key: 'automationResults', label: 'Automation execution results', icon: Zap },
                      { key: 'chatMessages', label: 'Chat messages and mentions', icon: MessageSquare },
                      { key: 'calendarEvents', label: 'Calendar events and reminders', icon: Calendar }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <div className="flex items-center space-x-3">
                          <item.icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                        </div>
                        <button
                          onClick={() => handleNotificationChange(item.key, !notifications[item.key as keyof typeof notifications])}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notifications[item.key as keyof typeof notifications]
                              ? 'bg-blue-600 dark:bg-blue-500'
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notifications[item.key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-1'
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

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Appearance & Display</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Theme
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'light', label: 'Light', icon: '☀️', description: 'Light theme' },
                      { value: 'dark', label: 'Dark', icon: '🌙', description: 'Dark theme' },
                      { value: 'system', label: 'System', icon: '💻', description: 'Follow system' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setTheme(option.value as any)}
                        className={`p-4 text-sm font-medium rounded-lg border transition-colors ${
                          theme === option.value
                            ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                            : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                      >
                        <div className="text-2xl mb-2">{option.icon}</div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{option.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Languages className="h-4 w-4 inline mr-2" />
                      Language
                    </label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="it">Italian</option>
                      <option value="pt">Portuguese</option>
                      <option value="ja">Japanese</option>
                      <option value="zh">Chinese</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Calendar className="h-4 w-4 inline mr-2" />
                      Date Format
                    </label>
                    <select
                      value={formData.dateFormat}
                      onChange={(e) => setFormData(prev => ({ ...prev, dateFormat: e.target.value }))}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                    >
                      <option value="MM/dd/yyyy">MM/DD/YYYY</option>
                      <option value="dd/MM/yyyy">DD/MM/YYYY</option>
                      <option value="yyyy-MM-dd">YYYY-MM-DD</option>
                      <option value="MMM d, yyyy">MMM D, YYYY</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Clock className="h-4 w-4 inline mr-2" />
                      Time Format
                    </label>
                    <select
                      value={formData.timeFormat}
                      onChange={(e) => setFormData(prev => ({ ...prev, timeFormat: e.target.value }))}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                    >
                      <option value="12h">12 Hour (AM/PM)</option>
                      <option value="24h">24 Hour</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Globe className="h-4 w-4 inline mr-2" />
                      Currency
                    </label>
                    <select
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="JPY">JPY (¥)</option>
                      <option value="CAD">CAD (C$)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Integrations */}
          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Communication Tools</h2>
                
                <div className="space-y-4">
                  {integrations.filter(i => i.type === 'communication').map((integration) => (
                    <div key={integration.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          integration.status === 'connected' 
                            ? 'bg-green-100 dark:bg-green-900/30' 
                            : 'bg-gray-100 dark:bg-gray-700'
                        }`}>
                          <Zap className={`h-4 w-4 ${
                            integration.status === 'connected' 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-gray-600 dark:text-gray-400'
                          }`} />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">{integration.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {integration.status === 'connected' 
                              ? `Connected • Last sync: ${integration.lastSync ? format(new Date(integration.lastSync), 'MMM d, HH:mm') : 'Never'}`
                              : 'Not connected'
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {integration.status === 'connected' && (
                          <button
                            onClick={() => handleSyncIntegration(integration.id)}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="Sync now"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => integration.status === 'connected' 
                            ? handleDisconnectIntegration(integration.name)
                            : handleConnectIntegration(integration.name)
                          }
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            integration.status === 'connected'
                              ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50'
                              : 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50'
                          }`}
                        >
                          {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">File Storage</h2>
                
                <div className="space-y-4">
                  {integrations.filter(i => i.type === 'storage').map((integration) => (
                    <div key={integration.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          integration.status === 'connected' 
                            ? 'bg-green-100 dark:bg-green-900/30' 
                            : 'bg-gray-100 dark:bg-gray-700'
                        }`}>
                          <Cloud className={`h-4 w-4 ${
                            integration.status === 'connected' 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-gray-600 dark:text-gray-400'
                          }`} />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">{integration.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {integration.status === 'connected' 
                              ? 'Sync enabled • Auto-backup active'
                              : 'Connect to enable file sync'
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {integration.status === 'connected' && (
                          <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded">
                            Connected
                          </span>
                        )}
                        <button
                          onClick={() => integration.status === 'connected' 
                            ? handleDisconnectIntegration(integration.name)
                            : handleConnectIntegration(integration.name)
                          }
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            integration.status === 'connected'
                              ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50'
                              : 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50'
                          }`}
                        >
                          {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Calendar Integration</h2>
                
                <div className="space-y-4">
                  {integrations.filter(i => i.type === 'calendar').map((integration) => (
                    <div key={integration.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          integration.status === 'connected' 
                            ? 'bg-green-100 dark:bg-green-900/30' 
                            : 'bg-gray-100 dark:bg-gray-700'
                        }`}>
                          <Calendar className={`h-4 w-4 ${
                            integration.status === 'connected' 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-gray-600 dark:text-gray-400'
                          }`} />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">{integration.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {integration.status === 'connected' 
                              ? 'Sync tasks and deadlines with calendar'
                              : 'Connect to sync with calendar'
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {integration.status === 'connected' && (
                          <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded">
                            Syncing
                          </span>
                        )}
                        <button
                          onClick={() => integration.status === 'connected' 
                            ? handleDisconnectIntegration(integration.name)
                            : handleConnectIntegration(integration.name)
                          }
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            integration.status === 'connected'
                              ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50'
                              : 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50'
                          }`}
                        >
                          {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Privacy Settings */}
          {activeTab === 'privacy' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Privacy & Data</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Profile Visibility</h3>
                  <div className="space-y-3">
                    {[
                      { value: 'public', label: 'Public', description: 'Visible to everyone' },
                      { value: 'team', label: 'Team Only', description: 'Visible to team members only' },
                      { value: 'private', label: 'Private', description: 'Only visible to you' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                        <input
                          type="radio"
                          name="profileVisibility"
                          value={option.value}
                          checked={privacySettings.profileVisibility === option.value}
                          onChange={(e) => setPrivacySettings(prev => ({ ...prev, profileVisibility: e.target.value }))}
                          className="text-blue-600"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{option.label}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{option.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'activityTracking', label: 'Activity Tracking', description: 'Track your activity for analytics' },
                    { key: 'dataCollection', label: 'Data Collection', description: 'Allow data collection for improvements' },
                    { key: 'thirdPartySharing', label: 'Third-party Sharing', description: 'Share data with integrated services' },
                    { key: 'analyticsOptOut', label: 'Opt-out of Analytics', description: 'Exclude from usage analytics' }
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">{setting.label}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{setting.description}</p>
                      </div>
                      <button
                        onClick={() => setPrivacySettings(prev => ({ 
                          ...prev, 
                          [setting.key]: !prev[setting.key as keyof typeof prev] 
                        }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          privacySettings[setting.key as keyof typeof privacySettings]
                            ? 'bg-blue-600 dark:bg-blue-500'
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            privacySettings[setting.key as keyof typeof privacySettings] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Accessibility Settings */}
          {activeTab === 'accessibility' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Accessibility Options</h2>
              
              <div className="space-y-4">
                {[
                  { key: 'highContrast', label: 'High Contrast Mode', description: 'Increase contrast for better visibility', icon: Eye },
                  { key: 'largeText', label: 'Large Text', description: 'Increase text size throughout the app', icon: FileText },
                  { key: 'reducedMotion', label: 'Reduced Motion', description: 'Minimize animations and transitions', icon: Pause },
                  { key: 'screenReader', label: 'Screen Reader Support', description: 'Optimize for screen readers', icon: Headphones },
                  { key: 'keyboardNavigation', label: 'Keyboard Navigation', description: 'Enhanced keyboard shortcuts', icon: Key },
                  { key: 'soundEffects', label: 'Sound Effects', description: 'Audio feedback for actions', icon: Volume2 }
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <setting.icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">{setting.label}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{setting.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setAccessibilitySettings(prev => ({ 
                        ...prev, 
                        [setting.key]: !prev[setting.key as keyof typeof prev] 
                      }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        accessibilitySettings[setting.key as keyof typeof accessibilitySettings]
                          ? 'bg-blue-600 dark:bg-blue-500'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          accessibilitySettings[setting.key as keyof typeof accessibilitySettings] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Billing (Admin only) */}
          {activeTab === 'billing' && hasPermission('manage_settings') && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Subscription & Billing</h2>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">Enterprise Plan</h3>
                      <p className="text-sm text-blue-700 dark:text-blue-300">$99/month • Next billing: Jan 15, 2025</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-blue-600 dark:text-blue-400">
                        <span>✓ Unlimited projects</span>
                        <span>✓ Advanced analytics</span>
                        <span>✓ Priority support</span>
                      </div>
                    </div>
                    <button className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-white dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors">
                      Manage Plan
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Payment Method</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">•••• •••• •••• 4242 • Expires 12/26</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                      Update
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Billing History</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Download invoices and receipts</p>
                      </div>
                    </div>
                    <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Users className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Team Usage</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">6 of 25 seats used</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">$594/month</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">$99 × 6 users</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Settings (Admin only) */}
          {activeTab === 'advanced' && hasPermission('manage_settings') && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Data Management</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Download className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Export Data</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Download all your data in JSON format</p>
                      </div>
                    </div>
                    <button 
                      onClick={exportUserData}
                      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      <span>Export</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Upload className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Import Data</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Import data from other project management tools</p>
                      </div>
                    </div>
                    <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                      <Upload className="h-4 w-4" />
                      <span>Import</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <HardDrive className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Storage Usage</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">2.3 GB of 10 GB used</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-1">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '23%' }}></div>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">23% used</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800 p-6">
                <h2 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-6 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Danger Zone
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div>
                      <h3 className="text-sm font-medium text-red-900 dark:text-red-100">Delete Account</h3>
                      <p className="text-sm text-red-700 dark:text-red-300">Permanently delete your account and all data</p>
                    </div>
                    <button 
                      onClick={deleteAccount}
                      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Account</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;