import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { useSettings } from '../contexts/SettingsContext';
import { useNotification } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../components/MultiLanguageSupport';
import { useTenant } from '../contexts/TenantContext';
import { User, Shield, Bell, Palette, Globe, Zap, Database, Key, Mail, Smartphone, Monitor, Lock, Eye, Download, Upload, RefreshCw, Save, AlertTriangle, CheckCircle, Settings as SettingsIcon, Users, Building, CreditCard, FileText, Calendar, Clock, Trash2, Plus, CreditCard as Edit3 } from 'lucide-react';
import { BillingManager } from '../components/BillingManager';
import { SecurityAuditLog } from '../components/SecurityAuditLog';

interface SettingsTab {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  component: React.ComponentType<any>;
  requiresRole?: string[];
}

const Settings: React.FC = () => {
  const { user, updateUser } = useUser();
  const { settings, updateSettings } = useSettings();
  const { addNotification } = useNotification();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { tenant, updateTenant } = useTenant();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  // Profile Settings Component
  const ProfileSettings: React.FC = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              value={user?.name || ''}
              onChange={(e) => updateUser({ name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              onChange={(e) => updateUser({ email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Department</label>
            <input
              type="text"
              value={user?.department || ''}
              onChange={(e) => updateUser({ department: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Role</label>
            <select
              value={user?.role || 'Member'}
              onChange={(e) => updateUser({ role: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Member">Member</option>
              <option value="Manager">Manager</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  // Notifications Settings Component
  const NotificationSettings: React.FC = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          {[
            { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
            { key: 'pushNotifications', label: 'Push Notifications', description: 'Receive browser push notifications' },
            { key: 'taskReminders', label: 'Task Reminders', description: 'Get reminded about upcoming tasks' },
            { key: 'projectUpdates', label: 'Project Updates', description: 'Notifications about project changes' }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{item.label}</h4>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications?.[item.key] || false}
                  onChange={(e) => updateSettings({
                    notifications: {
                      ...settings.notifications,
                      [item.key]: e.target.checked
                    }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Appearance Settings Component
  const AppearanceSettings: React.FC = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Theme & Appearance</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Theme</label>
            <div className="grid grid-cols-3 gap-3">
              {['light', 'dark', 'system'].map((themeOption) => (
                <button
                  key={themeOption}
                  onClick={() => setTheme(themeOption as any)}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    theme === themeOption
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="capitalize font-medium">{themeOption}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Density</label>
            <select
              value={settings.appearance?.density || 'comfortable'}
              onChange={(e) => updateSettings({
                appearance: {
                  ...settings.appearance,
                  density: e.target.value as any
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="compact">Compact</option>
              <option value="comfortable">Comfortable</option>
              <option value="spacious">Spacious</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  // Regional Settings Component
  const RegionalSettings: React.FC = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Language & Region</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Timezone</label>
            <select
              value={settings.regional?.timezone || 'UTC'}
              onChange={(e) => updateSettings({
                regional: {
                  ...settings.regional,
                  timezone: e.target.value
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  // Security Settings Component
  const SecuritySettings: React.FC = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Security & Privacy</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-600">Add an extra layer of security</p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Enable 2FA
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Session Timeout</h4>
              <p className="text-sm text-gray-600">Automatically log out after inactivity</p>
            </div>
            <select
              value={settings.security?.sessionTimeout || '30'}
              onChange={(e) => updateSettings({
                security: {
                  ...settings.security,
                  sessionTimeout: e.target.value
                }
              })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="240">4 hours</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  // Organization Settings Component
  const OrganizationSettings: React.FC = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Organization Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Organization Name</label>
            <input
              type="text"
              value={tenant?.name || ''}
              onChange={(e) => updateTenant({ name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Domain</label>
            <input
              type="text"
              value={tenant?.domain || ''}
              onChange={(e) => updateTenant({ domain: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Integrations Settings Component
  const IntegrationsSettings: React.FC = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Third-Party Integrations</h3>
        <div className="space-y-4">
          {[
            { name: 'Slack', icon: '💬', connected: false },
            { name: 'Google Drive', icon: '📁', connected: true },
            { name: 'GitHub', icon: '🐙', connected: false },
            { name: 'Jira', icon: '🎯', connected: true }
          ].map((integration) => (
            <div key={integration.name} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{integration.icon}</span>
                <div>
                  <h4 className="font-medium">{integration.name}</h4>
                  <p className="text-sm text-gray-600">
                    {integration.connected ? 'Connected' : 'Not connected'}
                  </p>
                </div>
              </div>
              <button
                className={`px-4 py-2 rounded-md ${
                  integration.connected
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {integration.connected ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Advanced Settings Component
  const AdvancedSettings: React.FC = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Advanced Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Developer Mode</h4>
              <p className="text-sm text-gray-600">Enable advanced developer features</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.advanced?.developerMode || false}
                onChange={(e) => updateSettings({
                  advanced: {
                    ...settings.advanced,
                    developerMode: e.target.checked
                  }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              <Download className="w-4 h-4" />
              <span>Export Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs: SettingsTab[] = [
    { id: 'profile', label: 'Profile', icon: User, component: ProfileSettings },
    { id: 'notifications', label: 'Notifications', icon: Bell, component: NotificationSettings },
    { id: 'appearance', label: 'Appearance', icon: Palette, component: AppearanceSettings },
    { id: 'regional', label: 'Regional', icon: Globe, component: RegionalSettings },
    { id: 'security', label: 'Security', icon: Shield, component: SecuritySettings },
    { id: 'organization', label: 'Organization', icon: Building, component: OrganizationSettings, requiresRole: ['Admin', 'Manager'] },
    { id: 'integrations', label: 'Integrations', icon: Zap, component: IntegrationsSettings },
    { id: 'billing', label: 'Billing', icon: CreditCard, component: BillingManager, requiresRole: ['Admin'] },
    { id: 'advanced', label: 'Advanced', icon: SettingsIcon, component: AdvancedSettings }
  ];

  const filteredTabs = tabs.filter(tab => 
    !tab.requiresRole || tab.requiresRole.includes(user?.role || 'Member')
  );

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || ProfileSettings;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {filteredTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <ActiveComponent />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;