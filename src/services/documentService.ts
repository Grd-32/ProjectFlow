import { supabase, isSupabaseConfigured } from '../lib/supabase';

type Document = {
  id: string;
  tenant_id: string | null;
  title: string;
  content: string;
  author_id: string;
  project_id: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
};

export const documentService = {
  async getAll() {
    if (!isSupabaseConfigured()) return { data: [], error: null };

    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        author:users!documents_author_id_fkey(id, name, email),
        project:projects(id, name)
      `)
      .order('updated_at', { ascending: false });

    return { data, error };
  },

  async getById(id: string) {
    if (!isSupabaseConfigured()) return { data: null, error: null };

    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        author:users!documents_author_id_fkey(id, name, email),
        project:projects(id, name)
      `)
      .eq('id', id)
      .maybeSingle();

    return { data, error };
  },

  async getByProject(projectId: string) {
    if (!isSupabaseConfigured()) return { data: [], error: null };

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('project_id', projectId)
      .order('updated_at', { ascending: false });

    return { data, error };
  },

  async create(document: Omit<Document, 'id' | 'created_at' | 'updated_at'>) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };

    const { data, error } = await supabase
      .from('documents')
      .insert(document)
      .select()
      .single();

    return { data, error };
  },

  async update(id: string, updates: Partial<Document>) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };

    const { data, error } = await supabase
      .from('documents')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  async delete(id: string) {
    if (!isSupabaseConfigured()) return { error: new Error('Supabase not configured') };

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    return { error };
  },

  subscribeToDocuments(callback: (payload: any) => void) {
    if (!isSupabaseConfigured()) return { unsubscribe: () => {} };

    const subscription = supabase
      .channel('documents_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'documents' },
        callback
      )
      .subscribe();

    return subscription;
  }
};
