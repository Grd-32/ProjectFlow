import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useNotification } from '../contexts/NotificationContext';
import { X, Mail, Send, Users, Copy, Check } from 'lucide-react';

interface UserInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserInviteModal: React.FC<UserInviteModalProps> = ({ isOpen, onClose }) => {
  const { addUser } = useUser();
  const { addNotification } = useNotification();
  const [inviteData, setInviteData] = useState({
    emails: '',
    role: 'Member' as const,
    department: '',
    message: 'You have been invited to join our project management workspace. Click the link below to get started.'
  });
  const [inviteLinks, setInviteLinks] = useState<Array<{
    email: string;
    link: string;
    status: 'pending' | 'sent' | 'accepted';
  }>>([]);
  const [showLinks, setShowLinks] = useState(false);

  const generateInviteLink = (email: string) => {
    const token = btoa(`${email}-${Date.now()}`);
    return `${window.location.origin}/invite/${token}`;
  };

  const handleSendInvites = (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailList = inviteData.emails
      .split(',')
      .map(email => email.trim())
      .filter(email => email && email.includes('@'));

    if (emailList.length === 0) {
      addNotification({
        type: 'error',
        title: 'Invalid Emails',
        message: 'Please enter valid email addresses',
        userId: '1',
        relatedEntity: {
          type: 'user',
          id: 'invite',
          name: 'User Invitation'
        }
      });
      return;
    }

    const newInviteLinks = emailList.map(email => ({
      email,
      link: generateInviteLink(email),
      status: 'sent' as const
    }));

    setInviteLinks(newInviteLinks);
    setShowLinks(true);

    // Simulate sending emails
    emailList.forEach(email => {
      // In a real app, this would send actual emails
      addNotification({
        type: 'success',
        title: 'Invitation Sent',
        message: `Invitation sent to ${email}`,
        userId: '1',
        relatedEntity: {
          type: 'user',
          id: 'invite',
          name: email
        }
      });
    });

    addNotification({
      type: 'info',
      title: 'Invitations Sent',
      message: `${emailList.length} invitation(s) sent successfully`,
      userId: '1',
      relatedEntity: {
        type: 'user',
        id: 'invite',
        name: 'Bulk Invitation'
      }
    });
  };

  const copyInviteLink = (link: string, email: string) => {
    navigator.clipboard.writeText(link);
    addNotification({
      type: 'info',
      title: 'Link Copied',
      message: `Invite link for ${email} copied to clipboard`,
      userId: '1',
      relatedEntity: {
        type: 'user',
        id: 'invite',
        name: email
      }
    });
  };

  const resendInvite = (email: string) => {
    addNotification({
      type: 'info',
      title: 'Invitation Resent',
      message: `Invitation resent to ${email}`,
      userId: '1',
      relatedEntity: {
        type: 'user',
        id: 'invite',
        name: email
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Invite Team Members</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!showLinks ? (
          <form onSubmit={handleSendInvites} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Addresses *
              </label>
              <textarea
                value={inviteData.emails}
                onChange={(e) => setInviteData(prev => ({ ...prev, emails: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                placeholder="Enter email addresses separated by commas&#10;example@company.com, user@domain.com"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Separate multiple email addresses with commas
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Default Role
                </label>
                <select
                  value={inviteData.role}
                  onChange={(e) => setInviteData(prev => ({ ...prev, role: e.target.value as any }))}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                >
                  <option value="Viewer">Viewer</option>
                  <option value="Member">Member</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Department
                </label>
                <input
                  type="text"
                  value={inviteData.department}
                  onChange={(e) => setInviteData(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                  placeholder="e.g., Engineering, Design"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Invitation Message
              </label>
              <textarea
                value={inviteData.message}
                onChange={(e) => setInviteData(prev => ({ ...prev, message: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                placeholder="Customize the invitation message"
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
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                <Send className="h-4 w-4" />
                <span>Send Invitations</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Invitations Sent!</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {inviteLinks.length} invitation(s) have been sent successfully.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Invitation Links</h4>
              {inviteLinks.map((invite, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{invite.email}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Status: {invite.status} • Role: {inviteData.role}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => copyInviteLink(invite.link, invite.email)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors"
                      title="Copy invite link"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => resendInvite(invite.email)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded transition-colors"
                      title="Resend invitation"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowLinks(false);
                  setInviteLinks([]);
                  setInviteData(prev => ({ ...prev, emails: '' }));
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Send More Invites
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserInviteModal;