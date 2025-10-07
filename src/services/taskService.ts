import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Task = Database['public']['Tables']['tasks']['Row'];
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

export const taskService = {
  async getAll() {
    if (!isSupabaseConfigured()) return { data: [], error: null };

    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:users!tasks_assignee_id_fkey(id, name, email, avatar),
        project:projects(id, name)
      `)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  async getById(id: string) {
    if (!isSupabaseConfigured()) return { data: null, error: null };

    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:users!tasks_assignee_id_fkey(id, name, email, avatar),
        project:projects(id, name)
      `)
      .eq('id', id)
      .maybeSingle();

    return { data, error };
  },

  async getByProject(projectId: string) {
    if (!isSupabaseConfigured()) return { data: [], error: null };

    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:users!tasks_assignee_id_fkey(id, name, email, avatar),
        project:projects(id, name)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  async getByAssignee(assigneeId: string) {
    if (!isSupabaseConfigured()) return { data: [], error: null };

    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:users!tasks_assignee_id_fkey(id, name, email, avatar),
        project:projects(id, name)
      `)
      .eq('assignee_id', assigneeId)
      .order('due_date', { ascending: true });

    return { data, error };
  },

  async create(task: TaskInsert) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };

    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select(`
        *,
        assignee:users!tasks_assignee_id_fkey(id, name, email, avatar),
        project:projects(id, name)
      `)
      .single();

    return { data, error };
  },

  async update(id: string, updates: TaskUpdate) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };

    const { data, error } = await supabase
      .from('tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`
        *,
        assignee:users!tasks_assignee_id_fkey(id, name, email, avatar),
        project:projects(id, name)
      `)
      .single();

    return { data, error };
  },

  async delete(id: string) {
    if (!isSupabaseConfigured()) return { error: new Error('Supabase not configured') };

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    return { error };
  },

  async getComments(taskId: string) {
    if (!isSupabaseConfigured()) return { data: [], error: null };

    const { data, error } = await supabase
      .from('task_comments')
      .select(`
        *,
        user:users(id, name, email, avatar)
      `)
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    return { data, error };
  },

  async addComment(taskId: string, userId: string, content: string) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };

    const { data, error } = await supabase
      .from('task_comments')
      .insert({ task_id: taskId, user_id: userId, content })
      .select(`
        *,
        user:users(id, name, email, avatar)
      `)
      .single();

    return { data, error };
  },

  async getAttachments(taskId: string) {
    if (!isSupabaseConfigured()) return { data: [], error: null };

    const { data, error } = await supabase
      .from('task_attachments')
      .select(`
        *,
        uploaded_by_user:users(id, name, email)
      `)
      .eq('task_id', taskId)
      .order('uploaded_at', { ascending: false });

    return { data, error };
  },

  async addAttachment(attachment: {
    task_id: string;
    name: string;
    size: number;
    type: string;
    url: string;
    uploaded_by: string;
  }) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };

    const { data, error } = await supabase
      .from('task_attachments')
      .insert(attachment)
      .select()
      .single();

    return { data, error };
  },

  async deleteAttachment(id: string) {
    if (!isSupabaseConfigured()) return { error: new Error('Supabase not configured') };

    const { error } = await supabase
      .from('task_attachments')
      .delete()
      .eq('id', id);

    return { error };
  },

  async getSubtasks(taskId: string) {
    if (!isSupabaseConfigured()) return { data: [], error: null };

    const { data, error } = await supabase
      .from('subtasks')
      .select('*')
      .eq('task_id', taskId)
      .order('order_index', { ascending: true });

    return { data, error };
  },

  async createSubtask(subtask: {
    task_id: string;
    name: string;
    completed: boolean;
    order_index: number;
  }) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };

    const { data, error } = await supabase
      .from('subtasks')
      .insert(subtask)
      .select()
      .single();

    return { data, error };
  },

  async updateSubtask(id: string, updates: { name?: string; completed?: boolean }) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };

    const { data, error } = await supabase
      .from('subtasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  async deleteSubtask(id: string) {
    if (!isSupabaseConfigured()) return { error: new Error('Supabase not configured') };

    const { error } = await supabase
      .from('subtasks')
      .delete()
      .eq('id', id);

    return { error };
  },

  subscribeTo Tasks(callback: (payload: any) => void) {
    if (!isSupabaseConfigured()) return { unsubscribe: () => {} };

    const subscription = supabase
      .channel('tasks_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        callback
      )
      .subscribe();

    return subscription;
  },

  subscribeToProjectTasks(projectId: string, callback: (payload: any) => void) {
    if (!isSupabaseConfigured()) return { unsubscribe: () => {} };

    const subscription = supabase
      .channel(`tasks_${projectId}`)
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `project_id=eq.${projectId}`
        },
        callback
      )
      .subscribe();

    return subscription;
  }
};
