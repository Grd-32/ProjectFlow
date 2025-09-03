import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNotification } from './NotificationContext';
import { useUser } from './UserContext';

export interface ChatMessage {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  timestamp: string;
  type: 'text' | 'file' | 'system';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mentions?: string[];
  reactions?: Array<{
    emoji: string;
    userId: string;
    userName: string;
  }>;
  threadId?: string;
  isEdited?: boolean;
  editedAt?: string;
  replyTo?: string;
}

export interface ChatChannel {
  id: string;
  name: string;
  description: string;
  type: 'project' | 'team' | 'direct' | 'general';
  members: string[];
  isPrivate: boolean;
  projectId?: string;
  createdAt: string;
  lastActivity: string;
  unreadCount: number;
  lastMessage?: ChatMessage;
}

export interface DirectMessage {
  id: string;
  participants: string[];
  messages: ChatMessage[];
  lastActivity: string;
  unreadCount: number;
}

interface ChatContextType {
  channels: ChatChannel[];
  directMessages: DirectMessage[];
  messages: { [channelId: string]: ChatMessage[] };
  activeChannel: string | null;
  onlineUsers: string[];
  typingUsers: { [channelId: string]: string[] };
  addChannel: (channel: Omit<ChatChannel, 'id' | 'createdAt' | 'lastActivity' | 'unreadCount'>) => void;
  updateChannel: (id: string, updates: Partial<ChatChannel>) => void;
  deleteChannel: (id: string) => void;
  sendMessage: (channelId: string, content: string, type?: 'text' | 'file', fileData?: any) => void;
  addReaction: (messageId: string, channelId: string, emoji: string) => void;
  editMessage: (messageId: string, channelId: string, newContent: string) => void;
  deleteMessage: (messageId: string, channelId: string) => void;
  setActiveChannel: (channelId: string) => void;
  createDirectMessage: (participantIds: string[]) => string;
  markChannelAsRead: (channelId: string) => void;
  setTyping: (channelId: string, isTyping: boolean) => void;
  uploadFile: (channelId: string, file: File) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { addNotification } = useNotification();
  const { currentUser, users } = useUser();
  
  const [channels, setChannels] = useState<ChatChannel[]>([
    {
      id: 'general',
      name: 'General',
      description: 'General team discussions',
      type: 'general',
      members: ['1', '2', '3', '4', '5', '6'],
      isPrivate: false,
      createdAt: '2024-01-01T00:00:00Z',
      lastActivity: new Date().toISOString(),
      unreadCount: 0
    },
    {
      id: 'project-1',
      name: 'Website Redesign',
      description: 'Discussions about the website redesign project',
      type: 'project',
      members: ['1', '2', '3', '4'],
      isPrivate: false,
      projectId: '1',
      createdAt: '2024-11-01T00:00:00Z',
      lastActivity: new Date().toISOString(),
      unreadCount: 0
    },
    {
      id: 'project-2',
      name: 'Mobile App',
      description: 'Mobile app development discussions',
      type: 'project',
      members: ['1', '2', '6'],
      isPrivate: false,
      projectId: '2',
      createdAt: '2024-12-01T00:00:00Z',
      lastActivity: new Date().toISOString(),
      unreadCount: 0
    }
  ]);

  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);

  const [messages, setMessages] = useState<{ [channelId: string]: ChatMessage[] }>({
    'general': [
      {
        id: '1',
        content: 'Welcome to the team! 👋 Looking forward to working with everyone.',
        authorId: '1',
        authorName: 'John Doe',
        authorInitials: 'JD',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        type: 'text'
      }
    ],
    'project-1': [
      {
        id: '2',
        content: 'The hero section mockups are ready for review. @Mike Johnson please take a look when you have a chance.',
        authorId: '2',
        authorName: 'Sarah Chen',
        authorInitials: 'SC',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        type: 'text',
        mentions: ['3']
      }
    ],
    'project-2': []
  });

  const [activeChannel, setActiveChannel] = useState<string | null>('general');
  const [onlineUsers, setOnlineUsers] = useState<string[]>(['1', '2', '3', '4']);
  const [typingUsers, setTypingUsers] = useState<{ [channelId: string]: string[] }>({});

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate users going online/offline
      setOnlineUsers(prev => {
        const allUsers = users.map(u => u.id);
        const onlineCount = Math.floor(Math.random() * 3) + Math.max(3, allUsers.length - 2);
        return allUsers.slice(0, onlineCount);
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [users]);

  const addChannel = (channelData: Omit<ChatChannel, 'id' | 'createdAt' | 'lastActivity' | 'unreadCount'>) => {
    const newChannel: ChatChannel = {
      ...channelData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      unreadCount: 0
    };
    setChannels(prev => [...prev, newChannel]);
    setMessages(prev => ({ ...prev, [newChannel.id]: [] }));

    addNotification({
      type: 'info',
      title: 'New Channel Created',
      message: `Channel "${newChannel.name}" has been created`,
      userId: currentUser.id,
      relatedEntity: {
        type: 'project',
        id: newChannel.id,
        name: newChannel.name
      }
    });
  };

  const updateChannel = (id: string, updates: Partial<ChatChannel>) => {
    setChannels(prev => prev.map(channel => 
      channel.id === id 
        ? { ...channel, ...updates, lastActivity: new Date().toISOString() }
        : channel
    ));
  };

  const deleteChannel = (id: string) => {
    const channel = channels.find(c => c.id === id);
    setChannels(prev => prev.filter(channel => channel.id !== id));
    setMessages(prev => {
      const newMessages = { ...prev };
      delete newMessages[id];
      return newMessages;
    });

    if (channel) {
      addNotification({
        type: 'warning',
        title: 'Channel Deleted',
        message: `Channel "${channel.name}" has been deleted`,
        userId: currentUser.id,
        relatedEntity: {
          type: 'project',
          id: channel.id,
          name: channel.name
        }
      });
    }
  };

  const sendMessage = (channelId: string, content: string, type: 'text' | 'file' = 'text', fileData?: any) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorInitials: currentUser.initials,
      timestamp: new Date().toISOString(),
      type,
      mentions: content.match(/@(\w+\s+\w+)/g)?.map(m => {
        const mentionedUser = users.find(u => u.name === m.substring(1));
        return mentionedUser?.id || '';
      }).filter(id => id) || [],
      ...(fileData && {
        fileUrl: fileData.url,
        fileName: fileData.name,
        fileSize: fileData.size
      })
    };

    setMessages(prev => ({
      ...prev,
      [channelId]: [...(prev[channelId] || []), newMessage]
    }));

    // Update channel last activity
    setChannels(prev => prev.map(channel => 
      channel.id === channelId 
        ? { 
            ...channel, 
            lastActivity: new Date().toISOString(),
            lastMessage: newMessage,
            unreadCount: channel.members.filter(m => m !== currentUser.id).length
          }
        : channel
    ));

    // Send notifications for mentions
    if (newMessage.mentions && newMessage.mentions.length > 0) {
      const channel = channels.find(c => c.id === channelId);
      newMessage.mentions.forEach(mentionedUserId => {
        const mentionedUser = users.find(u => u.id === mentionedUserId);
        if (mentionedUser) {
          addNotification({
            type: 'info',
            title: 'You were mentioned',
            message: `${newMessage.authorName} mentioned you in ${channel?.name}`,
            userId: mentionedUserId,
            relatedEntity: {
              type: 'project',
              id: channelId,
              name: channel?.name || 'Chat'
            }
          });
        }
      });
    }
  };

  const addReaction = (messageId: string, channelId: string, emoji: string) => {
    setMessages(prev => ({
      ...prev,
      [channelId]: prev[channelId]?.map(message => {
        if (message.id === messageId) {
          const existingReaction = message.reactions?.find(r => r.emoji === emoji && r.userId === currentUser.id);
          if (existingReaction) {
            return {
              ...message,
              reactions: message.reactions?.filter(r => !(r.emoji === emoji && r.userId === currentUser.id))
            };
          } else {
            return {
              ...message,
              reactions: [
                ...(message.reactions || []),
                { emoji, userId: currentUser.id, userName: currentUser.name }
              ]
            };
          }
        }
        return message;
      }) || []
    }));
  };

  const editMessage = (messageId: string, channelId: string, newContent: string) => {
    setMessages(prev => ({
      ...prev,
      [channelId]: prev[channelId]?.map(message => 
        message.id === messageId 
          ? { 
              ...message, 
              content: newContent, 
              isEdited: true,
              editedAt: new Date().toISOString()
            }
          : message
      ) || []
    }));
  };

  const deleteMessage = (messageId: string, channelId: string) => {
    setMessages(prev => ({
      ...prev,
      [channelId]: prev[channelId]?.filter(message => message.id !== messageId) || []
    }));
  };

  const createDirectMessage = (participantIds: string[]): string => {
    const dmId = `dm-${participantIds.sort().join('-')}`;
    const existingDM = directMessages.find(dm => dm.id === dmId);
    
    if (!existingDM) {
      const newDM: DirectMessage = {
        id: dmId,
        participants: participantIds,
        messages: [],
        lastActivity: new Date().toISOString(),
        unreadCount: 0
      };
      setDirectMessages(prev => [...prev, newDM]);
      setMessages(prev => ({ ...prev, [dmId]: [] }));
    }
    
    return dmId;
  };

  const markChannelAsRead = (channelId: string) => {
    setChannels(prev => prev.map(channel => 
      channel.id === channelId 
        ? { ...channel, unreadCount: 0 }
        : channel
    ));
  };

  const setTyping = (channelId: string, isTyping: boolean) => {
    setTypingUsers(prev => ({
      ...prev,
      [channelId]: isTyping 
        ? [...(prev[channelId] || []), currentUser.id].filter((v, i, a) => a.indexOf(v) === i)
        : (prev[channelId] || []).filter(userId => userId !== currentUser.id)
    }));

    if (isTyping) {
      setTimeout(() => {
        setTypingUsers(prev => ({
          ...prev,
          [channelId]: (prev[channelId] || []).filter(userId => userId !== currentUser.id)
        }));
      }, 3000);
    }
  };

  const uploadFile = (channelId: string, file: File) => {
    const fileUrl = URL.createObjectURL(file);
    sendMessage(channelId, `Uploaded file: ${file.name}`, 'file', {
      url: fileUrl,
      name: file.name,
      size: file.size
    });

    addNotification({
      type: 'info',
      title: 'File Uploaded',
      message: `File "${file.name}" uploaded to ${channels.find(c => c.id === channelId)?.name}`,
      userId: currentUser.id,
      relatedEntity: {
        type: 'project',
        id: channelId,
        name: file.name
      }
    });
  };

  return (
    <ChatContext.Provider value={{
      channels,
      directMessages,
      messages,
      activeChannel,
      onlineUsers,
      typingUsers,
      addChannel,
      updateChannel,
      deleteChannel,
      sendMessage,
      addReaction,
      editMessage,
      deleteMessage,
      setActiveChannel,
      createDirectMessage,
      markChannelAsRead,
      setTyping,
      uploadFile
    }}>
      {children}
    </ChatContext.Provider>
  );
};