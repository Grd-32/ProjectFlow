  Users, 
  Building, 
  CreditCard, 
  FileText, 
  Calendar, 
  Clock, 
  Trash2, 
  Plus, 
  Edit3,
  X,
  Check,
  Copy,
  ExternalLink,
  Loader,
  ToggleLeft,
  ToggleRight,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Crown,
  Star,
  Activity,
  BarChart3,
  TrendingUp,
  DollarSign,
  Target,
  MessageSquare,
  Image,
  Video,
  Archive,
  Share2,
  Link2,
  QrCode,
  Wifi,
  WifiOff,
  Server,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  Router,
  Fingerprint,
  Tablet,
  Chrome,
  Firefox,
  Safari,
  Edge,
  Phone,
  MapPin
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useUser } from '../contexts/UserContext';
import { useNotification } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';
impimport { User, Shield, Bell, Palette, Globe, Zap, Database, Key, Mail, Smartphone, Monitor, Lock, Eye, Download, Upload, RefreshCw, Save, AlertTriangle, CheckCircle, Settings as SettingsIcon, Users, Building, CreditCard, FileText, Calendar, Clock, Trash2, Plus, CreditCard as Edit3 } from 'lucide-react'rtphone,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  X,
  Plus,
  Trash2,
  Edit3,
  Link,
  Wifi,
  WifiOff,
  Monitor,
  Sun,
  Moon,
  Laptop,
  Volume2,
  VolumeX,
  Camera,
  Mic,
  MicOff
} from 'lucide-react';
import { format } from 'date-fns';

const Settings = () => {
  const { settings, updateSettings, resetSettings, exportData, importData } = useSettings();
  const { currentUser, hasPermission } = useUser();
  const { addNotification } = useNotification();
  const { theme, setTheme, isDark } = useTheme();
  const [activeSection, setActiveSection] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [integrationStatus, setIntegrationStatus] = useState<Record<string, 'testing' | 'success' | 'error'>>({});

  const settingsSections = [
    { id: 'profile', label: 'Profile', icon: User, permission: 'read' },
    { id: 'account', label: 'Account', icon: SettingsIcon, permission: 'read' },
    { id: 'notifications', label: 'Notifications', icon: Bell, permission: 'read' },
    { id: 'appearance', label: 'Appearance', icon: Palette, permission: 'read' },
    { id: 'language', label: 'Language & Region', icon: Globe, permission: 'read' },
    { id: 'integrations', label: 'Integrations', icon: Zap, permission: 'create' },
    { id: 'data', label: 'Data & Privacy', icon: Database, permission: 'read' },
    { id: 'security', label: 'Security', icon: Shield, permission: 'read' },
    { id: 'billing', label: 'Billing', icon: CreditCard, permission: 'view_analytics' },
    { id: 'organization', label: 'Organization', icon: Building, permission: 'manage_settings' },
    { id: 'audit', label: 'Audit Log', icon: FileText, permission: 'manage_settings' },
    { id: 'advanced', label: 'Advanced', icon: SettingsIcon, permission: 'manage_settings' }
  ];

  const availableSections = settingsSections.filter(section => 
    hasPermission(section.permission as any)
  );

  const handleSave = async (section: string, data: any) => {
    setIsSaving(true);
    try {
      updateSettings(section as any, data);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      addNotification({
        type: 'success',
        title: 'Settings Saved',
        message: `${section.charAt(0).toUpperCase() + section.slice(1)} settings updated successfully`,
        userId: currentUser.id,
        relatedEntity: {
          type: 'project',
          id: 'settings',
          name: 'Settings Update'
        }
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Save Failed',
        message: 'Failed to save settings. Please try again.',
        userId: currentUser.id,
        relatedEntity: {
          type: 'project',
          id: 'settings',
          name: 'Settings Error'
        }
      });
    } finally {
      setIsSaving(false);
    }
  };

  const testIntegration = async (type: string, config: any) => {
    setIntegrationStatus(prev => ({ ...prev, [type]: 'testing' }));
    
    try {
      let success = false;
      
      switch (type) {
        case 'slack':
          if (config.webhookUrl) {
            const response = await fetch(config.webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: 'ProjectFlow integration test - connection successful! 🎉',
                channel: config.channel || '#general'
              })
            });
            success = response.ok;
          }
          break;
          
        case 'googleDrive':
          if (config.apiKey) {
            const response = await fetch(`https://www.googleapis.com/drive/v3/about?key=${config.apiKey}`);
            success = response.ok;
          }
          break;
          
        case 'github':
          if (config.token) {
            const response = await fetch('https://api.github.com/user', {
              headers: { 'Authorization': `token ${config.token}` }
            });
            success = response.ok;
          }
          break;
          
        case 'jira':
          if (config.domain && config.email && config.apiToken) {
            const auth = btoa(`${config.email}:${config.apiToken}`);
            const response = await fetch(`https://${config.domain}.atlassian.net/rest/api/3/myself`, {
              headers: { 'Authorization': `Basic ${auth}` }
            });
            success = response.ok;
          }
          break;
      }
      
      setIntegrationStatus(prev => ({ ...prev, [type]: success ? 'success' : 'error' }));
      
      addNotification({
        type: success ? 'success' : 'error',
        title: `Integration Test ${success ? 'Successful' : 'Failed'}`,
        message: `${type} connection test ${success ? 'passed' : 'failed'}`,
        userId: currentUser.id,
        relatedEntity: {
          type: 'project',
          id: 'integration',
          name: type
        }
      });
      
    } catch (error) {
      setIntegrationStatus(prev => ({ ...prev, [type]: 'error' }));
      addNotification({
        type: 'error',
        title: 'Integration Test Failed',
        message: `Failed to test ${type} connection`,
        userId: currentUser.id,
        relatedEntity: {
          type: 'project',
          id: 'integration',
          name: type
        }
      });
    }
  };

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={settings.profile.name || currentUser.name}
              onChange={(e) => handleSave('profile', { ...settings.profile, name: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={settings.profile.email || currentUser.email}
              onChange={(e) => handleSave('profile', { ...settings.profile, email: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={settings.profile.phone}
              onChange={(e) => handleSave('profile', { ...settings.profile, phone: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              placeholder="Enter phone number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Location
            </label>
            <input
              type="text"
              value={settings.profile.location}
              onChange={(e) => handleSave('profile', { ...settings.profile, location: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              placeholder="Enter location"
            />
          </div>
        </div>
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Bio
          </label>
          <textarea
            value={settings.profile.bio}
            onChange={(e) => handleSave('profile', { ...settings.profile, bio: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            placeholder="Tell us about yourself..."
          />
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">In-App Notifications</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications within the application</p>
            </div>
            <button
              onClick={() => handleSave('notifications', { 
                ...settings.notifications, 
                inApp: !settings.notifications.inApp 
              })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.notifications.inApp ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.notifications.inApp ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via email</p>
            </div>
            <button
              onClick={() => handleSave('notifications', { 
                ...settings.notifications, 
                email: !settings.notifications.email 
              })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.notifications.email ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.notifications.email ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Push Notifications</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Receive browser push notifications</p>
            </div>
            <button
              onClick={() => handleSave('notifications', { 
                ...settings.notifications, 
                push: !settings.notifications.push 
              })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.notifications.push ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.notifications.push ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Notification Types</h4>
        <div className="space-y-3">
          {Object.entries(settings.notifications.types).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </span>
              <button
                onClick={() => handleSave('notifications', {
                  ...settings.notifications,
                  types: { ...settings.notifications.types, [key]: !value }
                })}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  value ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  value ? 'translate-x-5' : 'translate-x-1'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Quiet Hours</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 dark:text-gray-300">Enable Quiet Hours</span>
            <button
              onClick={() => handleSave('notifications', {
                ...settings.notifications,
                quietHours: { ...settings.notifications.quietHours, enabled: !settings.notifications.quietHours.enabled }
              })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.notifications.quietHours.enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.notifications.quietHours.enabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          
          {settings.notifications.quietHours.enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Time</label>
                <input
                  type="time"
                  value={settings.notifications.quietHours.start}
                  onChange={(e) => handleSave('notifications', {
                    ...settings.notifications,
                    quietHours: { ...settings.notifications.quietHours, start: e.target.value }
                  })}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Time</label>
                <input
                  type="time"
                  value={settings.notifications.quietHours.end}
                  onChange={(e) => handleSave('notifications', {
                    ...settings.notifications,
                    quietHours: { ...settings.notifications.quietHours, end: e.target.value }
                  })}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Theme</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: 'light', label: 'Light', icon: Sun },
            { value: 'dark', label: 'Dark', icon: Moon },
            { value: 'system', label: 'System', icon: Monitor }
          ].map((themeOption) => (
            <button
              key={themeOption.value}
              onClick={() => {
                setTheme(themeOption.value as any);
                handleSave('appearance', { ...settings.appearance, theme: themeOption.value });
              }}
              className={`p-4 border-2 rounded-lg transition-colors ${
                theme === themeOption.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <themeOption.icon className="h-6 w-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">{themeOption.label}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Display Settings</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Density
            </label>
            <select
              value={settings.appearance.density}
              onChange={(e) => handleSave('appearance', { 
                ...settings.appearance, 
                density: e.target.value as any 
              })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            >
              <option value="comfortable">Comfortable</option>
              <option value="compact">Compact</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Font Size
            </label>
            <select
              value={settings.appearance.fontSize}
              onChange={(e) => handleSave('appearance', { 
                ...settings.appearance, 
                fontSize: e.target.value as any 
              })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Animations</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Enable smooth transitions and animations</p>
            </div>
            <button
              onClick={() => handleSave('appearance', { 
                ...settings.appearance, 
                animations: !settings.appearance.animations 
              })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.appearance.animations ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.appearance.animations ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIntegrationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">External Integrations</h3>
        
        {/* Slack Integration */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 dark:text-purple-400 font-bold text-sm">#</span>
              </div>
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white">Slack</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Team communication and notifications</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {integrationStatus.slack === 'testing' && (
                <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
              )}
              {integrationStatus.slack === 'success' && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              {integrationStatus.slack === 'error' && (
                <X className="h-4 w-4 text-red-500" />
              )}
              <button
                onClick={() => testIntegration('slack', settings.integrations.slack)}
                disabled={integrationStatus.slack === 'testing'}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                Test
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Webhook URL
              </label>
              <input
                type="url"
                value={settings.integrations.slack.webhookUrl}
                onChange={(e) => handleSave('integrations', {
                  ...settings.integrations,
                  slack: { ...settings.integrations.slack, webhookUrl: e.target.value }
                })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                placeholder="https://hooks.slack.com/services/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Default Channel
              </label>
              <input
                type="text"
                value={settings.integrations.slack.channel}
                onChange={(e) => handleSave('integrations', {
                  ...settings.integrations,
                  slack: { ...settings.integrations.slack, channel: e.target.value }
                })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                placeholder="#general"
              />
            </div>
          </div>
        </div>

        {/* Google Drive Integration */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white">Google Drive</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">File storage and document sync</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {integrationStatus.googleDrive === 'testing' && (
                <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
              )}
              {integrationStatus.googleDrive === 'success' && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              {integrationStatus.googleDrive === 'error' && (
                <X className="h-4 w-4 text-red-500" />
              )}
              <button
                onClick={() => testIntegration('googleDrive', settings.integrations.googleDrive)}
                disabled={integrationStatus.googleDrive === 'testing'}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                Test
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                API Key
              </label>
              <input
                type="password"
                value={settings.integrations.googleDrive.apiKey}
                onChange={(e) => handleSave('integrations', {
                  ...settings.integrations,
                  googleDrive: { ...settings.integrations.googleDrive, apiKey: e.target.value }
                })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                placeholder="Enter Google Drive API key"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Folder ID
              </label>
              <input
                type="text"
                value={settings.integrations.googleDrive.folderId}
                onChange={(e) => handleSave('integrations', {
                  ...settings.integrations,
                  googleDrive: { ...settings.integrations.googleDrive, folderId: e.target.value }
                })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                placeholder="Google Drive folder ID"
              />
            </div>
          </div>
        </div>

        {/* GitHub Integration */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-gray-600 dark:text-gray-400 font-bold text-sm">GH</span>
              </div>
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white">GitHub</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Code repository and issue tracking</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {integrationStatus.github === 'testing' && (
                <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
              )}
              {integrationStatus.github === 'success' && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              {integrationStatus.github === 'error' && (
                <X className="h-4 w-4 text-red-500" />
              )}
              <button
                onClick={() => testIntegration('github', settings.integrations.github)}
                disabled={integrationStatus.github === 'testing'}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                Test
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Personal Access Token
              </label>
              <input
                type="password"
                value={settings.integrations.github.token}
                onChange={(e) => handleSave('integrations', {
                  ...settings.integrations,
                  github: { ...settings.integrations.github, token: e.target.value }
                })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Organization
              </label>
              <input
                type="text"
                value={settings.integrations.github.organization}
                onChange={(e) => handleSave('integrations', {
                  ...settings.integrations,
                  github: { ...settings.integrations.github, organization: e.target.value }
                })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                placeholder="your-organization"
              />
            </div>
          </div>
        </div>

        {/* Jira Integration */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">J</span>
              </div>
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white">Jira</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Issue tracking and project management</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {integrationStatus.jira === 'testing' && (
                <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
              )}
              {integrationStatus.jira === 'success' && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              {integrationStatus.jira === 'error' && (
                <X className="h-4 w-4 text-red-500" />
              )}
              <button
                onClick={() => testIntegration('jira', settings.integrations.jira)}
                disabled={integrationStatus.jira === 'testing'}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                Test
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Domain
              </label>
              <input
                type="text"
                value={settings.integrations.jira.domain}
                onChange={(e) => handleSave('integrations', {
                  ...settings.integrations,
                  jira: { ...settings.integrations.jira, domain: e.target.value }
                })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                placeholder="your-domain"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={settings.integrations.jira.email}
                  onChange={(e) => handleSave('integrations', {
                    ...settings.integrations,
                    jira: { ...settings.integrations.jira, email: e.target.value }
                  })}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  placeholder="your-email@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  API Token
                </label>
                <input
                  type="password"
                  value={settings.integrations.jira.apiToken}
                  onChange={(e) => handleSave('integrations', {
                    ...settings.integrations,
                    jira: { ...settings.integrations.jira, apiToken: e.target.value }
                  })}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  placeholder="Your Jira API token"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Security Settings</h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security to your account</p>
            </div>
            <button
              onClick={() => handleSave('security', { 
                ...settings.security, 
                twoFactorEnabled: !settings.security.twoFactorEnabled 
              })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.security.twoFactorEnabled ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.security.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Session Timeout (minutes)
            </label>
            <select
              value={settings.security.sessionTimeout}
              onChange={(e) => handleSave('security', { 
                ...settings.security, 
                sessionTimeout: e.target.value 
              })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
              <option value="480">8 hours</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Login Notifications</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Get notified of new login attempts</p>
            </div>
            <button
              onClick={() => handleSave('security', { 
                ...settings.security, 
                loginNotifications: !settings.security.loginNotifications 
              })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.security.loginNotifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.security.loginNotifications ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDataSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Management</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Export Data</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Download your data in various formats
            </p>
            <div className="space-y-2">
              <button
                onClick={() => exportData('json')}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export as JSON</span>
              </button>
              <button
                onClick={() => exportData('csv')}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export as CSV</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Import Data</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Import data from backup files
            </p>
            <label className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
              <Upload className="h-4 w-4" />
              <span>Import Data</span>
              <input
                type="file"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) importData(file);
                }}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrganizationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Organization Settings</h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Organization Name
              </label>
              <input
                type="text"
                value={settings.organization.name}
                onChange={(e) => handleSave('organization', { 
                  ...settings.organization, 
                  name: e.target.value 
                })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Domain
              </label>
              <input
                type="text"
                value={settings.organization.domain}
                onChange={(e) => handleSave('organization', { 
                  ...settings.organization, 
                  domain: e.target.value 
                })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                placeholder="company.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Default Role for New Users
            </label>
            <select
              value={settings.organization.defaultRole}
              onChange={(e) => handleSave('organization', { 
                ...settings.organization, 
                defaultRole: e.target.value 
              })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            >
              <option value="Viewer">Viewer</option>
              <option value="Member">Member</option>
              <option value="Manager">Manager</option>
            </select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Allow Guest Access</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Allow external users to view public projects</p>
              </div>
              <button
                onClick={() => handleSave('organization', { 
                  ...settings.organization, 
                  allowGuestAccess: !settings.organization.allowGuestAccess 
                })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.organization.allowGuestAccess ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.organization.allowGuestAccess ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Require Admin Approval</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">New users need admin approval to join</p>
              </div>
              <button
                onClick={() => handleSave('organization', { 
                  ...settings.organization, 
                  requireApproval: !settings.organization.requireApproval 
                })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.organization.requireApproval ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.organization.requireApproval ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdvancedSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Advanced Settings</h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Debug Mode</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Enable detailed logging for troubleshooting</p>
            </div>
            <button
              onClick={() => handleSave('advanced', { 
                ...settings.advanced, 
                debugMode: !settings.advanced.debugMode 
              })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.advanced.debugMode ? 'bg-yellow-600' : 'bg-gray-200 dark:bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.advanced.debugMode ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Performance Monitoring</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Monitor application performance metrics</p>
            </div>
            <button
              onClick={() => handleSave('advanced', { 
                ...settings.advanced, 
                performanceMonitoring: !settings.advanced.performanceMonitoring 
              })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.advanced.performanceMonitoring ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.advanced.performanceMonitoring ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Auto Backup</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Automatically backup your data</p>
            </div>
            <button
              onClick={() => handleSave('advanced', { 
                ...settings.advanced, 
                autoBackup: !settings.advanced.autoBackup 
              })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.advanced.autoBackup ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.advanced.autoBackup ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {settings.advanced.autoBackup && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Backup Frequency
              </label>
              <select
                value={settings.advanced.backupFrequency}
                onChange={(e) => handleSave('advanced', { 
                  ...settings.advanced, 
                  backupFrequency: e.target.value 
                })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h4 className="text-md font-medium text-red-900 dark:text-red-100 mb-4 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          Danger Zone
        </h4>
        <div className="space-y-4">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full px-4 py-2 text-sm font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
          >
            Reset All Settings
          </button>
        </div>
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Confirm Reset</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              This will reset all settings to their default values. This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
import { 
                onClick={() => {
  User, 
              >
  Shield, 
                <section.icon className="h-4 w-4" />
  Bell, 
                <span>{section.label}</span>
  Palette, 
              </button>
  Globe, 
            ))}
  Zap, 
          </nav>
  Database, 
        </div>
  Key, 
      </div>
  Mail, 

  Smartphone, 
      {/* Settings Content */}
  Monitor, 
      <div className="flex-1 overflow-y-auto">
  Lock, 
        <div className="p-6 max-w-4xl">
  Eye, 
          {renderContent()}
  Download, 
        </div>
  Upload, 
      </div>
  RefreshCw, 
    </div>
  Save, 
  );
  AlertTriangle, 
};
  CheckCircle, 

  Settings as SettingsIcon, 
export default Settings;