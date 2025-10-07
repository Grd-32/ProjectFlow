import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

export const userService = {
  async getAll() {
    if (!isSupabaseConfigured()) return { data: [], error: null };

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    return { data, error };
  },

  async getById(id: string) {
    if (!isSupabaseConfigured()) return { data: null, error: null };

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    return { data, error };
  },

  async create(user: UserInsert) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };

    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();

    return { data, error };
  },

  async update(id: string, updates: UserUpdate) {
    if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase not configured') };

    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  async delete(id: string) {
    if (!isSupabaseConfigured()) return { error: new Error('Supabase not configured') };

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    return { error };
  },

  subscribeToUsers(callback: (payload: any) => void) {
    if (!isSupabaseConfigured()) return { unsubscribe: () => {} };

    const subscription = supabase
      .channel('users_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        callback
      )
      .subscribe();

    return subscription;
  }
};
