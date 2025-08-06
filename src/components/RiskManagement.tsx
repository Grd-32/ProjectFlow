import React, { useState } from 'react';
import { useProject } from '../contexts/ProjectContext';
import { useNotification } from '../contexts/NotificationContext';
import { 
  AlertTriangle, 
  Plus, 
  Shield, 
  TrendingUp, 
  TrendingDown,
  Edit3,
  Trash2,
  User,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';

interface RiskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  riskId?: string;
}

const RiskModal: React.FC<RiskModalProps> = ({ isOpen, onClose, projectId, riskId }) => {
  const { risks, addRisk, updateRisk, deleteRisk } = useProject();
  const { addNotification } = useNotification();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    probability: 'Medium' as const,
    impact: 'Medium' as const,
    status: 'Open' as const,
    owner: '',
    mitigation: ''
  });

  const risk = riskId ? risks.find(r => r.id === riskId) : null;
  const isEditing = !!riskId;

  React.useEffect(() => {
    if (risk) {
      setFormData({
        title: risk.title,
        description: risk.description,
        probability: risk.probability,
        impact: risk.impact,
        status: risk.status,
        owner: risk.owner,
        mitigation: risk.mitigation
      });
    } else {
      setFormData({
        title: '',
        description: '',
        probability: 'Medium',
        impact: 'Medium',
        status: 'Open',
        owner: '',
        mitigation: ''
      });
    }
  }, [risk, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const riskData = {
      ...formData,
      projectId
    };

    if (isEditing && risk) {
      updateRisk(risk.id, riskData);
      addNotification({
        type: 'warning',
        title: 'Risk Updated',
        message: `Risk "${formData.title}" has been updated`,
        userId: '1',
        relatedEntity: {
          type: 'project',
          id: projectId,
          name: formData.title
        }
      });
    } else {
      addRisk(riskData);
      addNotification({
        type: 'warning',
        title: 'New Risk Identified',
        message: `Risk "${formData.title}" has been added to the project`,
        userId: '1',
        relatedEntity: {
          type: 'project',
          id: projectId,
          name: formData.title
        }
      });
    }
    
    onClose();
  };

  const handleDelete = () => {
    if (risk && window.confirm('Are you sure you want to delete this risk?')) {
      deleteRisk(risk.id);
      addNotification({
        type: 'info',
        title: 'Risk Removed',
        message: `Risk "${risk.title}" has been removed`,
        userId: '1',
        relatedEntity: {
          type: 'project',
          id: projectId,
          name: risk.title
        }
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Risk' : 'Add Risk'}
          </h2>
          <div className="flex items-center space-x-2">
            {isEditing && (
              <button
                onClick={handleDelete}
                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Risk Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              placeholder="Enter risk title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              placeholder="Describe the risk in detail"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Probability
              </label>
              <select
                value={formData.probability}
                onChange={(e) => setFormData(prev => ({ ...prev, probability: e.target.value as any }))}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Impact
              </label>
              <select
                value={formData.impact}
                onChange={(e) => setFormData(prev => ({ ...prev, impact: e.target.value as any }))}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              >
                <option value="Open">Open</option>
                <option value="Mitigated">Mitigated</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Risk Owner
            </label>
            <input
              type="text"
              value={formData.owner}
              onChange={(e) => setFormData(prev => ({ ...prev, owner: e.target.value }))}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              placeholder="Who is responsible for this risk?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mitigation Strategy
            </label>
            <textarea
              value={formData.mitigation}
              onChange={(e) => setFormData(prev => ({ ...prev, mitigation: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              placeholder="How will this risk be mitigated?"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 dark:bg-red-500 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
            >
              {isEditing ? 'Update Risk' : 'Add Risk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const RiskManagement = () => {
  const { projects, risks } = useProject();
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingRisk, setEditingRisk] = useState<string | null>(null);

  const filteredRisks = selectedProject === 'all' 
    ? risks 
    : risks.filter(r => r.projectId === selectedProject);

  const getRiskLevel = (probability: string, impact: string) => {
    const levels = { Low: 1, Medium: 2, High: 3 };
    const score = levels[probability as keyof typeof levels] * levels[impact as keyof typeof levels];
    if (score >= 6) return { level: 'High', color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' };
    if (score >= 4) return { level: 'Medium', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' };
    return { level: 'Low', color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Closed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'Mitigated':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      default:
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
    }
  };

  const handleNewRisk = () => {
    setEditingRisk(null);
    setShowModal(true);
  };

  const handleEditRisk = (riskId: string) => {
    setEditingRisk(riskId);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRisk(null);
  };

  const riskStats = {
    total: filteredRisks.length,
    open: filteredRisks.filter(r => r.status === 'Open').length,
    high: filteredRisks.filter(r => getRiskLevel(r.probability, r.impact).level === 'High').length,
    mitigated: filteredRisks.filter(r => r.status === 'Mitigated').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Risk Management</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Identify, assess, and mitigate project risks</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
          >
            <option value="all">All Projects</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
          <button
            onClick={handleNewRisk}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-red-600 dark:bg-red-500 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Risk</span>
          </button>
        </div>
      </div>

      {/* Risk Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Risks</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{riskStats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <TrendingUp className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Open Risks</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{riskStats.open}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">High Risk</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{riskStats.high}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Mitigated</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{riskStats.mitigated}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Risks List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900 dark:text-white">Risk</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900 dark:text-white">Project</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900 dark:text-white">Risk Level</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900 dark:text-white">Owner</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900 dark:text-white">Created</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRisks.map((risk, index) => {
                const project = projects.find(p => p.id === risk.projectId);
                const riskLevel = getRiskLevel(risk.probability, risk.impact);
                return (
                  <tr 
                    key={risk.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 transition-colors ${
                      index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'
                    }`}
                  >
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{risk.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{risk.description}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{project?.name}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${riskLevel.color}`}>
                        {riskLevel.level}
                      </span>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {risk.probability} × {risk.impact}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(risk.status)}`}>
                        {risk.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{risk.owner || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(risk.createdAt), 'MMM d, yyyy')}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditRisk(risk.id)}
                          className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredRisks.length === 0 && (
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No risks identified</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Start by identifying potential risks that could impact your project.
          </p>
          <button
            onClick={handleNewRisk}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 dark:bg-red-500 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Risk
          </button>
        </div>
      )}

      <RiskModal
        isOpen={showModal}
        onClose={handleCloseModal}
        projectId={selectedProject === 'all' ? projects[0]?.id || '' : selectedProject}
        riskId={editingRisk || undefined}
      />
    </div>
  );
};

export default RiskManagement;