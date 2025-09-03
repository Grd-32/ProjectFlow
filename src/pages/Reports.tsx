import React, { useState } from 'react';
import { useTask } from '../contexts/TaskContext';
import { useProject } from '../contexts/ProjectContext';
import { useUser } from '../contexts/UserContext';
import { useTimeTracking } from '../contexts/TimeTrackingContext';
import { useNotification } from '../contexts/NotificationContext';
import { exportUtils } from '../utils/exportUtils';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target, 
  DollarSign,
  Calendar,
  Download,
  Filter,
  PieChart,
  Activity,
  FileText,
  Table,
  FileSpreadsheet,
  Loader
} from 'lucide-react';
import { format, subDays, subMonths, subYears } from 'date-fns';

const Reports = () => {
  const { tasks, goals } = useTask();
  const { projects } = useProject();
  const { users, hasPermission } = useUser();
  const { timeEntries } = useTimeTracking();
  const { addNotification } = useNotification();
  const [dateRange, setDateRange] = useState('30');
  const [reportType, setReportType] = useState('overview');
  const [isExporting, setIsExporting] = useState(false);

  if (!hasPermission('view_analytics')) {
    return (
      <div className="p-6 text-center">
        <BarChart3 className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Access Denied</h3>
        <p className="text-gray-500 dark:text-gray-400">You don't have permission to view reports.</p>
      </div>
    );
  }

  const getDateFilter = () => {
    const now = new Date();
    switch (dateRange) {
      case '7':
        return subDays(now, 7);
      case '30':
        return subDays(now, 30);
      case '90':
        return subDays(now, 90);
      case '365':
        return subYears(now, 1);
      default:
        return subDays(now, 30);
    }
  };

  const filterDate = getDateFilter();

  // Calculate real metrics
  const completedTasks = tasks.filter(task => task.status === 'Complete').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const activeProjects = projects.filter(p => p.status === 'Active').length;
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);
  const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const activeGoals = goals.filter(g => g.status === 'Active').length;
  const completedGoals = goals.filter(g => g.status === 'Completed').length;

  const handleExportReport = async (format: 'csv' | 'excel' | 'pdf') => {
    setIsExporting(true);
    
    try {
      let data: any[] = [];
      let filename = '';
      let content = '';

      switch (reportType) {
        case 'tasks':
          data = exportUtils.generateTaskReport(tasks);
          filename = `tasks-report-${new Date().toISOString().split('T')[0]}`;
          content = `
            <h2>Tasks Report</h2>
            <p>Report generated on ${new Date().toLocaleDateString()}</p>
            <p>Total Tasks: ${tasks.length}</p>
            <p>Completed: ${tasks.filter(t => t.status === 'Complete').length}</p>
            <p>In Progress: ${tasks.filter(t => t.status === 'In progress').length}</p>
            <p>Pending: ${tasks.filter(t => t.status === 'Pending').length}</p>
            <p>Blocked: ${tasks.filter(t => t.status === 'Blocked').length}</p>
          `;
          break;
        case 'projects':
          data = exportUtils.generateProjectReport(projects);
          filename = `projects-report-${new Date().toISOString().split('T')[0]}`;
          content = `
            <h2>Projects Report</h2>
            <p>Report generated on ${new Date().toLocaleDateString()}</p>
            <p>Total Projects: ${projects.length}</p>
            <p>Active: ${projects.filter(p => p.status === 'Active').length}</p>
            <p>Completed: ${projects.filter(p => p.status === 'Completed').length}</p>
            <p>Total Budget: $${totalBudget.toLocaleString()}</p>
            <p>Total Spent: $${totalSpent.toLocaleString()}</p>
          `;
          break;
        case 'team':
          data = exportUtils.generateUserReport(users);
          filename = `team-report-${new Date().toISOString().split('T')[0]}`;
          content = `
            <h2>Team Report</h2>
            <p>Report generated on ${new Date().toLocaleDateString()}</p>
            <p>Total Users: ${users.length}</p>
            <p>Active: ${users.filter(u => u.status === 'Active').length}</p>
            <p>Inactive: ${users.filter(u => u.status === 'Inactive').length}</p>
          `;
          break;
        case 'time':
          data = exportUtils.generateTimeReport(timeEntries);
          filename = `time-report-${new Date().toISOString().split('T')[0]}`;
          content = `
            <h2>Time Tracking Report</h2>
            <p>Report generated on ${new Date().toLocaleDateString()}</p>
            <p>Total Entries: ${timeEntries.length}</p>
            <p>Total Hours: ${Math.round(timeEntries.reduce((sum, e) => sum + e.duration, 0) / 60)}</p>
          `;
          break;
        default:
          data = exportUtils.generateOverviewReport(tasks, projects, users);
          filename = `overview-report-${new Date().toISOString().split('T')[0]}`;
          content = `
            <h2>Overview Report</h2>
            <p>Report generated on ${new Date().toLocaleDateString()}</p>
            <h3>Summary</h3>
            <p>Tasks: ${tasks.length} (${completedTasks} completed)</p>
            <p>Projects: ${projects.length} (${activeProjects} active)</p>
            <p>Users: ${users.length}</p>
            <p>Budget Utilization: ${budgetUtilization.toFixed(1)}%</p>
          `;
      }

      // Add delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (format === 'pdf') {
        await exportUtils.exportToPDF(content, filename, data);
      } else if (format === 'excel') {
        exportUtils.exportToExcel(data, filename);
      } else {
        exportUtils.exportToCSV(data, filename);
      }

      addNotification({
        type: 'success',
        title: 'Report Exported Successfully',
        message: `${reportType} report exported as ${format.toUpperCase()}`,
        userId: '1',
        relatedEntity: {
          type: 'project',
          id: 'export',
          name: `${reportType} Report`
        }
      });
    } catch (error) {
      console.error('Export error:', error);
      addNotification({
        type: 'error',
        title: 'Export Failed',
        message: 'Failed to export report. Please try again.',
        userId: '1',
        relatedEntity: {
          type: 'project',
          id: 'export',
          name: 'Export Error'
        }
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-6 h-full overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Comprehensive insights into your project performance</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
          >
            <option value="overview">Overview</option>
            <option value="projects">Projects</option>
            <option value="tasks">Tasks</option>
            <option value="team">Team</option>
            <option value="time">Time Tracking</option>
          </select>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => handleExportReport('csv')}
              disabled={isExporting}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {isExporting ? <Loader className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              <span>CSV</span>
            </button>
            <button 
              onClick={() => handleExportReport('excel')}
              disabled={isExporting}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {isExporting ? <Loader className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
              <span>Excel</span>
            </button>
            <button 
              onClick={() => handleExportReport('pdf')}
              disabled={isExporting}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {isExporting ? <Loader className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              <span>PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Task Completion</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{completionRate.toFixed(1)}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{completedTasks} of {totalTasks} tasks</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Projects</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeProjects}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">of {projects.length} total</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <DollarSign className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Budget Utilization</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{budgetUtilization.toFixed(1)}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">${totalSpent.toLocaleString()} spent</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Goals Progress</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeGoals}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{completedGoals} completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Project Status Distribution</h3>
          <div className="space-y-4">
            {['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'].map((status) => {
              const count = projects.filter(p => p.status === status).length;
              const percentage = projects.length > 0 ? (count / projects.length) * 100 : 0;
              return (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{status}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-8">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Task Status Overview</h3>
          <div className="space-y-4">
            {['Pending', 'In progress', 'Complete', 'Blocked'].map((status) => {
              const count = tasks.filter(t => t.status === status).length;
              const percentage = tasks.length > 0 ? (count / tasks.length) * 100 : 0;
              const color = status === 'Complete' ? 'bg-green-500' : 
                           status === 'In progress' ? 'bg-blue-500' :
                           status === 'Blocked' ? 'bg-red-500' : 'bg-yellow-500';
              return (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{status}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`${color} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-8">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Team Performance */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Team Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {users.filter(u => u.status === 'Active').map((user) => {
            const userTasks = tasks.filter(t => t.assignee.id === user.id);
            const completedUserTasks = userTasks.filter(t => t.status === 'Complete').length;
            const userCompletionRate = userTasks.length > 0 ? (completedUserTasks / userTasks.length) * 100 : 0;
            
            return (
              <div key={user.id} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white text-sm font-medium">{user.initials}</span>
                </div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{user.department}</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Tasks:</span>
                    <span className="text-gray-900 dark:text-white">{userTasks.length}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Completed:</span>
                    <span className="text-green-600 dark:text-green-400">{completedUserTasks}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Rate:</span>
                    <span className="text-gray-900 dark:text-white">{userCompletionRate.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Reports;