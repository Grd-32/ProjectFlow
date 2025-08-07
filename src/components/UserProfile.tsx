import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useNotification } from '../contexts/NotificationContext';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit3,
  Save,
  Camera,
  Shield
} from 'lucide-react';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateUser } = useUser();
  const { addNotification } = useNotification();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    department: currentUser.department,
    phone: '',
    location: '',
    bio: ''
  });

  const handleSave = () => {
    updateUser(currentUser.id, {
      name: formData.name,
      email: formData.email,
      department: formData.department
    });
    
    addNotification({
      type: 'success',
      title: 'Profile Updated',
      message: 'Your profile has been updated successfully',
      userId: currentUser.id,
      relatedEntity: {
        type: 'user',
        id: currentUser.id,
        name: formData.name
      }
    });
    
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: currentUser.name,
      email: currentUser.email,
      department: currentUser.department,
      phone: '',
      location: '',
      bio: ''
    });
    setIsEditing(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">User Profile</h2>
          <div className="flex items-center space-x-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Profile Header */}
          <div className="flex items-center space-x-6 mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">{currentUser.initials}</span>
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="text-2xl font-bold text-gray-900 dark:text-white bg-transparent border-b-2 border-blue-500 focus:outline-none w-full"
                />
              ) : (
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{currentUser.name}</h3>
              )}
              <div className="flex items-center space-x-2 mt-2">
                <Shield className="h-4 w-4 text-gray-500" />
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  currentUser.role === 'Admin' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                  currentUser.role === 'Manager' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                  currentUser.role === 'Member' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                  'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                }`}>
                  {currentUser.role}
                </span>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  currentUser.status === 'Active' 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                }`}>
                  {currentUser.status}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{currentUser.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <User className="h-4 w-4 inline mr-2" />
                  Department
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{currentUser.department}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Phone className="h-4 w-4 inline mr-2" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                    placeholder="Enter phone number"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{formData.phone || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <MapPin className="h-4 w-4 inline mr-2" />
                  Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                    placeholder="Enter location"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{formData.location || 'Not provided'}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              {isEditing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{formData.bio || 'No bio provided'}</p>
              )}
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="h-4 w-4" />
              <span>Member since {new Date(currentUser.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <span>Last login {new Date(currentUser.lastLogin).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;