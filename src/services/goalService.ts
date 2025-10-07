import { supabase, isSupabaseConfigured } from '../lib/supabase';

type Goal = {
  id: string;
  tenant_id: string | null;
  title: string;
  description: string | null;
  progress: number;
  target: number;
  due_date: string;
  status: string;
  category: string;
  project_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export const goalService = {
  async getAll() {
    if (!isSupabaseConfigured()) return { data: [], error: null };

    const { data, error } = await supabase
      .from('goals')
      .select(`
        *,
        project:projects(id, name),
        created_by_user:users(id, name, email)
      `)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  async getById(id: string) {
    if (!isSupabaseConfigured()) return { data: null, error: null };

    const { data, error } = await supabase
      .from('goals')
      .select(`
        *,
        project:projects(id, name),
        created_by_user:users(id, name, email)
      `)
      .eq('id', id)
      .maybeSingle();

    return { data, error };
  },

  async getByProject(projectId: string) {
    if (!isSupabaseConfigured()) return { data: [], error: null };

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('project_id', projectId)
      .order('due_date', { ascending: true });

    return { data, error };
  },

  async create(goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };

    const { data, error } = await supabase
      .from('goals')
      .insert(goal)
      .select()
      .single();

    return { data, error };
  },

  async update(id: string, updates: Partial<Goal>) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };

    const { data, error } = await supabase
      .from('goals')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  async delete(id: string) {
    if (!isSupabaseConfigured()) return { error: new Error('Supabase not configured') };

    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);

    return { error };
  },

  subscribeToGoals(callback: (payload: any) => void) {
    if (!isSupabaseConfigured()) return { unsubscribe: () => {} };

    const subscription = supabase
      .channel('goals_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'goals' },
        callback
      )
      .subscribe();

    return subscription;
  }
};
