import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useTask } from '../contexts/TaskContext';
import { useProject } from '../contexts/ProjectContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
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
  ChevronRight,
  Plus,
  Briefcase
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const { hasPermission } = useUser();
  const { tasks } = useTask();
  const { projects } = useProject();
  const { workspaces, currentWorkspace, setCurrentWorkspace } = useWorkspace();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const baseNavigationItems = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      path: '/',
      count: null
    },
    { 
      icon: CheckSquare, 
      label: 'Tasks', 
      path: '/tasks',
      count: tasks.filter(t => t.status !== 'Complete').length
    },
    { 
      icon: FolderOpen, 
      label: 'Projects', 
      path: '/projects',
      count: projects.filter(p => p.status === 'Active').length
    },
    { 
      icon: Briefcase, 
      label: 'Project Mgmt', 
      path: '/project-management',
      count: null
    },
    { 
      icon: Target, 
      label: 'Goals', 
      path: '/goals',
      count: null
    },
    { 
      icon: FileText, 
      label: 'Docs', 
      path: '/docs',
      count: null
    },
    { 
      icon: Calendar, 
      label: 'Calendar', 
      path: '/calendar',
      count: null
    },
    { 
      icon: Zap, 
      label: 'Automations', 
      path: '/automations',
      count: null
    },
  ];

  const navigationItems = [
    ...baseNavigationItems,
    ...(hasPermission('manage_users') ? [{ 
      icon: Users, 
      label: 'Users', 
      path: '/users',
      count: null
    }] : []),
    ...(hasPermission('view_analytics') ? [{ 
      icon: BarChart3, 
      label: 'Reports', 
      path: '/reports',
      count: null
    }] : []),
    { 
      icon: Settings, 
      label: 'Settings', 
      path: '/settings',
      count: null
    },
  ];

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className={`${isMobile ? 'p-4' : 'p-6'} border-b border-gray-200 dark:border-gray-700`}>
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 text-gray-700 dark:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 14 14">
              <path fill="currentColor" fillRule="evenodd" d="M11.673.834a.75.75 0 0 0-1.085.796l.168.946q-.676.14-1.369.173c-.747-.004-1.315-.287-2.041-.665l-.04-.02c-.703-.366-1.564-.814-2.71-.814h-.034A10.4 10.4 0 0 0 .416 2.328a.75.75 0 1 0 .668 1.343a8.9 8.9 0 0 1 3.529-.921c.747.004 1.315.287 2.041.665l.04.02c.703.366 1.564.815 2.71.815l.034-.001a10.3 10.3 0 0 0 4.146-1.078a.75.75 0 0 0 .338-1.005a.75.75 0 0 0-.334-.336zM4.562 5.751l.034-.001c1.146 0 2.007.448 2.71.814l.04.02c.726.378 1.294.662 2.041.666q.707-.034 1.398-.18l-.192-.916a.75.75 0 0 1 1.08-.82l1.915.996a.747.747 0 0 1 .36.943a.75.75 0 0 1-.364.399a10.5 10.5 0 0 1-1.705.668a10.3 10.3 0 0 1-2.475.41c-1.146 0-2.007-.448-2.71-.814l-.04-.02c-.726-.378-1.294-.662-2.041-.666a8.9 8.9 0 0 0-3.53.922a.75.75 0 1 1-.667-1.344a10.4 10.4 0 0 1 4.146-1.077m0 4.5h.034c1.146 0 2.007.448 2.71.814l.04.02c.726.378 1.294.661 2.041.665a9 9 0 0 0 1.402-.18l-.195-.912a.75.75 0 0 1 1.079-.823l1.915.996a.747.747 0 0 1 .36.942a.75.75 0 0 1-.364.4a10.4 10.4 0 0 1-4.18 1.078c-1.146 0-2.007-.449-2.71-.815l-.04-.02c-.726-.378-1.294-.661-2.041-.665a8.9 8.9 0 0 0-3.53.921a.75.75 0 1 1-.667-1.343a10.4 10.4 0 0 1 4.146-1.078" clipRule="evenodd"/>
            </svg>
          </div>
          <h1 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-900 dark:text-white`}>
            {isMobile ? 'PF' : 'ProjectFlow'}
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4 overflow-y-auto">
        <nav className={`space-y-1 ${isMobile ? 'px-2' : 'px-3'}`}>
          {navigationItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`group flex items-center justify-between ${isMobile ? 'px-2 py-2' : 'px-3 py-3'} text-sm font-medium rounded-lg transition-colors duration-150 ${
                location.pathname === item.path
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-600'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center">
                <item.icon className={`${isMobile ? 'mr-2' : 'mr-3'} h-5 w-5`} />
                <span className={isMobile ? 'text-xs' : ''}>{item.label}</span>
              </div>
              {item.count !== null && item.count > 0 && (
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded-full">
                  {item.count}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Workspace Section */}
        <div className={`mt-8 ${isMobile ? 'px-2' : 'px-3'}`}>
          <div className={`flex items-center justify-between ${isMobile ? 'px-2 py-1' : 'px-3 py-2'}`}>
            <h3 className={`${isMobile ? 'text-xs' : 'text-xs'} font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider`}>
              Workspaces
            </h3>
            <button 
              onClick={() => {
                // This would open a workspace creation modal in a real implementation
                console.log('Create new workspace');
              }}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <Plus className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
            </button>
          </div>
          <div className="space-y-1 mt-2">
            {workspaces.map((workspace) => {
              const workspaceTasks = tasks.filter(t => 
                workspace.projects.includes(t.projectId)
              ).filter(t => t.status !== 'Complete').length;
              
              return (
              <button
                key={workspace.id}
                onClick={() => setCurrentWorkspace(workspace)}
                className={`w-full group flex items-center justify-between ${isMobile ? 'px-2 py-1' : 'px-3 py-2'} text-sm rounded-lg transition-colors duration-150 ${
                  currentWorkspace?.id === workspace.id
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center">
                  <span className={`${isMobile ? 'mr-2 text-sm' : 'mr-3 text-base'}`}>{workspace.icon}</span>
                  <span className={isMobile ? 'text-xs' : ''}>{workspace.name}</span>
                </div>
                <span className={`text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 ${isMobile ? 'px-1 py-0.5' : 'px-2 py-1'} rounded-full`}>
                  {workspaceTasks}
                </span>
              </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;