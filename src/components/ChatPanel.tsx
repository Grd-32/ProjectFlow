import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useUser } from '../contexts/UserContext';
import { useNotification } from '../contexts/NotificationContext';
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
  Trash2,
  Download,
  Image,
  File,
  Video,
  Phone,
  Settings,
  Search,
  UserPlus,
  Volume2,
  VolumeX,
  Pin,
  Reply,
  Forward,
  Copy,
  Bookmark
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ isOpen, onClose }) => {
  const { 
    channels, 
    messages, 
    activeChannel, 
    onlineUsers,
    typingUsers,
    setActiveChannel, 
    sendMessage, 
    addReaction,
    editMessage,
    deleteMessage,
    markChannelAsRead,
    setTyping,
    uploadFile,
    addChannel
  } = useChat();
  const { users, currentUser } = useUser();
  const { addNotification } = useNotification();
  const [newMessage, setNewMessage] = useState('');
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [showChannelSettings, setShowChannelSettings] = useState(false);
  const [showNewChannelForm, setShowNewChannelForm] = useState(false);
  const [newChannelData, setNewChannelData] = useState({
    name: '',
    description: '',
    type: 'team' as const,
    isPrivate: false
  });
  const [isTyping, setIsTyping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMessageActions, setShowMessageActions] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChannel]);

  useEffect(() => {
    if (activeChannel) {
      markChannelAsRead(activeChannel);
    }
  }, [activeChannel, markChannelAsRead]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && activeChannel) {
      let messageContent = newMessage.trim();
      
      // Handle reply
      if (replyingTo) {
        const replyMessage = channelMessages.find(m => m.id === replyingTo);
        if (replyMessage) {
          messageContent = `@${replyMessage.authorName} ${messageContent}`;
        }
        setReplyingTo(null);
      }
      
      sendMessage(activeChannel, messageContent);
      setNewMessage('');
      setIsTyping(false);
      setTyping(activeChannel, false);
    }
  };

  const handleEditMessage = (messageId: string, newContent: string) => {
    if (activeChannel && newContent.trim()) {
      editMessage(messageId, activeChannel, newContent.trim());
      setEditingMessage(null);
      setEditContent('');
      
      addNotification({
        type: 'info',
        title: 'Message Edited',
        message: 'Your message has been updated',
        userId: currentUser.id,
        relatedEntity: {
          type: 'project',
          id: activeChannel,
          name: 'Chat Message'
        }
      });
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    if (activeChannel && window.confirm('Delete this message?')) {
      deleteMessage(messageId, activeChannel);
      
      addNotification({
        type: 'warning',
        title: 'Message Deleted',
        message: 'Message has been removed from the chat',
        userId: currentUser.id,
        relatedEntity: {
          type: 'project',
          id: activeChannel,
          name: 'Chat Message'
        }
      });
    }
  };

  const handleReaction = (messageId: string, emoji: string) => {
    if (activeChannel) {
      addReaction(messageId, activeChannel, emoji);
    }
    setShowEmojiPicker(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && activeChannel) {
      Array.from(files).forEach(file => {
        uploadFile(activeChannel, file);
      });
    }
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);
    if (activeChannel) {
      if (!isTyping && value.length > 0) {
        setIsTyping(true);
        setTyping(activeChannel, true);
      } else if (isTyping && value.length === 0) {
        setIsTyping(false);
        setTyping(activeChannel, false);
      }
    }
  };

  const handleCreateChannel = (e: React.FormEvent) => {
    e.preventDefault();
    addChannel({
      ...newChannelData,
      members: [currentUser.id]
    });
    setNewChannelData({
      name: '',
      description: '',
      type: 'team',
      isPrivate: false
    });
    setShowNewChannelForm(false);
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    addNotification({
      type: 'info',
      title: 'Message Copied',
      message: 'Message content copied to clipboard',
      userId: currentUser.id,
      relatedEntity: {
        type: 'project',
        id: 'clipboard',
        name: 'Copy Action'
      }
    });
  };

  const currentChannel = channels.find(c => c.id === activeChannel);
  const channelMessages = activeChannel ? messages[activeChannel] || [] : [];
  const currentTypingUsers = activeChannel ? typingUsers[activeChannel] || [] : [];

  // Filter messages based on search
  const filteredMessages = searchTerm 
    ? channelMessages.filter(msg => 
        msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.authorName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : channelMessages;

  const emojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '🚀', '👏', '🔥'];

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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
            <div className="flex items-center space-x-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {currentChannel?.members.length} members
              </p>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {onlineUsers.filter(userId => currentChannel?.members.includes(userId)).length} online
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded"
            title={isMuted ? 'Unmute notifications' : 'Mute notifications'}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Channel List */}
      <div className="p-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Channels</span>
          <button
            onClick={() => setShowNewChannelForm(true)}
            className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
        <div className="flex space-x-1 overflow-x-auto">
          {channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => setActiveChannel(channel.id)}
              className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition-colors relative ${
                activeChannel === channel.id
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {channel.name}
              {channel.unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {channel.unreadCount > 9 ? '9+' : channel.unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* New Channel Form */}
      {showNewChannelForm && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <form onSubmit={handleCreateChannel} className="space-y-3">
            <input
              type="text"
              placeholder="Channel name"
              value={newChannelData.name}
              onChange={(e) => setNewChannelData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              required
            />
            <div className="flex space-x-2">
              <button
                type="submit"
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowNewChannelForm(false)}
                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No messages found' : 'No messages yet'}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {searchTerm ? 'Try different search terms' : 'Start the conversation!'}
            </p>
          </div>
        ) : (
          filteredMessages.map((message) => (
            <div key={message.id} className="group relative">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 relative">
                  <span className="text-white text-xs font-medium">{message.authorInitials}</span>
                  {onlineUsers.includes(message.authorId) && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                  )}
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
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleEditMessage(message.id, editContent);
                          } else if (e.key === 'Escape') {
                            setEditingMessage(null);
                            setEditContent('');
                          }
                        }}
                        className="w-full px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded"
                        autoFocus
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditMessage(message.id, editContent)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingMessage(null);
                            setEditContent('');
                          }}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {message.type === 'file' ? (
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 max-w-xs">
                          <div className="flex items-center space-x-2">
                            <File className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {message.fileName}
                              </p>
                              {message.fileSize && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatFileSize(message.fileSize)}
                                </p>
                              )}
                            </div>
                            <button 
                              onClick={() => window.open(message.fileUrl, '_blank')}
                              className="p-1 text-gray-400 hover:text-blue-600 rounded"
                            >
                              <Download className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {message.content.split(' ').map((word, index) => {
                            if (word.startsWith('@')) {
                              return (
                                <span key={index} className="text-blue-600 dark:text-blue-400 font-medium">
                                  {word}{' '}
                                </span>
                              );
                            }
                            return word + ' ';
                          })}
                        </p>
                      )}
                    </>
                  )}

                  {/* Reactions */}
                  {message.reactions && message.reactions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {message.reactions.reduce((acc: any[], reaction) => {
                        const existing = acc.find(r => r.emoji === reaction.emoji);
                        if (existing) {
                          existing.count++;
                          existing.users.push(reaction.userName);
                        } else {
                          acc.push({
                            emoji: reaction.emoji,
                            count: 1,
                            users: [reaction.userName]
                          });
                        }
                        return acc;
                      }, []).map((reaction, index) => (
                        <button
                          key={index}
                          onClick={() => handleReaction(message.id, reaction.emoji)}
                          className="flex items-center space-x-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          title={reaction.users.join(', ')}
                        >
                          <span>{reaction.emoji}</span>
                          <span className="text-gray-600 dark:text-gray-400">{reaction.count}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Message Actions */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                  <button
                    onClick={() => setShowEmojiPicker(showEmojiPicker === message.id ? null : message.id)}
                    className="p-1 text-gray-400 dark:text-gray-500 hover:text-yellow-600 dark:hover:text-yellow-400 rounded"
                    title="Add reaction"
                  >
                    <Smile className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => setReplyingTo(message.id)}
                    className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded"
                    title="Reply"
                  >
                    <Reply className="h-3 w-3" />
                  </button>
                  {message.authorId === currentUser.id && (
                    <button
                      onClick={() => {
                        setEditingMessage(message.id);
                        setEditContent(message.content);
                      }}
                      className="p-1 text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 rounded"
                      title="Edit"
                    >
                      <Edit3 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Emoji Picker */}
              {showEmojiPicker === message.id && (
                <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 z-60">
                  <div className="grid grid-cols-5 gap-2">
                    {emojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(message.id, emoji)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-lg"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {/* Typing Indicator */}
        {currentTypingUsers.length > 0 && (
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span>
              {currentTypingUsers.length === 1 
                ? `${users.find(u => u.id === currentTypingUsers[0])?.name} is typing...`
                : `${currentTypingUsers.length} people are typing...`
              }
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded"
            title="Attach file"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => handleTyping(e.target.value)}
            placeholder={`Message ${currentChannel?.name || 'channel'}...`}
            className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed rounded"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Click outside handlers */}
      {(showEmojiPicker || showMessageActions) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowEmojiPicker(null);
            setShowMessageActions(null);
          }}
        />
      )}
    </div>
  );
};

export default ChatPanel;