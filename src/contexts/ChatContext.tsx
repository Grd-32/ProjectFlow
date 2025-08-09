import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  mentions?: string[];
  reactions?: Array<{
    emoji: string;
    userId: string;
    userName: string;
  }>;
  threadId?: string;
  isEdited?: boolean;
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
}

export interface DirectMessage {
  id: string;
  participants: string[];
  messages: ChatMessage[];
  lastActivity: string;
}

interface ChatContextType {
  channels: ChatChannel[];
  directMessages: DirectMessage[];
  messages: { [channelId: string]: ChatMessage[] };
  activeChannel: string | null;
  addChannel: (channel: Omit<ChatChannel, 'id' | 'createdAt' | 'lastActivity'>) => void;
  updateChannel: (id: string, updates: Partial<ChatChannel>) => void;
  deleteChannel: (id: string) => void;
  sendMessage: (channelId: string, content: string, type?: 'text' | 'file') => void;
  addReaction: (messageId: string, channelId: string, emoji: string) => void;
  editMessage: (messageId: string, channelId: string, newContent: string) => void;
  deleteMessage: (messageId: string, channelId: string) => void;
  setActiveChannel: (channelId: string) => void;
  createDirectMessage: (participantIds: string[]) => string;
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
  const [channels, setChannels] = useState<ChatChannel[]>([
    {
      id: 'general',
      name: 'General',
      description: 'General team discussions',
      type: 'general',
      members: ['1', '2', '3', '4', '5', '6'],
      isPrivate: false,
      createdAt: '2024-01-01T00:00:00Z',
      lastActivity: '2024-12-11T15:30:00Z'
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
      lastActivity: '2024-12-11T14:20:00Z'
    }
  ]);

  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);

  const [messages, setMessages] = useState<{ [channelId: string]: ChatMessage[] }>({
    'general': [
      {
        id: '1',
        content: 'Welcome to the team! 👋',
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
        content: 'Thanks! Excited to be here and contribute to the projects.',
        authorId: '2',
        authorName: 'Sarah Chen',
        authorInitials: 'SC',
        timestamp: '2024-12-11T09:15:00Z',
        type: 'text'
      }
    ],
    'project-1': [
      {
        id: '3',
        content: 'The hero section mockups are ready for review. @Mike Johnson please take a look.',
        authorId: '2',
        authorName: 'Sarah Chen',
        authorInitials: 'SC',
        timestamp: '2024-12-11T14:20:00Z',
        type: 'text',
        mentions: ['3']
      }
    ]
  });

  const [activeChannel, setActiveChannel] = useState<string | null>('general');

  const addChannel = (channelData: Omit<ChatChannel, 'id' | 'createdAt' | 'lastActivity'>) => {
    const newChannel: ChatChannel = {
      ...channelData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };
    setChannels(prev => [...prev, newChannel]);
    setMessages(prev => ({ ...prev, [newChannel.id]: [] }));
  };

  const updateChannel = (id: string, updates: Partial<ChatChannel>) => {
    setChannels(prev => prev.map(channel => 
      channel.id === id 
        ? { ...channel, ...updates, lastActivity: new Date().toISOString() }
        : channel
    ));
  };

  const deleteChannel = (id: string) => {
    setChannels(prev => prev.filter(channel => channel.id !== id));
    setMessages(prev => {
      const newMessages = { ...prev };
      delete newMessages[id];
      return newMessages;
    });
  };

  const sendMessage = (channelId: string, content: string, type: 'text' | 'file' = 'text') => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      authorId: '1', // Current user
      authorName: 'John Doe',
      authorInitials: 'JD',
      timestamp: new Date().toISOString(),
      type,
      mentions: content.match(/@(\w+)/g)?.map(m => m.substring(1)) || []
    };

    setMessages(prev => ({
      ...prev,
      [channelId]: [...(prev[channelId] || []), newMessage]
    }));

    // Update channel last activity
    setChannels(prev => prev.map(channel => 
      channel.id === channelId 
        ? { ...channel, lastActivity: new Date().toISOString() }
        : channel
    ));
  };

  const addReaction = (messageId: string, channelId: string, emoji: string) => {
    setMessages(prev => ({
      ...prev,
      [channelId]: prev[channelId]?.map(message => 
        message.id === messageId 
          ? {
              ...message,
              reactions: [
                ...(message.reactions || []),
                { emoji, userId: '1', userName: 'John Doe' }
              ]
            }
          : message
      ) || []
    }));
  };

  const editMessage = (messageId: string, channelId: string, newContent: string) => {
    setMessages(prev => ({
      ...prev,
      [channelId]: prev[channelId]?.map(message => 
        message.id === messageId 
          ? { ...message, content: newContent, isEdited: true }
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
        lastActivity: new Date().toISOString()
      };
      setDirectMessages(prev => [...prev, newDM]);
      setMessages(prev => ({ ...prev, [dmId]: [] }));
    }
    
    return dmId;
  };

  return (
    <ChatContext.Provider value={{
      channels,
      directMessages,
      messages,
      activeChannel,
      addChannel,
      updateChannel,
      deleteChannel,
      sendMessage,
      addReaction,
      editMessage,
      deleteMessage,
      setActiveChannel,
      createDirectMessage
    }}>
      {children}
    </ChatContext.Provider>
  );
};