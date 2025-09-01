import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { 
  Shield, 
  Eye, 
  Edit3, 
  Trash2, 
  LogIn, 
  LogOut, 
  UserPlus, 
  Settings,
  AlertTriangle,
  Clock,
  User,
  Filter,
  Download
} from 'lucide-react';
import { format } from 'date-fns';

interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const SecurityAuditLog = () => {
  const { hasPermission } = useUser();
  const [auditLogs] = useState<AuditLogEntry[]>([
    {
      id: '1',
      userId: '1',
      userName: 'John Doe',
      action: 'LOGIN',
      entityType: 'user',
      entityId: '1',
      entityName: 'John Doe',
      details: 'Successful login from Chrome browser',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      timestamp: '2024-12-11T10:30:00Z',
      severity: 'low'
    },
    {
      id: '2',
      userId: '2',
      userName: 'Sarah Chen',
      action: 'CREATE_PROJECT',
      entityType: 'project',
      entityId: '3',
      entityName: 'New Marketing Campaign',
      details: 'Created new project with budget $50,000',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      timestamp: '2024-12-11T09:15:00Z',
      severity: 'medium'
    },
    {
      id: '3',
      userId: '1',
      userName: 'John Doe',
      action: 'DELETE_USER',
      entityType: 'user',
      entityId: '7',
      entityName: 'Former Employee',
      details: 'Deleted user account and revoked all access',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      timestamp: '2024-12-11T08:45:00Z',
      severity: 'high'
    }
  ]);

  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (!hasPermission('manage_settings')) {
    return (
      <div className="text-center py-8">
        <Shield className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Access Denied</h3>
        <p className="text-gray-500 dark:text-gray-400">You don't have permission to view audit logs.</p>
      </div>
    );
  }

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.entityName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || log.severity === filterSeverity;
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    
    return matchesSearch && matchesSeverity && matchesAction;
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return <LogIn className="h-4 w-4 text-green-600" />;
      case 'LOGOUT':
        return <LogOut className="h-4 w-4 text-gray-600" />;
      case 'CREATE_PROJECT':
      case 'CREATE_TASK':
      case 'CREATE_USER':
        return <UserPlus className="h-4 w-4 text-blue-600" />;
      case 'DELETE_USER':
      case 'DELETE_PROJECT':
      case 'DELETE_TASK':
        return <Trash2 className="h-4 w-4 text-red-600" />;
      case 'EDIT_PROJECT':
      case 'EDIT_TASK':
      case 'EDIT_USER':
        return <Edit3 className="h-4 w-4 text-yellow-600" />;
      default:
        return <Eye className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'high':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      default:
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Security Audit Log</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor all system activities and security events</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <Download className="h-4 w-4" />
          <span>Export Logs</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search audit logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>
          
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
          >
            <option value="all">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
          >
            <option value="all">All Actions</option>
            <option value="LOGIN">Login</option>
            <option value="LOGOUT">Logout</option>
            <option value="CREATE_PROJECT">Create Project</option>
            <option value="DELETE_USER">Delete User</option>
            <option value="EDIT_SETTINGS">Edit Settings</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900 dark:text-white">Action</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900 dark:text-white">User</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900 dark:text-white">Entity</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900 dark:text-white">Details</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900 dark:text-white">Severity</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900 dark:text-white">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, index) => (
                <tr 
                  key={log.id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 transition-colors ${
                    index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'
                  }`}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      {getActionIcon(log.action)}
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {log.action.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">{log.userName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{log.entityName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{log.entityType}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate" title={log.details}>
                      {log.details}
                    </p>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(log.severity)}`}>
                      {log.severity}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>{format(new Date(log.timestamp), 'MMM d, yyyy HH:mm')}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredLogs.length === 0 && (
        <div className="text-center py-12">
          <Shield className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No audit logs found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm ? 'Try adjusting your search terms.' : 'Audit logs will appear here as users perform actions.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default SecurityAuditLog;