// import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// if (!supabaseUrl || !supabaseAnonKey) {
//   throw new Error('Missing Supabase environment variables. Please set up Supabase connection.');
// }

// export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// // Database types
// export interface Database {
//   public: {
//     Tables: {
//       users: {
//         Row: {
//           id: string;
//           name: string;
//           email: string;
//           avatar: string | null;
//           role: 'Admin' | 'Manager' | 'Member' | 'Viewer';
//           department: string;
//           status: 'Active' | 'Inactive';
//           created_at: string;
//           updated_at: string;
//           last_login: string;
//         };
//         Insert: {
//           id?: string;
//           name: string;
//           email: string;
//           avatar?: string | null;
//           role?: 'Admin' | 'Manager' | 'Member' | 'Viewer';
//           department?: string;
//           status?: 'Active' | 'Inactive';
//           created_at?: string;
//           updated_at?: string;
//           last_login?: string;
//         };
//         Update: {
//           id?: string;
//           name?: string;
//           email?: string;
//           avatar?: string | null;
//           role?: 'Admin' | 'Manager' | 'Member' | 'Viewer';
//           department?: string;
//           status?: 'Active' | 'Inactive';
//           updated_at?: string;
//           last_login?: string;
//         };
//       };
//       projects: {
//         Row: {
//           id: string;
//           name: string;
//           description: string;
//           status: 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled';
//           priority: 'Low' | 'Medium' | 'High' | 'Critical';
//           start_date: string;
//           end_date: string;
//           budget: number;
//           spent: number;
//           progress: number;
//           manager_id: string;
//           team_members: string[];
//           created_at: string;
//           updated_at: string;
//           is_publicly_shared: boolean;
//           share_settings: any;
//         };
//         Insert: {
//           id?: string;
//           name: string;
//           description?: string;
//           status?: 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled';
//           priority?: 'Low' | 'Medium' | 'High' | 'Critical';
//           start_date?: string;
//           end_date?: string;
//           budget?: number;
//           spent?: number;
//           progress?: number;
//           manager_id?: string;
//           team_members?: string[];
//           created_at?: string;
//           updated_at?: string;
//           is_publicly_shared?: boolean;
//           share_settings?: any;
//         };
//         Update: {
//           name?: string;
//           description?: string;
//           status?: 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled';
//           priority?: 'Low' | 'Medium' | 'High' | 'Critical';
//           start_date?: string;
//           end_date?: string;
//           budget?: number;
//           spent?: number;
//           progress?: number;
//           manager_id?: string;
//           team_members?: string[];
//           updated_at?: string;
//           is_publicly_shared?: boolean;
//           share_settings?: any;
//         };
//       };
//       tasks: {
//         Row: {
//           id: string;
//           name: string;
//           description: string | null;
//           status: 'Pending' | 'In progress' | 'Complete' | 'Blocked';
//           priority: 'Low' | 'Medium' | 'High';
//           assignee_id: string;
//           project_id: string;
//           due_date: string;
//           estimated_hours: number;
//           tags: string[];
//           dependencies: string[];
//           created_at: string;
//           updated_at: string;
//         };
//         Insert: {
//           id?: string;
//           name: string;
//           description?: string | null;
//           status?: 'Pending' | 'In progress' | 'Complete' | 'Blocked';
//           priority?: 'Low' | 'Medium' | 'High';
//           assignee_id?: string;
//           project_id?: string;
//           due_date?: string;
//           estimated_hours?: number;
//           tags?: string[];
//           dependencies?: string[];
//           created_at?: string;
//           updated_at?: string;
//         };
//         Update: {
//           name?: string;
//           description?: string | null;
//           status?: 'Pending' | 'In progress' | 'Complete' | 'Blocked';
//           priority?: 'Low' | 'Medium' | 'High';
//           assignee_id?: string;
//           project_id?: string;
//           due_date?: string;
//           estimated_hours?: number;
//           tags?: string[];
//           dependencies?: string[];
//           updated_at?: string;
//         };
//       };
//       notifications: {
//         Row: {
//           id: string;
//           type: 'info' | 'success' | 'warning' | 'error';
//           title: string;
//           message: string;
//           user_id: string;
//           read: boolean;
//           related_entity_type: string | null;
//           related_entity_id: string | null;
//           related_entity_name: string | null;
//           action_url: string | null;
//           created_at: string;
//         };
//         Insert: {
//           id?: string;
//           type: 'info' | 'success' | 'warning' | 'error';
//           title: string;
//           message: string;
//           user_id: string;
//           read?: boolean;
//           related_entity_type?: string | null;
//           related_entity_id?: string | null;
//           related_entity_name?: string | null;
//           action_url?: string | null;
//           created_at?: string;
//         };
//         Update: {
//           read?: boolean;
//         };
//       };
//       time_entries: {
//         Row: {
//           id: string;
//           task_id: string;
//           user_id: string;
//           start_time: string;
//           end_time: string | null;
//           duration: number;
//           description: string;
//           billable: boolean;
//           hourly_rate: number | null;
//           status: 'running' | 'stopped' | 'approved' | 'rejected';
//           created_at: string;
//         };
//         Insert: {
//           id?: string;
//           task_id: string;
//           user_id: string;
//           start_time: string;
//           end_time?: string | null;
//           duration?: number;
//           description?: string;
//           billable?: boolean;
//           hourly_rate?: number | null;
//           status?: 'running' | 'stopped' | 'approved' | 'rejected';
//           created_at?: string;
//         };
//         Update: {
//           end_time?: string | null;
//           duration?: number;
//           description?: string;
//           billable?: boolean;
//           hourly_rate?: number | null;
//           status?: 'running' | 'stopped' | 'approved' | 'rejected';
//         };
//       };
//     };
//   };
// }

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set up Supabase connection.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Optional: Export types for easier usage
export type Tables = Database['public']['Tables'];
export type Enums = Database['public']['Enums'];