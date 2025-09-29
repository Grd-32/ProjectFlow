import React, { useState } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useUser } from '../contexts/UserContext';
import { useNotification } from '../contexts/NotificationContext';
import { useTenant } from '../contexts/TenantContext';
import { 
  Plus, 
  Settings, 
  Users, 
  BarChart3, 
  Archive, 
  Copy, 
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  UserPlus,
  Crown,
  Shield,
  User,
  X,
  Search,
  Filter,
  Calendar,
  Clock,
  Target,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';

interface WorkspaceManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const WorkspaceManager: React.FC<WorkspaceManagerProps> = ({ isOpen, onClose }) => {
  const { 
    workspaces, 
    workspaceTemplates, 
    currentWorkspace, 
    addWorkspace, 
    updateWorkspace, 
    deleteWorkspace,
    setCurrentWorkspace,
    createWorkspaceFromTemplate,
    inviteToWorkspace,
    removeFromWorkspace,
    getWorkspaceAnalytics,
    archiveWorkspace,
    duplicateWorkspace
  } = useWorkspace();
  const { users, currentUser, hasPermission } = useUser();
  const { addNotification } = useNotification();
  const { currentTenant } = useTenant();
  
  const [activeTab, setActiveTab] = useState<'workspaces' | 'templates' | 'analytics'>('workspaces');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [analytics, setAnalytics] = useState<any>(null);
  
  const [newWorkspace, setNewWorkspace] = useState({
    name: '',
    description: '',
    color: 'blue',
    icon: '📁',
    isPublic: false,
    allowGuests: false,
    defaultTaskView: 'kanban' as const
  });

  const filteredWorkspaces = workspaces.filter(workspace =>
    workspace.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workspace.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateWorkspace = async () => {
    try {
      const workspaceData = {
        ...newWorkspace,
        projects: [],
        members: [currentUser.id],
        settings: {
          isPublic: newWorkspace.isPublic,
          allowGuests: newWorkspace.allowGuests,
          defaultTaskView: newWorkspace.defaultTaskView,
          autoArchive: true,
          notifications: true,
          integrations: []
        },
        permissions: {
          [currentUser.id]: {
            role: 'owner' as const,
            permissions: ['all']
          }
        }
      };

      await addWorkspace(workspaceData);
      setNewWorkspace({
        name: '',
        description: '',
        color: 'blue',
        icon: '📁',
        isPublic: false,
        allowGuests: false,
        defaultTaskView: 'kanban'
      });
      setShowCreateModal(false);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Workspace Creation Failed',
        message: 'Failed to create workspace. Please try again.',
        userId: currentUser.id,
        relatedEntity: {
          type: 'project',
          id: 'workspace',
          name: 'Workspace Creation'
        }
      });
    }
  };

  const handleCreateFromTemplate = async () => {
    if (!selectedTemplate) return;
    
    try {
      const template = workspaceTemplates.find(t => t.id === selectedTemplate);
      if (template) {
        await createWorkspaceFromTemplate(selectedTemplate, `${template.name} Workspace`);
        setSelectedTemplate('');
        setShowTemplateModal(false);
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Template Creation Failed',
        message: 'Failed to create workspace from template.',
        userId: currentUser.id,
        relatedEntity: {
          type: 'project',
          id: 'workspace',
          name: 'Template Creation'
        }
      });
    }
  };

  const handleDuplicateWorkspace = async (workspaceId: string) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (workspace) {
      try {
        await duplicateWorkspace(workspaceId, `${workspace.name} (Copy)`);
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'Duplication Failed',
          message: 'Failed to duplicate workspace.',
          userId: currentUser.id,
          relatedEntity: {
            type: 'project',
            id: workspaceId,
            name: workspace.name
          }
        });
      }
    }
  };

  const loadAnalytics = async (workspaceId: string) => {
    try {
      const data = await getWorkspaceAnalytics(workspaceId);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'admin': return <Shield className="h-4 w-4 text-blue-500" />;
      case 'member': return <User className="h-4 w-4 text-green-500" />;
      default: return <Eye className="h-4 w-4 text-gray-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Workspace Manager</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowTemplateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            >
              <Target className="h-4 w-4" />
              <span>From Template</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>New Workspace</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'workspaces', label: 'Workspaces', icon: Users },
              { id: 'templates', label: 'Templates', icon: Target },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'workspaces' && (
            <div className="space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search workspaces..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                />
              </div>

              {/* Workspaces Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredWorkspaces.map((workspace) => (
                  <div
                    key={workspace.id}
                    className={`bg-white dark:bg-gray-800 rounded-lg border-2 p-6 hover:shadow-lg transition-all cursor-pointer ${
                      currentWorkspace?.id === workspace.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                    onClick={() => setCurrentWorkspace(workspace)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 bg-${workspace.color}-100 dark:bg-${workspace.color}-900/30 rounded-lg flex items-center justify-center text-2xl`}>
                          {workspace.icon}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{workspace.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{workspace.members.length} members</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {workspace.settings.isPublic && (
                          <Eye className="h-4 w-4 text-green-500" title="Public workspace" />
                        )}
                        {workspace.permissions[currentUser.id]?.role === 'owner' && (
                          <Crown className="h-4 w-4 text-yellow-500" title="You own this workspace" />
                        )}
                      </div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {workspace.description}
                    </p>

                    {/* Analytics */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{workspace.analytics.activeProjects}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Active Projects</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{workspace.analytics.completedTasks}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Completed Tasks</p>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Productivity</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{workspace.analytics.teamProductivity}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${workspace.analytics.teamProductivity}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            loadAnalytics(workspace.id);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600 rounded"
                          title="View analytics"
                        >
                          <BarChart3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Open workspace settings
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded"
                          title="Workspace settings"
                        >
                          <Settings className="h-4 w-4" />
                        </button>
                        {workspace.permissions[currentUser.id]?.role === 'owner' && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicateWorkspace(workspace.id);
                              }}
                              className="p-1 text-gray-400 hover:text-green-600 rounded"
                              title="Duplicate workspace"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`Delete workspace "${workspace.name}"?`)) {
                                  deleteWorkspace(workspace.id);
                                }
                              }}
                              className="p-1 text-gray-400 hover:text-red-600 rounded"
                              title="Delete workspace"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {format(new Date(workspace.updatedAt), 'MMM d')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workspaceTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`w-10 h-10 bg-${template.color}-100 dark:bg-${template.color}-900/30 rounded-lg flex items-center justify-center text-lg`}>
                        {template.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{template.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{template.category}</p>
                      </div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{template.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Default Projects</span>
                        <span className="text-gray-900 dark:text-white">{template.defaultProjects.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Default View</span>
                        <span className="text-gray-900 dark:text-white capitalize">{template.defaultSettings.defaultTaskView}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedTemplate(template.id);
                        handleCreateFromTemplate();
                      }}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Use Template</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Workspace Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Workspaces</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{workspaces.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Workspaces</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {workspaces.filter(w => w.analytics.activeProjects > 0).length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Productivity</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {Math.round(workspaces.reduce((sum, w) => sum + w.analytics.teamProductivity, 0) / workspaces.length)}%
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {workspaces.reduce((sum, w) => sum + w.analytics.totalTasks, 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Workspace Performance */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Workspace Performance</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {workspaces.map((workspace) => (
                      <div key={workspace.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 bg-${workspace.color}-100 dark:bg-${workspace.color}-900/30 rounded-lg flex items-center justify-center`}>
                            {workspace.icon}
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">{workspace.name}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {workspace.analytics.activeProjects} projects • {workspace.members.length} members
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {workspace.analytics.teamProductivity}%
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Productivity</p>
                          </div>
                          <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div 
                              className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${workspace.analytics.teamProductivity}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Create Workspace Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Workspace</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Workspace Name
                    </label>
                    <input
                      type="text"
                      value={newWorkspace.name}
                      onChange={(e) => setNewWorkspace(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                      placeholder="Enter workspace name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Icon
                    </label>
                    <select
                      value={newWorkspace.icon}
                      onChange={(e) => setNewWorkspace(prev => ({ ...prev, icon: e.target.value }))}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                    >
                      <option value="📁">📁 Folder</option>
                      <option value="🚀">🚀 Rocket</option>
                      <option value="💼">💼 Briefcase</option>
                      <option value="🎯">🎯 Target</option>
                      <option value="⚡">⚡ Lightning</option>
                      <option value="🔧">🔧 Tools</option>
                      <option value="📊">📊 Chart</option>
                      <option value="🌟">🌟 Star</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newWorkspace.description}
                    onChange={(e) => setNewWorkspace(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                    placeholder="Describe the workspace purpose"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Color Theme
                    </label>
                    <select
                      value={newWorkspace.color}
                      onChange={(e) => setNewWorkspace(prev => ({ ...prev, color: e.target.value }))}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                    >
                      <option value="blue">Blue</option>
                      <option value="green">Green</option>
                      <option value="purple">Purple</option>
                      <option value="red">Red</option>
                      <option value="yellow">Yellow</option>
                      <option value="indigo">Indigo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Default Task View
                    </label>
                    <select
                      value={newWorkspace.defaultTaskView}
                      onChange={(e) => setNewWorkspace(prev => ({ ...prev, defaultTaskView: e.target.value as any }))}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                    >
                      <option value="list">List</option>
                      <option value="kanban">Kanban</option>
                      <option value="gantt">Gantt</option>
                      <option value="calendar">Calendar</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Public Workspace</span>
                    <button
                      onClick={() => setNewWorkspace(prev => ({ ...prev, isPublic: !prev.isPublic }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        newWorkspace.isPublic ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        newWorkspace.isPublic ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Allow Guests</span>
                    <button
                      onClick={() => setNewWorkspace(prev => ({ ...prev, allowGuests: !prev.allowGuests }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        newWorkspace.allowGuests ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        newWorkspace.allowGuests ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateWorkspace}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Workspace
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspaceManager;