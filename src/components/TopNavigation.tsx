import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import { useTask } from '../contexts/TaskContext';
import { useProject } from '../contexts/ProjectContext';
import NotificationPanel from './NotificationPanel';
import UserProfile from './UserProfile';
import ChatPanel from './ChatPanel';
import AIAssistant from './AIAssistant';
import { 
  Search, 
  Filter, 
  Plus, 
  Bell, 
  ChevronDown,
  MoreHorizontal,
  Grid3X3,
  List,
  Calendar,
  Sun,
  Moon,
  User,
  Settings,
  LogOut,
  MessageSquare,
  Brain
} from 'lucide-react';
import { useState } from 'react';

const TopNavigation = () => {
  const location = useLocation();
  const { theme, setTheme, isDark } = useTheme();
  const { currentUser } = useUser();
  const { tasks, goals, documents } = useTask();
  const { projects } = useProject();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showAI, setShowAI] = useState(false);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard';
      case '/tasks':
        return 'Tasks';
      case '/goals':
        return 'Goals';
      case '/docs':
        return 'Documents';
      case '/calendar':
        return 'Calendar';
      case '/automations':
        return 'Automations';
      case '/users':
        return 'Users';
      case '/reports':
        return 'Reports';
      case '/settings':
        return 'Settings';
      default:
        return 'ProjectFlow';
    }
  };

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const results: any[] = [];
    const searchLower = term.toLowerCase();

    // Search tasks
    tasks.forEach(task => {
      if (task.name.toLowerCase().includes(searchLower) || 
          task.description?.toLowerCase().includes(searchLower)) {
        results.push({
          type: 'task',
          id: task.id,
          title: task.name,
          subtitle: task.project,
          url: '/tasks'
        });
      }
    });

    // Search projects
    projects.forEach(project => {
      if (project.name.toLowerCase().includes(searchLower) || 
          project.description.toLowerCase().includes(searchLower)) {
        results.push({
          type: 'project',
          id: project.id,
          title: project.name,
          subtitle: project.status,
          url: '/projects'
        });
      }
    });

    // Search goals
    goals.forEach(goal => {
      if (goal.title.toLowerCase().includes(searchLower) || 
          goal.description.toLowerCase().includes(searchLower)) {
        results.push({
          type: 'goal',
          id: goal.id,
          title: goal.title,
          subtitle: goal.category,
          url: '/goals'
        });
      }
    });

    // Search documents
    documents.forEach(doc => {
      if (doc.title.toLowerCase().includes(searchLower) || 
          doc.content.toLowerCase().includes(searchLower)) {
        results.push({
          type: 'document',
          id: doc.id,
          title: doc.title,
          subtitle: doc.author,
          url: '/docs'
        });
      }
    });

    setSearchResults(results.slice(0, 10));
    setShowSearchResults(true);
  };

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {getPageTitle()}
          </h1>
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search tasks, projects, or people..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => searchTerm.length >= 2 && setShowSearchResults(true)}
              className="pl-10 pr-4 py-2 w-80 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            
            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowSearchResults(false)}
                />
                <div className="absolute top-12 left-0 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-80 overflow-y-auto z-50">
                  {searchResults.map((result, index) => (
                    <div
                      key={`${result.type}-${result.id}`}
                      className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                      onClick={() => {
                        setShowSearchResults(false);
                        setSearchTerm('');
                        // Navigate to result
                        window.location.href = result.url;
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                            {result.type.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {result.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {result.type} • {result.subtitle}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-700 rounded transition-colors">
              <List className="h-4 w-4" />
            </button>
            <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-700 rounded transition-colors">
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-700 rounded transition-colors">
              <Calendar className="h-4 w-4" />
            </button>
          </div>

          {/* Notifications */}
          <NotificationPanel />

          {/* Chat */}
          <button
            onClick={() => setShowChat(!showChat)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Team Chat"
          >
            <MessageSquare className="h-5 w-5" />
          </button>

          {/* AI Assistant */}
          <button
            onClick={() => setShowAI(!showAI)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="AI Assistant"
          >
            <Brain className="h-5 w-5" />
          </button>

          {/* Profile */}
          <div className="relative flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-medium leading-none">{currentUser.initials}</span>
            </div>
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
            
            {showProfileMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="absolute right-0 top-12 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{currentUser.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser.email}</p>
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded mt-1">
                      {currentUser.role}
                    </span>
                  </div>
                  <div className="py-1">
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span onClick={() => {setShowProfile(true); setShowProfileMenu(false);}}>Profile</span>
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2">
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </button>
                    <hr className="my-1 border-gray-200 dark:border-gray-600" />
                    <button className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2">
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      <UserProfile 
        isOpen={showProfile} 
        onClose={() => setShowProfile(false)} 
      />
      
      <ChatPanel 
        isOpen={showChat} 
        onClose={() => setShowChat(false)} 
      />
      
      <AIAssistant 
        isOpen={showAI} 
        onClose={() => setShowAI(false)} 
      />
    </div>
  );
};

export default TopNavigation;