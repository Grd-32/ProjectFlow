import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useTask } from '../contexts/TaskContext';
import { useProject } from '../contexts/ProjectContext';
import { 
  LayoutDashboard, 
  CheckSquare, 
  FolderOpen, 
  Target, 
  FileText, 
  Calendar, 
  Zap, 
  Users, 
  BarChart3, 
  Settings,
  ChevronDown,
  ChevronRight,
  Plus,
  Building,
  Briefcase
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const { hasPermission } = useUser();
  const { workspaces, currentWorkspace, setCurrentWorkspace } = useWorkspace();
  const { tasks } = useTask();
  const { projects } = useProject();
  const [showWorkspaces, setShowWorkspaces] = useState(true);

  const navigationItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/', permission: 'read' },
    { icon: CheckSquare, label: 'Tasks', path: '/tasks', permission: 'read' },
    { icon: FolderOpen, label: 'Projects', path: '/projects', permission: 'read' },
    { icon: Target, label: 'Goals', path: '/goals', permission: 'read' },
    { icon: FileText, label: 'Documents', path: '/docs', permission: 'read' },
    { icon: Calendar, label: 'Calendar', path: '/calendar', permission: 'read' },
    { icon: Zap, label: 'Automations', path: '/automations', permission: 'create' },
    { icon: Users, label: 'Users', path: '/users', permission: 'manage_users' },
    { icon: Briefcase, label: 'Project Management', path: '/project-management', permission: 'read' },
    { icon: BarChart3, label: 'Reports', path: '/reports', permission: 'view_analytics' },
    { icon: Settings, label: 'Settings', path: '/settings', permission: 'read' }
  ];

  const filteredNavigation = navigationItems.filter(item => 
    hasPermission(item.permission as any)
  );

  const getTaskCount = (workspaceId: string) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (!workspace) return 0;
    return tasks.filter(task => workspace.projects.includes(task.projectId)).length;
  };

  const getProjectCount = (workspaceId: string) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    return workspace ? workspace.projects.length : 0;
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-800">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">PF</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">ProjectFlow</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Project Management</p>
          </div>
        </div>
      </div>

      {/* Workspaces */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setShowWorkspaces(!showWorkspaces)}
          className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <span>Workspaces</span>
          {showWorkspaces ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        
        {showWorkspaces && (
          <div className="mt-3 space-y-2">
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                onClick={() => setCurrentWorkspace(workspace)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  currentWorkspace?.id === workspace.id
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{workspace.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{workspace.name}</p>
                    <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                      <span>{getProjectCount(workspace.id)} projects</span>
                      <span>{getTaskCount(workspace.id)} tasks</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
            <Link
              to="/settings?tab=workspaces"
              className="flex items-center space-x-2 w-full p-2 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            >
              <Plus className="h-3 w-3" />
              <span>Manage Workspaces</span>
            </Link>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {filteredNavigation.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
              location.pathname === item.path
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Current Workspace Info */}
      {currentWorkspace && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Building className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Current Workspace</span>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {currentWorkspace.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {getProjectCount(currentWorkspace.id)} projects • {getTaskCount(currentWorkspace.id)} tasks
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;