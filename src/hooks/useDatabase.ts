import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNotification } from '../contexts/NotificationContext';

export const useDatabase = () => {
  const { addNotification } = useNotification();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const { data, error } = await supabase.from('users').select('id').limit(1);
      if (error) throw error;
      setIsConnected(true);
      addNotification({
        type: 'success',
        title: 'Database Connected',
        message: 'Successfully connected to Supabase database',
        userId: '1',
        relatedEntity: {
          type: 'project',
          id: 'database',
          name: 'Database Connection'
        }
      });
    } catch (error) {
      setIsConnected(false);
      console.error('Database connection error:', error);
      addNotification({
        type: 'error',
        title: 'Database Connection Failed',
        message: 'Please check your Supabase configuration',
        userId: '1',
        relatedEntity: {
          type: 'project',
          id: 'database',
          name: 'Database Connection'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Users
  const getUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  };

  const createUser = async (userData: any) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          ...userData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      addNotification({
        type: 'success',
        title: 'User Created',
        message: `User "${userData.name}" has been created`,
        userId: '1',
        relatedEntity: {
          type: 'user',
          id: data.id,
          name: userData.name
        }
      });
      
      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      addNotification({
        type: 'error',
        title: 'User Creation Failed',
        message: 'Failed to create user',
        userId: '1',
        relatedEntity: {
          type: 'user',
          id: 'error',
          name: 'User Creation'
        }
      });
      return null;
    }
  };

  const updateUser = async (id: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      addNotification({
        type: 'success',
        title: 'User Updated',
        message: `User "${updates.name || 'profile'}" has been updated`,
        userId: '1',
        relatedEntity: {
          type: 'user',
          id: data.id,
          name: updates.name || 'User'
        }
      });
      
      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update user',
        userId: '1',
        relatedEntity: {
          type: 'user',
          id: id,
          name: 'User Update'
        }
      });
      return null;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      addNotification({
        type: 'warning',
        title: 'User Deleted',
        message: 'User has been deleted',
        userId: '1',
        relatedEntity: {
          type: 'user',
          id: id,
          name: 'Deleted User'
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      addNotification({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete user',
        userId: '1',
        relatedEntity: {
          type: 'user',
          id: id,
          name: 'User Deletion'
        }
      });
      return false;
    }
  };

  // Projects
  const getProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  };

  const createProject = async (projectData: any) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          ...projectData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      addNotification({
        type: 'success',
        title: 'Project Created',
        message: `Project "${projectData.name}" has been created`,
        userId: '1',
        relatedEntity: {
          type: 'project',
          id: data.id,
          name: projectData.name
        }
      });
      
      return data;
    } catch (error) {
      console.error('Error creating project:', error);
      addNotification({
        type: 'error',
        title: 'Project Creation Failed',
        message: 'Failed to create project',
        userId: '1',
        relatedEntity: {
          type: 'project',
          id: 'error',
          name: 'Project Creation'
        }
      });
      return null;
    }
  };

  // Tasks
  const getTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  };

  const createTask = async (taskData: any) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          ...taskData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      addNotification({
        type: 'success',
        title: 'Task Created',
        message: `Task "${taskData.name}" has been created`,
        userId: '1',
        relatedEntity: {
          type: 'task',
          id: data.id,
          name: taskData.name
        }
      });
      
      return data;
    } catch (error) {
      console.error('Error creating task:', error);
      addNotification({
        type: 'error',
        title: 'Task Creation Failed',
        message: 'Failed to create task',
        userId: '1',
        relatedEntity: {
          type: 'task',
          id: 'error',
          name: 'Task Creation'
        }
      });
      return null;
    }
  };

  // Notifications
  const createNotification = async (notificationData: any) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          ...notificationData,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  };

  // Time Tracking
  const createTimeEntry = async (timeData: any) => {
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .insert([{
          ...timeData,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating time entry:', error);
      return null;
    }
  };

  const getTimeEntries = async (userId?: string, taskId?: string) => {
    try {
      let query = supabase.from('time_entries').select('*');
      
      if (userId) query = query.eq('user_id', userId);
      if (taskId) query = query.eq('task_id', taskId);
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching time entries:', error);
      return [];
    }
  };

  return {
    isConnected,
    isLoading,
    checkConnection,
    // Users
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    // Projects
    getProjects,
    createProject,
    // Tasks
    getTasks,
    createTask,
    // Notifications
    createNotification,
    markNotificationAsRead,
    // Time Tracking
    createTimeEntry,
    getTimeEntries
  };
};