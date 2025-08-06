import React, { useState } from 'react';
import { useProject } from '../contexts/ProjectContext';
import { useNotification } from '../contexts/NotificationContext';
import { 
  Users, 
  Plus, 
  Monitor, 
  Package, 
  Wrench,
  Edit3,
  Trash2,
  DollarSign,
  TrendingUp,
  Activity
} from 'lucide-react';

interface ResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceId?: string;
}

const ResourceModal: React.FC<ResourceModalProps> = ({ isOpen, onClose, resourceId }) => {
  const { resources, addResource, updateResource, deleteResource } = useProject();
  const { addNotification } = useNotification();
  const [formData, setFormData] = useState({
    name: '',
    type: 'Human' as const,
    cost: 0,
    availability: 100,
    skills: [] as string[],
    department: ''
  });
  const [skillInput, setSkillInput] = useState('');

  const resource = resourceId ? resources.find(r => r.id === resourceId) : null;
  const isEditing = !!resourceId;

  React.useEffect(() => {
    if (resource) {
      setFormData({
        name: resource.name,
        type: resource.type,
        cost: resource.cost,
        availability: resource.availability,
        skills: resource.skills || [],
        department: resource.department || ''
      });
    } else {
      setFormData({
        name: '',
        type: 'Human',
        cost: 0,
        availability: 100,
        skills: [],
        department: ''
      });
    }
  }, [resource, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing && resource) {
      updateResource(resource.id, formData);
      addNotification({
        type: 'success',
        title: 'Resource Updated',
        message: `Resource "${formData.name}" has been updated`,
        userId: '1',
        relatedEntity: {
          type: 'project',
          id: 'resources',
          name: formData.name
        }
      });
    } else {
      addResource(formData);
      addNotification({
        type: 'info',
        title: 'Resource Added',
        message: `New resource "${formData.name}" has been added`,
        userId: '1',
        relatedEntity: {
          type: 'project',
          id: 'resources',
          name: formData.name
        }
      });
    }
    
    onClose();
  };

  const handleDelete = () => {
    if (resource && window.confirm('Are you sure you want to delete this resource?')) {
      deleteResource(resource.id);
      addNotification({
        type: 'warning',
        title: 'Resource Removed',
        message: `Resource "${resource.name}" has been removed`,
        userId: '1',
        relatedEntity: {
          type: 'project',
          id: 'resources',
          name: resource.name
        }
      });
      onClose();
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Resource' : 'Add Resource'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Resource Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                placeholder="Enter resource name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              >
                <option value="Human">Human</option>
                <option value="Equipment">Equipment</option>
                <option value="Material">Material</option>
                <option value="Software">Software</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cost per Hour ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData(prev => ({ ...prev, cost: Number(e.target.value) }))}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Availability (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.availability}
                onChange={(e) => setFormData(prev => ({ ...prev, availability: Number(e.target.value) }))}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {formData.type === 'Human' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                placeholder="e.g., Engineering, Design, Marketing"
              />
            </div>
          )}

          {formData.type === 'Human' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Skills
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                  placeholder="Add a skill"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          )}

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
              {isEditing ? 'Update Resource' : 'Add Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ResourceManagement = () => {
  const { resources } = useProject();
  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('All');

  const filteredResources = filterType === 'All' 
    ? resources 
    : resources.filter(r => r.type === filterType);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Human':
        return <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case 'Equipment':
        return <Wrench className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'Material':
        return <Package className="h-5 w-5 text-orange-600 dark:text-orange-400" />;
      case 'Software':
        return <Monitor className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getAvailabilityColor = (availability: number) => {
    if (availability >= 80) return 'text-green-600 dark:text-green-400';
    if (availability >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const handleNewResource = () => {
    setEditingResource(null);
    setShowModal(true);
  };

  const handleEditResource = (resourceId: string) => {
    setEditingResource(resourceId);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingResource(null);
  };

  const resourceStats = {
    total: resources.length,
    human: resources.filter(r => r.type === 'Human').length,
    equipment: resources.filter(r => r.type === 'Equipment').length,
    totalCost: resources.reduce((sum, r) => sum + r.cost, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Resource Management</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and allocate project resources</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
          >
            <option value="All">All Types</option>
            <option value="Human">Human</option>
            <option value="Equipment">Equipment</option>
            <option value="Material">Material</option>
            <option value="Software">Software</option>
          </select>
          <button
            onClick={handleNewResource}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Resource</span>
          </button>
        </div>
      </div>

      {/* Resource Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Resources</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{resourceStats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Human Resources</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{resourceStats.human}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Wrench className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Equipment</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{resourceStats.equipment}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Cost/Hour</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${resourceStats.totalCost}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <div
            key={resource.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  {getTypeIcon(resource.type)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{resource.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{resource.type}</p>
                </div>
              </div>
              <button
                onClick={() => handleEditResource(resource.id)}
                className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Cost per Hour</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">${resource.cost}</span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Availability</span>
                  <span className={`text-sm font-medium ${getAvailabilityColor(resource.availability)}`}>
                    {resource.availability}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      resource.availability >= 80 ? 'bg-green-500' :
                      resource.availability >= 50 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${resource.availability}%` }}
                  ></div>
                </div>
              </div>

              {resource.department && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Department</span>
                  <span className="text-sm text-gray-900 dark:text-white">{resource.department}</span>
                </div>
              )}

              {resource.skills && resource.skills.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {resource.skills.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                    {resource.skills.length > 3 && (
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                        +{resource.skills.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <Activity className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No resources found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {filterType === 'All' 
              ? 'Add your first resource to start managing your project assets.' 
              : `No ${filterType.toLowerCase()} resources found.`}
          </p>
          <button
            onClick={handleNewResource}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Resource
          </button>
        </div>
      )}

      <ResourceModal
        isOpen={showModal}
        onClose={handleCloseModal}
        resourceId={editingResource || undefined}
      />
    </div>
  );
};

export default ResourceManagement;