import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useSettings } from '../contexts/SettingsContext';
import { LanguageSelector } from '../components/MultiLanguageSupport';
import SecurityAuditLog from '../components/SecurityAuditLog';
import { 
  User, 
  Shield, 
  Bell, 
  Palette, 
  Globe, 
  Zap, 
  Database,
  Key,
  Mail,
  Smartphone,
  Monitor,
  Lock,
  Eye,
  Download,
  Upload,
  RefreshCw,
  Save,
  AlertTriangle,
  CheckCircle,
  Settings as SettingsIcon,
  Users,
  Building,
  CreditCard,
  FileText,
  Calendar,
  Clock,
  Trash2,
  Plus,
  Edit3
} from 'lucide-react';

const Settings = () => {
  const { hasPermission } = useUser();
  const { 
    settings, 
    updateSettings, 
    integrations, 
    connectIntegration, 
    disconnectIntegration,
    testIntegration,
    exportData,
    importData,
    resetSettings
  } = useSettings();
  
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
  const [testResults, setTestResults] = useState<{ [key: string]: 'success' | 'error' | null }>({});

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User, permission: 'read' },
    { id: 'account', label: 'Account', icon: Shield, permission: 'read' },
    { id: 'notifications', label: 'Notifications', icon: Bell, permission: 'read' },
    { id: 'appearance', label: 'Appearance', icon: Palette, permission: 'read' },
    { id: 'language', label: 'Language & Region', icon: Globe, permission: 'read' },
    { id: 'integrations', label: 'Integrations', icon: Zap, permission: 'read' },
    { id: 'data', label: 'Data & Privacy', icon: Database, permission: 'read' },
    { id: 'security', label: 'Security', icon: Lock, permission: 'manage_settings' },
    { id: 'billing', label: 'Billing', icon: CreditCard, permission: 'manage_settings' },
    { id: 'organization', label: 'Organization', icon: Building, permission: 'manage_users' },
    { id: 'audit', label: 'Audit Log', icon: FileText, permission: 'manage_settings' },
    { id: 'advanced', label: 'Advanced', icon: SettingsIcon, permission: 'manage_settings' }
  ];

  const availableTabs = tabs.filter(tab => hasPermission(tab.permission as any));

  const handleIntegrationConnect = async (integrationType: string, config: any) => {
    setIsLoading(prev => ({ ...prev, [integrationType]: true }));
    
    try {
      await connectIntegration(integrationType, config);
      setTestResults(prev => ({ ...prev, [integrationType]: 'success' }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, [integrationType]: 'error' }));
    } finally {
      setIsLoading(prev => ({ ...prev, [integrationType]: false }));
    }
  };

  const handleTestIntegration = async (integrationId: string) => {
    setIsLoading(prev => ({ ...prev, [integrationId]: true }));
    
    try {
      const result = await testIntegration(integrationId);
      setTestResults(prev => ({ ...prev, [integrationId]: result ? 'success' : 'error' }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, [integrationId]: 'error' }));
    } finally {
      setIsLoading(prev => ({ ...prev, [integrationId]: false }));
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'account':
        return <AccountSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'appearance':
        return <AppearanceSettings />;
      case 'language':
        return <LanguageSettings />;
      case 'integrations':
        return (
          <IntegrationsSettings 
            integrations={integrations}
            onConnect={handleIntegrationConnect}
            onDisconnect={disconnectIntegration}
            onTest={handleTestIntegration}
            isLoading={isLoading}
            testResults={testResults}
          />
        );
      case 'data':
        return <DataPrivacySettings onExport={exportData} onImport={importData} />;
      case 'security':
        return hasPermission('manage_settings') ? <SecuritySettings /> : <AccessDenied />;
      case 'billing':
        return hasPermission('manage_settings') ? <BillingSettings /> : <AccessDenied />;
      case 'organization':
        return hasPermission('manage_users') ? <OrganizationSettings /> : <AccessDenied />;
      case 'audit':
        return hasPermission('manage_settings') ? <SecurityAuditLog /> : <AccessDenied />;
      case 'advanced':
        return hasPermission('manage_settings') ? <AdvancedSettings onReset={resetSettings} /> : <AccessDenied />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* Settings Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage your preferences</p>
        </div>
        <nav className="p-4 space-y-1">
          {availableTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

// Profile Settings Component
const ProfileSettings = () => {
  const { currentUser, updateUser } = useUser();
  const [formData, setFormData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    department: currentUser.department,
    phone: '',
    location: '',
    bio: '',
    timezone: 'UTC',
    avatar: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    updateUser(currentUser.id, formData);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage your personal information</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Edit3 className="h-4 w-4" />
          <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-6 mb-6">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">{currentUser.initials}</span>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{currentUser.name}</h3>
            <p className="text-gray-600 dark:text-gray-400">{currentUser.email}</p>
            <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded mt-1">
              {currentUser.role}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              disabled={!isEditing}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              disabled={!isEditing}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Department</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
              disabled={!isEditing}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Timezone</label>
            <select
              value={formData.timezone}
              onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
              disabled={!isEditing}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 text-gray-900 dark:text-white"
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

        {isEditing && (
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Account Settings Component
const AccountSettings = () => {
  const { settings, updateSettings } = useSettings();
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handlePasswordChange = () => {
    if (passwordData.new !== passwordData.confirm) {
      alert('Passwords do not match');
      return;
    }
    // In real app, this would call API to change password
    updateSettings('security', { ...settings.security, lastPasswordChange: new Date().toISOString() });
    setPasswordData({ current: '', new: '', confirm: '' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Account Settings</h2>
        <p className="text-gray-600 dark:text-gray-400">Manage your account security and preferences</p>
      </div>

      {/* Password Change */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Change Password</h3>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
            <input
              type="password"
              value={passwordData.current}
              onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
            <input
              type="password"
              value={passwordData.new}
              onChange={(e) => setPasswordData(prev => ({ ...prev, new: e.target.value }))}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
            <input
              type="password"
              value={passwordData.confirm}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            />
          </div>
          <button
            onClick={handlePasswordChange}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Update Password
          </button>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Two-Factor Authentication</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security to your account</p>
          </div>
          <button
            onClick={() => updateSettings('security', { 
              ...settings.security, 
              twoFactorEnabled: !settings.security.twoFactorEnabled 
            })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.security.twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.security.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Session Management */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Active Sessions</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <Monitor className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Current Session</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Chrome on Windows • Active now</p>
              </div>
            </div>
            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded">
              Current
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Notification Settings Component
const NotificationSettings = () => {
  const { settings, updateSettings } = useSettings();

  const notificationTypes = [
    { key: 'taskAssigned', label: 'Task Assignments', description: 'When you are assigned to a task' },
    { key: 'taskCompleted', label: 'Task Completions', description: 'When tasks you created are completed' },
    { key: 'projectUpdates', label: 'Project Updates', description: 'When projects you follow are updated' },
    { key: 'mentions', label: 'Mentions', description: 'When someone mentions you in chat' },
    { key: 'deadlines', label: 'Deadline Reminders', description: 'Reminders for upcoming deadlines' },
    { key: 'budgetAlerts', label: 'Budget Alerts', description: 'When projects exceed budget thresholds' }
  ];

  const deliveryMethods = [
    { key: 'inApp', label: 'In-App Notifications', icon: Bell },
    { key: 'email', label: 'Email Notifications', icon: Mail },
    { key: 'push', label: 'Push Notifications', icon: Smartphone }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notification Settings</h2>
        <p className="text-gray-600 dark:text-gray-400">Choose how you want to be notified</p>
      </div>

      {/* Delivery Methods */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Delivery Methods</h3>
        <div className="space-y-4">
          {deliveryMethods.map((method) => (
            <div key={method.key} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <method.icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{method.label}</span>
              </div>
              <button
                onClick={() => updateSettings('notifications', {
                  ...settings.notifications,
                  [method.key]: !settings.notifications[method.key]
                })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notifications[method.key] ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications[method.key] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Notification Types */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notification Types</h3>
        <div className="space-y-4">
          {notificationTypes.map((type) => (
            <div key={type.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{type.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{type.description}</p>
              </div>
              <button
                onClick={() => updateSettings('notifications', {
                  ...settings.notifications,
                  types: {
                    ...settings.notifications.types,
                    [type.key]: !settings.notifications.types[type.key]
                  }
                })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notifications.types[type.key] ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications.types[type.key] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Appearance Settings Component
const AppearanceSettings = () => {
  const { settings, updateSettings } = useSettings();

  const themes = [
    { id: 'light', name: 'Light', description: 'Clean and bright interface' },
    { id: 'dark', name: 'Dark', description: 'Easy on the eyes in low light' },
    { id: 'system', name: 'System', description: 'Follows your system preference' }
  ];

  const densities = [
    { id: 'comfortable', name: 'Comfortable', description: 'More spacing between elements' },
    { id: 'compact', name: 'Compact', description: 'Less spacing, more content visible' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Appearance</h2>
        <p className="text-gray-600 dark:text-gray-400">Customize how ProjectFlow looks and feels</p>
      </div>

      {/* Theme Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Theme</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => updateSettings('appearance', { ...settings.appearance, theme: theme.id })}
              className={`p-4 border-2 rounded-lg text-left transition-colors ${
                settings.appearance.theme === theme.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <h4 className="font-medium text-gray-900 dark:text-white">{theme.name}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{theme.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Density */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Display Density</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {densities.map((density) => (
            <button
              key={density.id}
              onClick={() => updateSettings('appearance', { ...settings.appearance, density: density.id })}
              className={`p-4 border-2 rounded-lg text-left transition-colors ${
                settings.appearance.density === density.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <h4 className="font-medium text-gray-900 dark:text-white">{density.name}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{density.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Other Appearance Options */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Interface Options</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Animations</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Enable smooth transitions and animations</p>
            </div>
            <button
              onClick={() => updateSettings('appearance', {
                ...settings.appearance,
                animations: !settings.appearance.animations
              })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.appearance.animations ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.appearance.animations ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Language Settings Component
const LanguageSettings = () => {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Language & Region</h2>
        <p className="text-gray-600 dark:text-gray-400">Set your language and regional preferences</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Language</label>
            <LanguageSelector className="w-full max-w-xs" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date Format</label>
            <select
              value={settings.regional.dateFormat}
              onChange={(e) => updateSettings('regional', { ...settings.regional, dateFormat: e.target.value })}
              className="w-full max-w-xs px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Time Format</label>
            <select
              value={settings.regional.timeFormat}
              onChange={(e) => updateSettings('regional', { ...settings.regional, timeFormat: e.target.value })}
              className="w-full max-w-xs px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            >
              <option value="12">12-hour (AM/PM)</option>
              <option value="24">24-hour</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Day of Week</label>
            <select
              value={settings.regional.firstDayOfWeek}
              onChange={(e) => updateSettings('regional', { ...settings.regional, firstDayOfWeek: e.target.value })}
              className="w-full max-w-xs px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            >
              <option value="sunday">Sunday</option>
              <option value="monday">Monday</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

// Integrations Settings Component
const IntegrationsSettings = ({ integrations, onConnect, onDisconnect, onTest, isLoading, testResults }: any) => {
  const [showConnectModal, setShowConnectModal] = useState<string | null>(null);
  const [connectionData, setConnectionData] = useState<{ [key: string]: any }>({});

  const availableIntegrations = [
    {
      id: 'slack',
      name: 'Slack',
      type: 'communication',
      description: 'Send notifications to Slack channels',
      icon: '💬',
      fields: [
        { key: 'webhookUrl', label: 'Webhook URL', type: 'url', required: true },
        { key: 'channel', label: 'Default Channel', type: 'text', required: false }
      ]
    },
    {
      id: 'google-drive',
      name: 'Google Drive',
      type: 'storage',
      description: 'Sync files with Google Drive',
      icon: '📁',
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'password', required: true },
        { key: 'folderId', label: 'Folder ID', type: 'text', required: false }
      ]
    },
    {
      id: 'github',
      name: 'GitHub',
      type: 'development',
      description: 'Connect with GitHub repositories',
      icon: '🐙',
      fields: [
        { key: 'token', label: 'Personal Access Token', type: 'password', required: true },
        { key: 'organization', label: 'Organization', type: 'text', required: false }
      ]
    },
    {
      id: 'jira',
      name: 'Jira',
      type: 'development',
      description: 'Sync tasks with Jira issues',
      icon: '🎯',
      fields: [
        { key: 'domain', label: 'Jira Domain', type: 'url', required: true },
        { key: 'email', label: 'Email', type: 'email', required: true },
        { key: 'apiToken', label: 'API Token', type: 'password', required: true }
      ]
    }
  ];

  const handleConnect = (integrationId: string) => {
    const integration = availableIntegrations.find(i => i.id === integrationId);
    if (integration) {
      onConnect(integrationId, connectionData[integrationId] || {});
      setShowConnectModal(null);
      setConnectionData(prev => ({ ...prev, [integrationId]: {} }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Integrations</h2>
        <p className="text-gray-600 dark:text-gray-400">Connect with external services and tools</p>
      </div>

      {/* Connected Integrations */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Connected Services</h3>
        <div className="space-y-4">
          {integrations.map((integration: any) => (
            <div key={integration.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{availableIntegrations.find(i => i.id === integration.type)?.icon || '🔗'}</div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{integration.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Connected • Last sync: {integration.lastSync ? format(new Date(integration.lastSync), 'MMM d, HH:mm') : 'Never'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onTest(integration.id)}
                  disabled={isLoading[integration.id]}
                  className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors disabled:opacity-50"
                >
                  {isLoading[integration.id] ? 'Testing...' : 'Test'}
                </button>
                <button
                  onClick={() => onDisconnect(integration.id)}
                  className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                >
                  Disconnect
                </button>
                {testResults[integration.id] && (
                  <div className="flex items-center">
                    {testResults[integration.id] === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Available Integrations */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Available Integrations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableIntegrations
            .filter(integration => !integrations.some((i: any) => i.type === integration.id))
            .map((integration) => (
              <div key={integration.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="text-2xl">{integration.icon}</div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{integration.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{integration.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowConnectModal(integration.id)}
                  className="w-full px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                >
                  Connect
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* Connection Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Connect {availableIntegrations.find(i => i.id === showConnectModal)?.name}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {availableIntegrations.find(i => i.id === showConnectModal)?.fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {field.label} {field.required && '*'}
                  </label>
                  <input
                    type={field.type}
                    required={field.required}
                    value={connectionData[showConnectModal]?.[field.key] || ''}
                    onChange={(e) => setConnectionData(prev => ({
                      ...prev,
                      [showConnectModal!]: {
                        ...prev[showConnectModal!],
                        [field.key]: e.target.value
                      }
                    }))}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowConnectModal(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConnect(showConnectModal)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Data & Privacy Settings Component
const DataPrivacySettings = ({ onExport, onImport }: any) => {
  const [exportFormat, setExportFormat] = useState('json');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(exportFormat);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Data & Privacy</h2>
        <p className="text-gray-600 dark:text-gray-400">Manage your data and privacy settings</p>
      </div>

      {/* Data Export */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Export Your Data</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Download a copy of all your data including tasks, projects, and settings.
        </p>
        <div className="flex items-center space-x-4">
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className="px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
          >
            <option value="json">JSON Format</option>
            <option value="csv">CSV Format</option>
            <option value="excel">Excel Format</option>
          </select>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>{isExporting ? 'Exporting...' : 'Export Data'}</span>
          </button>
        </div>
      </div>

      {/* Data Retention */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Retention</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Auto-delete completed tasks</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Automatically delete tasks after 90 days of completion</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-600">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Privacy Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Privacy Controls</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Analytics & Usage Data</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Help improve ProjectFlow by sharing anonymous usage data</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Security Settings Component
const SecuritySettings = () => {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Security Settings</h2>
        <p className="text-gray-600 dark:text-gray-400">Configure security and access controls</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Access Control</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Session Timeout</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Automatically log out after inactivity</p>
            </div>
            <select
              value={settings.security.sessionTimeout}
              onChange={(e) => updateSettings('security', { ...settings.security, sessionTimeout: e.target.value })}
              className="px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            >
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="240">4 hours</option>
              <option value="480">8 hours</option>
              <option value="never">Never</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

// Billing Settings Component
const BillingSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Billing & Subscription</h2>
        <p className="text-gray-600 dark:text-gray-400">Manage your subscription and billing information</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Current Plan</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Professional Plan</p>
          </div>
          <span className="px-3 py-1 text-sm bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full">
            Active
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">$29</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">per month</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">15</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">team members</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">∞</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">projects</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Organization Settings Component
const OrganizationSettings = () => {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Organization Settings</h2>
        <p className="text-gray-600 dark:text-gray-400">Manage organization-wide settings and policies</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Organization Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Organization Name</label>
            <input
              type="text"
              value={settings.organization.name}
              onChange={(e) => updateSettings('organization', { ...settings.organization, name: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Domain</label>
            <input
              type="text"
              value={settings.organization.domain}
              onChange={(e) => updateSettings('organization', { ...settings.organization, domain: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Advanced Settings Component
const AdvancedSettings = ({ onReset }: any) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = () => {
    onReset();
    setShowResetConfirm(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Advanced Settings</h2>
        <p className="text-gray-600 dark:text-gray-400">Advanced configuration options</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Actions</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
            <div>
              <p className="text-sm font-medium text-red-900 dark:text-red-100">Reset All Settings</p>
              <p className="text-xs text-red-700 dark:text-red-300">This will reset all settings to default values</p>
            </div>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-600 dark:border-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              Reset Settings
            </button>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirm Reset</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to reset all settings? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Reset All Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Access Denied Component
const AccessDenied = () => (
  <div className="text-center py-12">
    <Lock className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Access Denied</h3>
    <p className="text-gray-500 dark:text-gray-400">You don't have permission to access this section.</p>
  </div>
);

export default Settings;