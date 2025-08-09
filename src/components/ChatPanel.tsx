import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useUser } from '../contexts/UserContext';
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  Smile, 
  MoreHorizontal,
  Hash,
  Users,
  Plus,
  X,
  Edit3,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ isOpen, onClose }) => {
  const { 
    channels, 
    messages, 
    activeChannel, 
    setActiveChannel, 
    sendMessage, 
    addReaction,
    editMessage,
    deleteMessage 
  } = useChat();
  const { users, currentUser } = useUser();
  const [newMessage, setNewMessage] = useState('');
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChannel]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && activeChannel) {
      sendMessage(activeChannel, newMessage.trim());
      setNewMessage('');
    }
  };

  const handleEditMessage = (messageId: string, newContent: string) => {
    if (activeChannel) {
      editMessage(messageId, activeChannel, newContent);
      setEditingMessage(null);
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    if (activeChannel && window.confirm('Delete this message?')) {
      deleteMessage(messageId, activeChannel);
    }
  };

  const handleReaction = (messageId: string, emoji: string) => {
    if (activeChannel) {
      addReaction(messageId, activeChannel, emoji);
    }
  };

  const currentChannel = channels.find(c => c.id === activeChannel);
  const channelMessages = activeChannel ? messages[activeChannel] || [] : [];

  if (!isOpen) return null;

  return (
    <div className="fixed right-4 bottom-4 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col z-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            {currentChannel?.type === 'project' ? (
              <Hash className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            ) : (
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {currentChannel?.name || 'Select Channel'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {currentChannel?.members.length} members
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Channel List */}
      <div className="p-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-1 overflow-x-auto">
          {channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => setActiveChannel(channel.id)}
              className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
                activeChannel === channel.id
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {channel.name}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {channelMessages.map((message) => (
          <div key={message.id} className="group">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-medium">{message.authorInitials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {message.authorName}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {format(new Date(message.timestamp), 'HH:mm')}
                  </span>
                  {message.isEdited && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">(edited)</span>
                  )}
                </div>
                
                {editingMessage === message.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      defaultValue={message.content}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleEditMessage(message.id, e.currentTarget.value);
                        }
                      }}
                      className="w-full px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded"
                      autoFocus
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingMessage(null)}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700 dark:text-gray-300">{message.content}</p>
                )}

                {/* Reactions */}
                {message.reactions && message.reactions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {message.reactions.map((reaction, index) => (
                      <button
                        key={index}
                        onClick={() => handleReaction(message.id, reaction.emoji)}
                        className="flex items-center space-x-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <span>{reaction.emoji}</span>
                        <span className="text-gray-600 dark:text-gray-400">1</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Message Actions */}
              {message.authorId === currentUser.id && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                  <button
                    onClick={() => setEditingMessage(message.id)}
                    className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded"
                  >
                    <Edit3 className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteMessage(message.id)}
                    className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <button
            type="button"
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message ${currentChannel?.name || 'channel'}...`}
            className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
          />
          <button
            type="button"
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded"
          >
            <Smile className="h-4 w-4" />
          </button>
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed rounded"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;