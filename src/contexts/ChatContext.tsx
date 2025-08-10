import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNotification } from './NotificationContext';

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
  
  const [channels, setChannels] = useState<ChatChannel[]>([
    {
      id: 'general',
      name: 'General',
      description: 'General team discussions',
      type: 'general',
      members: ['1', '2', '3', '4', '5', '6'],
      isPrivate: false,
      createdAt: '2024-01-01T00:00:00Z',
      lastActivity: '2024-12-11T15:30:00Z',
      unreadCount: 2
    },
    {
      id: 'project-1',
      name: 'Website Redesign',
      description: 'Discussions about the website redesign project',
      type: 'project',
      members: ['1', '2', '3'],
      isPrivate: false,
      projectId: '1',
      createdAt: '2024-11-01T00:00:00Z',
      lastActivity: '2024-12-11T14:20:00Z',
      unreadCount: 1
    },
    {
      id: 'project-2',
      name: 'Mobile App',
      description: 'Mobile app development discussions',
      type: 'project',
      members: ['1', '4', '5'],
      isPrivate: false,
      projectId: '2',
      createdAt: '2024-12-01T00:00:00Z',
      lastActivity: '2024-12-11T13:15:00Z',
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
        timestamp: '2024-12-11T09:00:00Z',
        type: 'text',
        reactions: [
          { emoji: '👍', userId: '2', userName: 'Sarah Chen' },
          { emoji: '🎉', userId: '3', userName: 'Mike Johnson' }
        ]
      },
      {
        id: '2',
        content: 'Thanks! Excited to be here and contribute to the projects. @Mike Johnson when can we sync on the new features?',
        authorId: '2',
        authorName: 'Sarah Chen',
        authorInitials: 'SC',
        timestamp: '2024-12-11T09:15:00Z',
        type: 'text',
        mentions: ['3']
      },
      {
        id: '3',
        content: 'Great to have you on board! Let\'s schedule a call for tomorrow morning.',
        authorId: '3',
        authorName: 'Mike Johnson',
        authorInitials: 'MJ',
        timestamp: '2024-12-11T15:30:00Z',
        type: 'text'
      }
    ],
    'project-1': [
      {
        id: '4',
        content: 'The hero section mockups are ready for review. @Mike Johnson please take a look when you have a chance.',
        authorId: '2',
        authorName: 'Sarah Chen',
        authorInitials: 'SC',
        timestamp: '2024-12-11T14:20:00Z',
        type: 'text',
        mentions: ['3']
      },
      {
        id: '5',
        content: 'Looks fantastic! I\'ve added some feedback in the design file. The color scheme really pops.',
        authorId: '3',
        authorName: 'Mike Johnson',
        authorInitials: 'MJ',
        timestamp: '2024-12-11T14:25:00Z',
        type: 'text'
      }
    ],
    'project-2': [
      {
        id: '6',
        content: 'Starting work on the mobile app wireframes. Should have initial designs by end of week.',
        authorId: '4',
        authorName: 'Alex Rodriguez',
        authorInitials: 'AR',
        timestamp: '2024-12-11T13:15:00Z',
        type: 'text'
      }
    ]
  });

  const [activeChannel, setActiveChannel] = useState<string | null>('general');
  const [onlineUsers, setOnlineUsers] = useState<string[]>(['1', '2', '3', '4']);
  const [typingUsers, setTypingUsers] = useState<{ [channelId: string]: string[] }>({});

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate users going online/offline
      setOnlineUsers(prev => {
        const allUsers = ['1', '2', '3', '4', '5', '6'];
        const onlineCount = Math.floor(Math.random() * 3) + 3; // 3-5 users online
        return allUsers.slice(0, onlineCount);
      });
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

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
      userId: '1',
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
        userId: '1',
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
      authorId: '1', // Current user
      authorName: 'John Doe',
      authorInitials: 'JD',
      timestamp: new Date().toISOString(),
      type,
      mentions: content.match(/@(\w+)/g)?.map(m => m.substring(1)) || [],
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

    // Update channel last activity and unread count for other users
    setChannels(prev => prev.map(channel => 
      channel.id === channelId 
        ? { 
            ...channel, 
            lastActivity: new Date().toISOString(),
            lastMessage: newMessage
          }
        : channel
    ));

    // Send notifications for mentions
    if (newMessage.mentions && newMessage.mentions.length > 0) {
      newMessage.mentions.forEach(mention => {
        addNotification({
          type: 'info',
          title: 'You were mentioned',
          message: `${newMessage.authorName} mentioned you in ${channels.find(c => c.id === channelId)?.name}`,
          userId: mention,
          relatedEntity: {
            type: 'project',
            id: channelId,
            name: channels.find(c => c.id === channelId)?.name || 'Chat'
          }
        });
      });
    }
  };

  const addReaction = (messageId: string, channelId: string, emoji: string) => {
    setMessages(prev => ({
      ...prev,
      [channelId]: prev[channelId]?.map(message => {
        if (message.id === messageId) {
          const existingReaction = message.reactions?.find(r => r.emoji === emoji && r.userId === '1');
          if (existingReaction) {
            // Remove reaction if already exists
            return {
              ...message,
              reactions: message.reactions?.filter(r => !(r.emoji === emoji && r.userId === '1'))
            };
          } else {
            // Add new reaction
            return {
              ...message,
              reactions: [
                ...(message.reactions || []),
                { emoji, userId: '1', userName: 'John Doe' }
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
        ? [...(prev[channelId] || []), '1'].filter((v, i, a) => a.indexOf(v) === i)
        : (prev[channelId] || []).filter(userId => userId !== '1')
    }));

    // Clear typing after 3 seconds
    if (isTyping) {
      setTimeout(() => {
        setTypingUsers(prev => ({
          ...prev,
          [channelId]: (prev[channelId] || []).filter(userId => userId !== '1')
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
      userId: '1',
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