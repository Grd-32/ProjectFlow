import { supabase } from '../lib/supabase';

export interface Automation {
  id: string;
  tenant_id?: string;
  name: string;
  description?: string;
  trigger_type: string;
  trigger_config?: any;
  action_type: string;
  action_config?: any;
  is_active: boolean;
  run_count: number;
  success_count: number;
  last_run?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export const automationService = {
  async getAll(tenantId: string) {
    const { data, error } = await supabase
      .from('automations')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('automations')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async create(automation: Omit<Automation, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('automations')
      .insert([{
        ...automation,
        run_count: 0,
        success_count: 0
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Automation>) {
    const { data, error } = await supabase
      .from('automations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('automations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async toggle(id: string, isActive: boolean) {
    return this.update(id, { is_active: isActive });
  },

  async executeAutomation(id: string) {
    const automation = await this.getById(id);
    if (!automation) throw new Error('Automation not found');

    const { data, error } = await supabase
      .from('automations')
      .update({
        run_count: (automation.run_count || 0) + 1,
        success_count: (automation.success_count || 0) + 1,
        last_run: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
