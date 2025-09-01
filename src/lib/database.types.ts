export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          avatar: string | null;
          role: 'Admin' | 'Manager' | 'Member' | 'Viewer';
          department: string;
          status: 'Active' | 'Inactive';
          created_at: string;
          updated_at: string;
          last_login: string;
          phone: string | null;
          location: string | null;
          bio: string | null;
          timezone: string;
          language: string;
          theme: string;
          notifications_enabled: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          avatar?: string | null;
          role?: 'Admin' | 'Manager' | 'Member' | 'Viewer';
          department?: string;
          status?: 'Active' | 'Inactive';
          created_at?: string;
          updated_at?: string;
          last_login?: string;
          phone?: string | null;
          location?: string | null;
          bio?: string | null;
          timezone?: string;
          language?: string;
          theme?: string;
          notifications_enabled?: boolean;
        };
        Update: {
          name?: string;
          email?: string;
          avatar?: string | null;
          role?: 'Admin' | 'Manager' | 'Member' | 'Viewer';
          department?: string;
          status?: 'Active' | 'Inactive';
          updated_at?: string;
          last_login?: string;
          phone?: string | null;
          location?: string | null;
          bio?: string | null;
          timezone?: string;
          language?: string;
          theme?: string;
          notifications_enabled?: boolean;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          description: string;
          status: 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled';
          priority: 'Low' | 'Medium' | 'High' | 'Critical';
          start_date: string;
          end_date: string;
          budget: number;
          spent: number;
          progress: number;
          manager_id: string;
          team_members: string[];
          created_at: string;
          updated_at: string;
          is_publicly_shared: boolean;
          share_settings: any;
          workspace_id: string;
          template_id: string | null;
          custom_fields: any;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          status?: 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled';
          priority?: 'Low' | 'Medium' | 'High' | 'Critical';
          start_date?: string;
          end_date?: string;
          budget?: number;
          spent?: number;
          progress?: number;
          manager_id?: string;
          team_members?: string[];
          created_at?: string;
          updated_at?: string;
          is_publicly_shared?: boolean;
          share_settings?: any;
          workspace_id?: string;
          template_id?: string | null;
          custom_fields?: any;
        };
        Update: {
          name?: string;
          description?: string;
          status?: 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled';
          priority?: 'Low' | 'Medium' | 'High' | 'Critical';
          start_date?: string;
          end_date?: string;
          budget?: number;
          spent?: number;
          progress?: number;
          manager_id?: string;
          team_members?: string[];
          updated_at?: string;
          is_publicly_shared?: boolean;
          share_settings?: any;
          workspace_id?: string;
          template_id?: string | null;
          custom_fields?: any;
        };
      };
      tasks: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          status: 'Pending' | 'In progress' | 'Complete' | 'Blocked';
          priority: 'Low' | 'Medium' | 'High';
          assignee_id: string;
          project_id: string;
          due_date: string;
          estimated_hours: number;
          actual_hours: number;
          tags: string[];
          dependencies: string[];
          created_at: string;
          updated_at: string;
          parent_task_id: string | null;
          is_recurring: boolean;
          recurrence_pattern: any;
          custom_fields: any;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          status?: 'Pending' | 'In progress' | 'Complete' | 'Blocked';
          priority?: 'Low' | 'Medium' | 'High';
          assignee_id?: string;
          project_id?: string;
          due_date?: string;
          estimated_hours?: number;
          actual_hours?: number;
          tags?: string[];
          dependencies?: string[];
          created_at?: string;
          updated_at?: string;
          parent_task_id?: string | null;
          is_recurring?: boolean;
          recurrence_pattern?: any;
          custom_fields?: any;
        };
        Update: {
          name?: string;
          description?: string | null;
          status?: 'Pending' | 'In progress' | 'Complete' | 'Blocked';
          priority?: 'Low' | 'Medium' | 'High';
          assignee_id?: string;
          project_id?: string;
          due_date?: string;
          estimated_hours?: number;
          actual_hours?: number;
          tags?: string[];
          dependencies?: string[];
          updated_at?: string;
          parent_task_id?: string | null;
          is_recurring?: boolean;
          recurrence_pattern?: any;
          custom_fields?: any;
        };
      };
      workspaces: {
        Row: {
          id: string;
          name: string;
          description: string;
          color: string;
          icon: string;
          settings: any;
          created_at: string;
          updated_at: string;
          owner_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          color?: string;
          icon?: string;
          settings?: any;
          created_at?: string;
          updated_at?: string;
          owner_id?: string;
        };
        Update: {
          name?: string;
          description?: string;
          color?: string;
          icon?: string;
          settings?: any;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          type: 'info' | 'success' | 'warning' | 'error';
          title: string;
          message: string;
          user_id: string;
          read: boolean;
          related_entity_type: string | null;
          related_entity_id: string | null;
          related_entity_name: string | null;
          action_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          type: 'info' | 'success' | 'warning' | 'error';
          title: string;
          message: string;
          user_id: string;
          read?: boolean;
          related_entity_type?: string | null;
          related_entity_id?: string | null;
          related_entity_name?: string | null;
          action_url?: string | null;
          created_at?: string;
        };
        Update: {
          read?: boolean;
        };
      };
      time_entries: {
        Row: {
          id: string;
          task_id: string;
          user_id: string;
          start_time: string;
          end_time: string | null;
          duration: number;
          description: string;
          billable: boolean;
          hourly_rate: number | null;
          status: 'running' | 'stopped' | 'approved' | 'rejected';
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          user_id: string;
          start_time: string;
          end_time?: string | null;
          duration?: number;
          description?: string;
          billable?: boolean;
          hourly_rate?: number | null;
          status?: 'running' | 'stopped' | 'approved' | 'rejected';
          created_at?: string;
        };
        Update: {
          end_time?: string | null;
          duration?: number;
          description?: string;
          billable?: boolean;
          hourly_rate?: number | null;
          status?: 'running' | 'stopped' | 'approved' | 'rejected';
        };
      };
      chat_channels: {
        Row: {
          id: string;
          name: string;
          description: string;
          type: 'project' | 'team' | 'direct' | 'general';
          members: string[];
          is_private: boolean;
          project_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          type?: 'project' | 'team' | 'direct' | 'general';
          members?: string[];
          is_private?: boolean;
          project_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string;
          members?: string[];
          is_private?: boolean;
          updated_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          channel_id: string;
          user_id: string;
          content: string;
          type: 'text' | 'file' | 'system';
          file_url: string | null;
          file_name: string | null;
          file_size: number | null;
          mentions: string[];
          reply_to: string | null;
          created_at: string;
          updated_at: string | null;
          is_edited: boolean;
        };
        Insert: {
          id?: string;
          channel_id: string;
          user_id: string;
          content: string;
          type?: 'text' | 'file' | 'system';
          file_url?: string | null;
          file_name?: string | null;
          file_size?: number | null;
          mentions?: string[];
          reply_to?: string | null;
          created_at?: string;
          updated_at?: string | null;
          is_edited?: boolean;
        };
        Update: {
          content?: string;
          updated_at?: string;
          is_edited?: boolean;
        };
      };
      automations: {
        Row: {
          id: string;
          name: string;
          description: string;
          trigger_type: string;
          trigger_config: any;
          action_type: string;
          action_config: any;
          is_active: boolean;
          run_count: number;
          success_count: number;
          last_run: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          trigger_type: string;
          trigger_config?: any;
          action_type: string;
          action_config?: any;
          is_active?: boolean;
          run_count?: number;
          success_count?: number;
          last_run?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string;
          trigger_type?: string;
          trigger_config?: any;
          action_type?: string;
          action_config?: any;
          is_active?: boolean;
          run_count?: number;
          success_count?: number;
          last_run?: string | null;
          updated_at?: string;
        };
      };
      files: {
        Row: {
          id: string;
          name: string;
          type: 'file' | 'folder';
          mime_type: string | null;
          size: number | null;
          url: string | null;
          thumbnail: string | null;
          uploaded_by: string;
          uploaded_at: string;
          last_modified: string;
          starred: boolean;
          shared: boolean;
          parent_id: string | null;
          project_id: string | null;
          task_id: string | null;
          tags: string[];
          version: number;
          permissions: any;
        };
        Insert: {
          id?: string;
          name: string;
          type?: 'file' | 'folder';
          mime_type?: string | null;
          size?: number | null;
          url?: string | null;
          thumbnail?: string | null;
          uploaded_by?: string;
          uploaded_at?: string;
          last_modified?: string;
          starred?: boolean;
          shared?: boolean;
          parent_id?: string | null;
          project_id?: string | null;
          task_id?: string | null;
          tags?: string[];
          version?: number;
          permissions?: any;
        };
        Update: {
          name?: string;
          starred?: boolean;
          shared?: boolean;
          tags?: string[];
          last_modified?: string;
          permissions?: any;
        };
      };
    };
    Enums: {
      user_role: 'Admin' | 'Manager' | 'Member' | 'Viewer';
      user_status: 'Active' | 'Inactive';
      project_status: 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled';
      project_priority: 'Low' | 'Medium' | 'High' | 'Critical';
      task_status: 'Pending' | 'In progress' | 'Complete' | 'Blocked';
      task_priority: 'Low' | 'Medium' | 'High';
      notification_type: 'info' | 'success' | 'warning' | 'error';
    };
  };
}