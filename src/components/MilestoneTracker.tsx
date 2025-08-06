import React, { useState } from 'react';
import { useProject } from '../contexts/ProjectContext';
import { useNotification } from '../contexts/NotificationContext';
import { 
  Target, 
  Plus, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Edit3,
  Trash2,
  ArrowRight,
  Flag
} from 'lucide-react';
import { format } from 'date-fns';

interface MilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  milestoneId?: string;
}

const MilestoneModal: React.FC<MilestoneModalProps> = ({ isOpen, onClose, projectId, milestoneId }) => {
  const { milestones, addMilestone, updateMilestone, deleteMilestone } = useProject();
  const { addNotification } = useNotification();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dueDate: '',
    status: 'Pending' as const,
    dependencies: [] as string[]
  });

  const milestone = milestoneId ? milestones.find(m => m.id === milestoneId) : null;
  const isEditing = !!milestoneId;

  React.useEffect(() => {
    if (milestone) {
      setFormData({
        name: milestone.name,
        description: milestone.description,
        dueDate: milestone.dueDate,
        status: milestone.status,
        dependencies: milestone.dependencies
      });
    } else {
      setFormData({
        name: '',
        description: '',
        dueDate: '',
        status: 'Pending',
        dependencies: []
      });
    }
  }, [milestone, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const milestoneData = {
      ...formData,
      projectId
    };

    if (isEditing && milestone) {
      updateMilestone(milestone.id, milestoneData);
      addNotification({
        type: 'success',
        title: 'Milestone Updated',
        message: `Milestone "${formData.name}" has been updated`,
        userId: '1',
        relatedEntity: {
          type: 'project',
          id: projectId,
          name: formData.name
        }
      });
    } else {
      addMilestone(milestoneData);
      addNotification({
        type: 'info',
        title: 'Milestone Created',
        message: `New milestone "${formData.name}" has been created`,
        userId: '1',
        relatedEntity: {
          type: 'project',
          id: projectId,
          name: formData.name
        }
      });
    }
    
    onClose();
  };

  const handleDelete = () => {
    if (milestone && window.confirm('Are you sure you want to delete this milestone?')) {
      deleteMilestone(milestone.id);
      addNotification({
        type: 'warning',
        title: 'Milestone Deleted',
        message: `Milestone "${milestone.name}" has been deleted`,
        userId: '1',
        relatedEntity: {
          type: 'project',
          id: projectId,
          name: milestone.name
        }
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Milestone' : 'Create Milestone'}
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
              Milestone Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              placeholder="Enter milestone name"
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
              placeholder="Enter milestone description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              />
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
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
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
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              {isEditing ? 'Update Milestone' : 'Create Milestone'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MilestoneTracker = () => {
  const { projects, milestones } = useProject();
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<string | null>(null);

  const filteredMilestones = selectedProject === 'all' 
    ? milestones 
    : milestones.filter(m => m.projectId === selectedProject);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'In Progress':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'Overdue':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default:
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'In Progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'Overdue':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Flag className="h-4 w-4 text-yellow-500" />;
    }
  };

  const handleNewMilestone = () => {
    setEditingMilestone(null);
    setShowModal(true);
  };

  const handleEditMilestone = (milestoneId: string) => {
    setEditingMilestone(milestoneId);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMilestone(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Milestone Tracker</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track key project milestones and deliverables</p>
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
            onClick={handleNewMilestone}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Milestone</span>
          </button>
        </div>
      </div>

      {/* Milestones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMilestones.map((milestone) => {
          const project = projects.find(p => p.id === milestone.projectId);
          return (
            <div
              key={milestone.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{milestone.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{project?.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditMilestone(milestone.id)}
                    className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{milestone.description}</p>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(milestone.status)}`}>
                    {getStatusIcon(milestone.status)}
                    <span className="ml-1">{milestone.status}</span>
                  </span>
                  <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(milestone.dueDate), 'MMM d, yyyy')}</span>
                  </div>
                </div>

                {milestone.dependencies.length > 0 && (
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Dependencies:</p>
                    <div className="flex items-center space-x-1">
                      <ArrowRight className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {milestone.dependencies.length} milestone(s)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredMilestones.length === 0 && (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No milestones found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {selectedProject === 'all' 
              ? 'Create your first milestone to track project progress.' 
              : 'No milestones found for the selected project.'}
          </p>
          <button
            onClick={handleNewMilestone}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Milestone
          </button>
        </div>
      )}

      <MilestoneModal
        isOpen={showModal}
        onClose={handleCloseModal}
        projectId={selectedProject === 'all' ? projects[0]?.id || '' : selectedProject}
        milestoneId={editingMilestone || undefined}
      />
    </div>
  );
};

export default MilestoneTracker;