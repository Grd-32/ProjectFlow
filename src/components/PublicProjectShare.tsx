import React, { useState } from 'react';
import { useProject } from '../contexts/ProjectContext';
import { useTask } from '../contexts/TaskContext';
import { useNotification } from '../contexts/NotificationContext';
import { 
  Share2, 
  Copy, 
  Eye, 
  EyeOff, 
  Link, 
  Globe, 
  Lock,
  Calendar,
  CheckSquare,
  Users,
  BarChart3,
  Download,
  Settings,
  X
} from 'lucide-react';
import { format } from 'date-fns';

interface PublicProjectShareProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

const PublicProjectShare: React.FC<PublicProjectShareProps> = ({ projectId, isOpen, onClose }) => {
  const { projects, updateProject } = useProject();
  const { tasks } = useTask();
  const { addNotification } = useNotification();
  const [shareSettings, setShareSettings] = useState({
    isPublic: false,
    allowComments: true,
    showTeamMembers: true,
    showBudget: false,
    showProgress: true,
    showTasks: true,
    showMilestones: true,
    passwordProtected: false,
    password: '',
    expiresAt: '',
    allowDownload: false
  });
  const [shareLink, setShareLink] = useState('');

  const project = projects.find(p => p.id === projectId);
  const projectTasks = tasks.filter(t => t.project === project?.name);

  React.useEffect(() => {
    if (project) {
      // Generate share link
      const baseUrl = window.location.origin;
      const token = btoa(`${projectId}-${Date.now()}`);
      setShareLink(`${baseUrl}/public/project/${token}`);
    }
  }, [project, projectId]);

  const handleTogglePublic = () => {
    const newPublicState = !shareSettings.isPublic;
    setShareSettings(prev => ({ ...prev, isPublic: newPublicState }));
    
    if (project) {
      updateProject(projectId, { 
        // Add public sharing properties to project
        isPubliclyShared: newPublicState,
        shareSettings: shareSettings
      });

      addNotification({
        type: newPublicState ? 'success' : 'info',
        title: newPublicState ? 'Project Made Public' : 'Project Made Private',
        message: `Project "${project.name}" is now ${newPublicState ? 'publicly accessible' : 'private'}`,
        userId: '1',
        relatedEntity: {
          type: 'project',
          id: projectId,
          name: project.name
        }
      });
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    addNotification({
      type: 'success',
      title: 'Link Copied',
      message: 'Public share link copied to clipboard',
      userId: '1',
      relatedEntity: {
        type: 'project',
        id: projectId,
        name: project?.name || 'Project'
      }
    });
  };

  const generateNewLink = () => {
    const baseUrl = window.location.origin;
    const token = btoa(`${projectId}-${Date.now()}`);
    const newLink = `${baseUrl}/public/project/${token}`;
    setShareLink(newLink);
    
    addNotification({
      type: 'info',
      title: 'New Link Generated',
      message: 'A new public share link has been generated',
      userId: '1',
      relatedEntity: {
        type: 'project',
        id: projectId,
        name: project?.name || 'Project'
      }
    });
  };

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <Share2 className="h-5 w-5 mr-2" />
            Share Project: {project.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Public Access Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${shareSettings.isPublic ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-600'}`}>
                {shareSettings.isPublic ? (
                  <Globe className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <Lock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  {shareSettings.isPublic ? 'Public Access Enabled' : 'Private Project'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {shareSettings.isPublic 
                    ? 'Anyone with the link can view this project'
                    : 'Only team members can access this project'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={handleTogglePublic}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                shareSettings.isPublic ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  shareSettings.isPublic ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Share Link */}
          {shareSettings.isPublic && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Public Share Link
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={copyShareLink}
                    className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Link created {format(new Date(), 'MMM d, yyyy')}
                  </p>
                  <button
                    onClick={generateNewLink}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Generate New Link
                  </button>
                </div>
              </div>

              {/* Share Settings */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Visibility Settings</h4>
                
                <div className="space-y-3">
                  {[
                    { key: 'showProgress', label: 'Show Project Progress', icon: BarChart3 },
                    { key: 'showTasks', label: 'Show Task List', icon: CheckSquare },
                    { key: 'showMilestones', label: 'Show Milestones', icon: Calendar },
                    { key: 'showTeamMembers', label: 'Show Team Members', icon: Users },
                    { key: 'showBudget', label: 'Show Budget Information', icon: BarChart3 },
                    { key: 'allowComments', label: 'Allow Public Comments', icon: Eye },
                    { key: 'allowDownload', label: 'Allow File Downloads', icon: Download }
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <setting.icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{setting.label}</span>
                      </div>
                      <button
                        onClick={() => setShareSettings(prev => ({ 
                          ...prev, 
                          [setting.key]: !prev[setting.key as keyof typeof prev] 
                        }))}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          shareSettings[setting.key as keyof typeof shareSettings] ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            shareSettings[setting.key as keyof typeof shareSettings] ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Password Protection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Lock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Password Protection</span>
                  </div>
                  <button
                    onClick={() => setShareSettings(prev => ({ ...prev, passwordProtected: !prev.passwordProtected }))}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      shareSettings.passwordProtected ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        shareSettings.passwordProtected ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                {shareSettings.passwordProtected && (
                  <input
                    type="password"
                    value={shareSettings.password}
                    onChange={(e) => setShareSettings(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter password"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  />
                )}
              </div>

              {/* Expiration Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Link Expiration (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={shareSettings.expiresAt}
                  onChange={(e) => setShareSettings(prev => ({ ...prev, expiresAt: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                />
              </div>

              {/* Preview */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                  <Eye className="h-4 w-4 mr-2" />
                  Public View Preview
                </h4>
                <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                  <p>✓ Project name and description</p>
                  {shareSettings.showProgress && <p>✓ Progress: {project.progress}%</p>}
                  {shareSettings.showTasks && <p>✓ Tasks: {projectTasks.length} total</p>}
                  {shareSettings.showTeamMembers && <p>✓ Team: {project.team.length} members</p>}
                  {shareSettings.showBudget && <p>✓ Budget: ${project.budget.toLocaleString()}</p>}
                  {shareSettings.allowComments && <p>✓ Public comments enabled</p>}
                  {shareSettings.passwordProtected && <p>🔒 Password protected</p>}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
            {shareSettings.isPublic && (
              <button
                onClick={copyShareLink}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                <Copy className="h-4 w-4" />
                <span>Copy Link</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProjectShare;