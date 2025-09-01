import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { 
  LayoutDashboard, 
  CheckSquare, 
  FolderOpen,
  Target, 
  Calendar,
  MoreHorizontal
} from 'lucide-react';

const MobileNavigation = () => {
  const location = useLocation();
  const { hasPermission } = useUser();

  const navigationItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
    { icon: FolderOpen, label: 'Projects', path: '/projects' },
    { icon: Target, label: 'Goals', path: '/goals' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
    { icon: MoreHorizontal, label: 'More', path: '/settings' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40 md:hidden">
      <nav className="flex justify-around py-2">
        {navigationItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              location.pathname === item.path
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default MobileNavigation;