import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not found. Using mock data mode.');
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null;

// Export types for easier usage
export type Tables = Database['public']['Tables'];
export type Enums = Database['public']['Enums'];

// Database service functions
export const dbService = {
  // Users
  async getUsers() {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }
    return data;
  },

  async createUser(userData: Tables['users']['Insert']) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('users')
      .insert([{
        ...userData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user:', error);
      return null;
    }
    return data;
  },

  async updateUser(id: string, updates: Tables['users']['Update']) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user:', error);
      return null;
    }
    return data;
  },

  // Projects
  async getProjects() {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
    return data;
  },

  async createProject(projectData: Tables['projects']['Insert']) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        ...projectData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating project:', error);
      return null;
    }
    return data;
  },

  // Tasks
  async getTasks() {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
    return data;
  },

  async createTask(taskData: Tables['tasks']['Insert']) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        ...taskData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating task:', error);
      return null;
    }
    return data;
  },

  // Time Entries
  async createTimeEntry(timeData: Tables['time_entries']['Insert']) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('time_entries')
      .insert([{
        ...timeData,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating time entry:', error);
      return null;
    }
    return data;
  },

  // Notifications
  async createNotification(notificationData: Tables['notifications']['Insert']) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        ...notificationData,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating notification:', error);
      return null;
    }
    return data;
  },

  // Chat
  async getChatChannels() {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('chat_channels')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching chat channels:', error);
      return [];
    }
    return data;
  },

  async getChatMessages(channelId: string) {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching chat messages:', error);
      return [];
    }
    return data;
  },

  async sendChatMessage(messageData: Tables['chat_messages']['Insert']) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([{
        ...messageData,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error sending chat message:', error);
      return null;
    }
    return data;
  }
};