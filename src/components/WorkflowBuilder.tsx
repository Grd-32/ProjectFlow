import React, { useState } from 'react';
import { useProject } from '../contexts/ProjectContext';
import { useNotification } from '../contexts/NotificationContext';
import { 
  Workflow, 
  Plus, 
  Play, 
  Edit3, 
  Trash2, 
  ArrowRight,
  Clock,
  User,
  Copy
} from 'lucide-react';

interface WorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateId?: string;
}

const WorkflowModal: React.FC<WorkflowModalProps> = ({ isOpen, onClose, templateId }) => {
  const { workflowTemplates, addWorkflowTemplate, updateWorkflowTemplate, deleteWorkflowTemplate } = useProject();
  const { addNotification } = useNotification();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    steps: [] as Array<{
      name: string;
      description: string;
      assignee?: string;
      duration: number;
      dependencies: string[];
      order: number;
    }>
  });

  const template = templateId ? workflowTemplates.find(t => t.id === templateId) : null;
  const isEditing = !!templateId;

  React.useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        description: template.description,
        category: template.category,
        steps: template.steps
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: '',
        steps: []
      });
    }
  }, [template, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing && template) {
      updateWorkflowTemplate(template.id, formData);
      addNotification({
        type: 'success',
        title: 'Workflow Updated',
        message: `Workflow template "${formData.name}" has been updated`,
        userId: '1',
        relatedEntity: {
          type: 'project',
          id: 'workflow',
          name: formData.name
        }
      });
    } else {
      addWorkflowTemplate(formData);
      addNotification({
        type: 'info',
        title: 'Workflow Created',
        message: `New workflow template "${formData.name}" has been created`,
        userId: '1',
        relatedEntity: {
          type: 'project',
          id: 'workflow',
          name: formData.name
        }
      });
    }
    
    onClose();
  };

  const handleDelete = () => {
    if (template && window.confirm('Are you sure you want to delete this workflow template?')) {
      deleteWorkflowTemplate(template.id);
      addNotification({
        type: 'warning',
        title: 'Workflow Deleted',
        message: `Workflow template "${template.name}" has been deleted`,
        userId: '1',
        relatedEntity: {
          type: 'project',
          id: 'workflow',
          name: template.name
        }
      });
      onClose();
    }
  };

  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, {
        name: '',
        description: '',
        duration: 1,
        dependencies: [],
        order: prev.steps.length + 1
      }]
    }));
  };

  const updateStep = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => 
        i === index ? { ...step, [field]: value } : step
      )
    }));
  };

  const removeStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index).map((step, i) => ({
        ...step,
        order: i + 1
      }))
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Workflow Template' : 'Create Workflow Template'}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Template Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                placeholder="Enter template name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                placeholder="e.g., Development, Design, Marketing"
              />
            </div>
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
              placeholder="Describe the workflow template"
            />
          </div>

          {/* Workflow Steps */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Workflow Steps
              </label>
              <button
                type="button"
                onClick={addStep}
                className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Step</span>
              </button>
            </div>

            <div className="space-y-4">
              {formData.steps.map((step, index) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Step {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Step name"
                        value={step.name}
                        onChange={(e) => updateStep(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Duration (days)"
                        min="1"
                        value={step.duration}
                        onChange={(e) => updateStep(index, 'duration', Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <textarea
                      placeholder="Step description"
                      value={step.description}
                      onChange={(e) => updateStep(index, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="mt-3">
                    <input
                      type="text"
                      placeholder="Assignee (optional)"
                      value={step.assignee || ''}
                      onChange={(e) => updateStep(index, 'assignee', e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              ))}
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
              {isEditing ? 'Update Template' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const WorkflowBuilder = () => {
  const { workflowTemplates } = useProject();
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);

  const handleNewTemplate = () => {
    setEditingTemplate(null);
    setShowModal(true);
  };

  const handleEditTemplate = (templateId: string) => {
    setEditingTemplate(templateId);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTemplate(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Workflow Templates</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Create reusable workflow templates for your projects</p>
        </div>
        <button
          onClick={handleNewTemplate}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Template</span>
        </button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workflowTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Workflow className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{template.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{template.category}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEditTemplate(template.id)}
                  className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button className="p-1 text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{template.description}</p>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Steps</span>
                <span className="text-gray-900 dark:text-white font-medium">{template.steps.length}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Total Duration</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {template.steps.reduce((sum, step) => sum + step.duration, 0)} days
                </span>
              </div>

              {/* Step Preview */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Workflow Steps:</p>
                <div className="space-y-1">
                  {template.steps.slice(0, 3).map((step, index) => (
                    <div key={index} className="flex items-center space-x-2 text-xs">
                      <span className="w-4 h-4 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400">
                        {index + 1}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 truncate">{step.name}</span>
                      <div className="flex items-center space-x-1 text-gray-400">
                        <Clock className="h-3 w-3" />
                        <span>{step.duration}d</span>
                      </div>
                    </div>
                  ))}
                  {template.steps.length > 3 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      +{template.steps.length - 3} more steps
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <button className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                  <Play className="h-4 w-4" />
                  <span>Use Template</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {workflowTemplates.length === 0 && (
        <div className="text-center py-12">
          <Workflow className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No workflow templates</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Create your first workflow template to standardize your processes.
          </p>
          <button
            onClick={handleNewTemplate}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </button>
        </div>
      )}

      <WorkflowModal
        isOpen={showModal}
        onClose={handleCloseModal}
        templateId={editingTemplate || undefined}
      />
    </div>
  );
};

export default WorkflowBuilder;