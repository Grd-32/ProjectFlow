import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Project = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

type Milestone = {
  id: string;
  name: string;
  description: string | null;
  due_date: string;
  status: string;
  project_id: string;
  dependencies: string[];
  created_at: string;
};

type Risk = {
  id: string;
  title: string;
  description: string | null;
  probability: string;
  impact: string;
  status: string;
  owner_id: string | null;
  mitigation: string | null;
  project_id: string;
  created_at: string;
};

type ChangeRequest = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  requested_by_id: string;
  impact: string | null;
  cost: number;
  time_impact: number;
  project_id: string;
  created_at: string;
};

export const projectService = {
  async getAll() {
    if (!isSupabaseConfigured()) return { data: [], error: null };

    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        manager:users!projects_manager_id_fkey(id, name, email, avatar)
      `)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  async getById(id: string) {
    if (!isSupabaseConfigured()) return { data: null, error: null };

    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        manager:users!projects_manager_id_fkey(id, name, email, avatar)
      `)
      .eq('id', id)
      .maybeSingle();

    return { data, error };
  },

  async create(project: ProjectInsert) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };

    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select(`
        *,
        manager:users!projects_manager_id_fkey(id, name, email, avatar)
      `)
      .single();

    return { data, error };
  },

  async update(id: string, updates: ProjectUpdate) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };

    const { data, error } = await supabase
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`
        *,
        manager:users!projects_manager_id_fkey(id, name, email, avatar)
      `)
      .single();

    return { data, error };
  },

  async delete(id: string) {
    if (!isSupabaseConfigured()) return { error: new Error('Supabase not configured') };

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    return { error };
  },

  async getMilestones(projectId: string) {
    if (!isSupabaseConfigured()) return { data: [], error: null };

    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('project_id', projectId)
      .order('due_date', { ascending: true });

    return { data, error };
  },

  async createMilestone(milestone: Omit<Milestone, 'id' | 'created_at'>) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };

    const { data, error } = await supabase
      .from('milestones')
      .insert(milestone)
      .select()
      .single();

    return { data, error };
  },

  async updateMilestone(id: string, updates: Partial<Milestone>) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };

    const { data, error } = await supabase
      .from('milestones')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  async deleteMilestone(id: string) {
    if (!isSupabaseConfigured()) return { error: new Error('Supabase not configured') };

    const { error } = await supabase
      .from('milestones')
      .delete()
      .eq('id', id);

    return { error };
  },

  async getRisks(projectId: string) {
    if (!isSupabaseConfigured()) return { data: [], error: null };

    const { data, error } = await supabase
      .from('risks')
      .select(`
        *,
        owner:users(id, name, email)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  async createRisk(risk: Omit<Risk, 'id' | 'created_at'>) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };

    const { data, error } = await supabase
      .from('risks')
      .insert(risk)
      .select()
      .single();

    return { data, error };
  },

  async updateRisk(id: string, updates: Partial<Risk>) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };

    const { data, error } = await supabase
      .from('risks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  async deleteRisk(id: string) {
    if (!isSupabaseConfigured()) return { error: new Error('Supabase not configured') };

    const { error } = await supabase
      .from('risks')
      .delete()
      .eq('id', id);

    return { error };
  },

  async getChangeRequests(projectId: string) {
    if (!isSupabaseConfigured()) return { data: [], error: null };

    const { data, error } = await supabase
      .from('change_requests')
      .select(`
        *,
        requested_by:users(id, name, email)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  async createChangeRequest(changeRequest: Omit<ChangeRequest, 'id' | 'created_at'>) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };

    const { data, error } = await supabase
      .from('change_requests')
      .insert(changeRequest)
      .select()
      .single();

    return { data, error };
  },

  async updateChangeRequest(id: string, updates: Partial<ChangeRequest>) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };

    const { data, error } = await supabase
      .from('change_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  async deleteChangeRequest(id: string) {
    if (!isSupabaseConfigured()) return { error: new Error('Supabase not configured') };

    const { error } = await supabase
      .from('change_requests')
      .delete()
      .eq('id', id);

    return { error };
  },

  subscribeToProjects(callback: (payload: any) => void) {
    if (!isSupabaseConfigured()) return { unsubscribe: () => {} };

    const subscription = supabase
      .channel('projects_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        callback
      )
      .subscribe();

    return subscription;
  },

  subscribeToMilestones(projectId: string, callback: (payload: any) => void) {
    if (!isSupabaseConfigured()) return { unsubscribe: () => {} };

    const subscription = supabase
      .channel(`milestones_${projectId}`)
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'milestones',
          filter: `project_id=eq.${projectId}`
        },
        callback
      )
      .subscribe();

    return subscription;
  }
};
