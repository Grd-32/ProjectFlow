/*
  # Add Comprehensive Project Management Tables

  1. New Tables
    - `goals` - Track project and team goals with progress
    - `documents` - Store project documentation and knowledge base
    - `milestones` - Project milestones with dependencies
    - `risks` - Risk management for projects
    - `change_requests` - Track change requests across projects
    - `resources` - Resource allocation and management
    - `workflow_templates` - Reusable workflow templates
    - `workspaces` - Already exists, ensure proper structure
    - `chat_channels` - Team communication channels  
    - `chat_messages` - Channel messages
    - `automations` - Workflow automation rules
    - `files` - File management system
    - `task_comments` - Comments on tasks
    - `task_attachments` - File attachments for tasks
    - `subtasks` - Break down tasks into subtasks
    
  2. Security
    - Enable RLS on all new tables
    - Add policies for tenant isolation and user access
    
  3. Relationships
    - Link tables to projects, tasks, users, and tenants
    - Set up proper foreign key constraints
*/

-- Goals Table
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  progress numeric DEFAULT 0 CHECK (progress >= 0),
  target numeric NOT NULL CHECK (target > 0),
  due_date date NOT NULL,
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'Paused')),
  category text NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Documents Table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  author_id uuid NOT NULL REFERENCES users(id),
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Milestones Table
CREATE TABLE IF NOT EXISTS milestones (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  due_date date NOT NULL,
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Overdue')),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  dependencies uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Risks Table
CREATE TABLE IF NOT EXISTS risks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  probability text NOT NULL CHECK (probability IN ('Low', 'Medium', 'High')),
  impact text NOT NULL CHECK (impact IN ('Low', 'Medium', 'High')),
  status text NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Mitigated', 'Closed')),
  owner_id uuid REFERENCES users(id),
  mitigation text,
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Change Requests Table
CREATE TABLE IF NOT EXISTS change_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('Scope', 'Timeline', 'Budget', 'Resource')),
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Implemented')),
  requested_by_id uuid NOT NULL REFERENCES users(id),
  impact text,
  cost numeric DEFAULT 0,
  time_impact integer DEFAULT 0,
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Resources Table
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('Human', 'Equipment', 'Material', 'Software')),
  cost numeric DEFAULT 0,
  availability numeric DEFAULT 100 CHECK (availability >= 0 AND availability <= 100),
  skills text[],
  department text,
  assigned_projects uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Workflow Templates Table
CREATE TABLE IF NOT EXISTS workflow_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  steps jsonb NOT NULL DEFAULT '[]',
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Workspaces Table (if not exists from earlier migration)
CREATE TABLE IF NOT EXISTS workspaces (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  color text DEFAULT '#3B82F6',
  icon text DEFAULT 'folder',
  settings jsonb DEFAULT '{}',
  owner_id uuid REFERENCES users(id),
  projects uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Chat Channels Table  
CREATE TABLE IF NOT EXISTS chat_channels (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  type text NOT NULL DEFAULT 'general' CHECK (type IN ('project', 'team', 'direct', 'general')),
  members uuid[] DEFAULT '{}',
  is_private boolean DEFAULT false,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id uuid NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id),
  content text NOT NULL,
  type text DEFAULT 'text' CHECK (type IN ('text', 'file', 'system')),
  file_url text,
  file_name text,
  file_size numeric,
  mentions uuid[] DEFAULT '{}',
  reply_to uuid REFERENCES chat_messages(id) ON DELETE SET NULL,
  is_edited boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Automations Table
CREATE TABLE IF NOT EXISTS automations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  trigger_type text NOT NULL,
  trigger_config jsonb DEFAULT '{}',
  action_type text NOT NULL,
  action_config jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  run_count integer DEFAULT 0,
  success_count integer DEFAULT 0,
  last_run timestamptz,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Files Table
CREATE TABLE IF NOT EXISTS files (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text DEFAULT 'file' CHECK (type IN ('file', 'folder')),
  mime_type text,
  size numeric,
  url text,
  thumbnail text,
  uploaded_by uuid REFERENCES users(id),
  parent_id uuid REFERENCES files(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  task_id uuid REFERENCES tasks(id) ON DELETE SET NULL,
  tags text[] DEFAULT '{}',
  version integer DEFAULT 1,
  permissions jsonb DEFAULT '{}',
  starred boolean DEFAULT false,
  shared boolean DEFAULT false,
  uploaded_at timestamptz DEFAULT now(),
  last_modified timestamptz DEFAULT now()
);

-- Task Comments Table
CREATE TABLE IF NOT EXISTS task_comments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id),
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Task Attachments Table
CREATE TABLE IF NOT EXISTS task_attachments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  name text NOT NULL,
  size numeric NOT NULL,
  type text NOT NULL,
  url text NOT NULL,
  uploaded_by uuid NOT NULL REFERENCES users(id),
  uploaded_at timestamptz DEFAULT now()
);

-- Subtasks Table
CREATE TABLE IF NOT EXISTS subtasks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  name text NOT NULL,
  completed boolean DEFAULT false,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add missing columns to tasks table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'actual_hours'
  ) THEN
    ALTER TABLE tasks ADD COLUMN actual_hours numeric DEFAULT 0;
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Goals
CREATE POLICY "Users can view tenant goals"
  ON goals FOR SELECT TO authenticated
  USING (
    tenant_id IS NULL OR
    EXISTS (
      SELECT 1 FROM tenant_members 
      WHERE tenant_id = goals.tenant_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage tenant goals"
  ON goals FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_members 
      WHERE tenant_id = goals.tenant_id 
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin', 'manager')
    )
  );

-- RLS Policies for Documents
CREATE POLICY "Users can view tenant documents"
  ON documents FOR SELECT TO authenticated
  USING (
    tenant_id IS NULL OR
    EXISTS (
      SELECT 1 FROM tenant_members 
      WHERE tenant_id = documents.tenant_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage tenant documents"
  ON documents FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_members 
      WHERE tenant_id = documents.tenant_id 
      AND user_id = auth.uid()
    )
  );

-- RLS Policies for Milestones, Risks, Change Requests (similar pattern)
CREATE POLICY "Users can view tenant milestones"
  ON milestones FOR SELECT TO authenticated
  USING (
    tenant_id IS NULL OR
    EXISTS (
      SELECT 1 FROM tenant_members 
      WHERE tenant_id = milestones.tenant_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage tenant milestones"
  ON milestones FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_members 
      WHERE tenant_id = milestones.tenant_id 
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin', 'manager')
    )
  );

CREATE POLICY "Users can view tenant risks"
  ON risks FOR SELECT TO authenticated
  USING (
    tenant_id IS NULL OR
    EXISTS (
      SELECT 1 FROM tenant_members 
      WHERE tenant_id = risks.tenant_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage tenant risks"
  ON risks FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_members 
      WHERE tenant_id = risks.tenant_id 
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin', 'manager')
    )
  );

CREATE POLICY "Users can view tenant change requests"
  ON change_requests FOR SELECT TO authenticated
  USING (
    tenant_id IS NULL OR
    EXISTS (
      SELECT 1 FROM tenant_members 
      WHERE tenant_id = change_requests.tenant_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage tenant change requests"
  ON change_requests FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_members 
      WHERE tenant_id = change_requests.tenant_id 
      AND user_id = auth.uid()
    )
  );

-- RLS Policies for Resources, Workflow Templates, Workspaces
CREATE POLICY "Users can view tenant resources"
  ON resources FOR SELECT TO authenticated
  USING (
    tenant_id IS NULL OR
    EXISTS (
      SELECT 1 FROM tenant_members 
      WHERE tenant_id = resources.tenant_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage tenant resources"
  ON resources FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_members 
      WHERE tenant_id = resources.tenant_id 
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin', 'manager')
    )
  );

CREATE POLICY "Users can view tenant workflow templates"
  ON workflow_templates FOR SELECT TO authenticated
  USING (
    tenant_id IS NULL OR
    EXISTS (
      SELECT 1 FROM tenant_members 
      WHERE tenant_id = workflow_templates.tenant_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage tenant workflow templates"
  ON workflow_templates FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_members 
      WHERE tenant_id = workflow_templates.tenant_id 
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin', 'manager')
    )
  );

CREATE POLICY "Users can view tenant workspaces"
  ON workspaces FOR SELECT TO authenticated
  USING (
    tenant_id IS NULL OR
    EXISTS (
      SELECT 1 FROM tenant_members 
      WHERE tenant_id = workspaces.tenant_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage tenant workspaces"
  ON workspaces FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_members 
      WHERE tenant_id = workspaces.tenant_id 
      AND user_id = auth.uid()
    )
  );

-- RLS Policies for Chat
CREATE POLICY "Users can view chat channels"
  ON chat_channels FOR SELECT TO authenticated
  USING (
    tenant_id IS NULL OR
    auth.uid() = ANY(members) OR
    EXISTS (
      SELECT 1 FROM tenant_members 
      WHERE tenant_id = chat_channels.tenant_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage chat channels"
  ON chat_channels FOR ALL TO authenticated
  USING (
    auth.uid() = ANY(members) OR
    EXISTS (
      SELECT 1 FROM tenant_members 
      WHERE tenant_id = chat_channels.tenant_id 
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can view chat messages"
  ON chat_messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_channels 
      WHERE id = chat_messages.channel_id 
      AND (auth.uid() = ANY(members) OR tenant_id IS NULL)
    )
  );

CREATE POLICY "Users can send chat messages"
  ON chat_messages FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM chat_channels 
      WHERE id = chat_messages.channel_id 
      AND auth.uid() = ANY(members)
    )
  );

CREATE POLICY "Users can update own messages"
  ON chat_messages FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for Files, Task Comments, Task Attachments, Subtasks
CREATE POLICY "Users can view tenant files"
  ON files FOR SELECT TO authenticated
  USING (
    tenant_id IS NULL OR
    EXISTS (
      SELECT 1 FROM tenant_members 
      WHERE tenant_id = files.tenant_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage tenant files"
  ON files FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_members 
      WHERE tenant_id = files.tenant_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view task comments"
  ON task_comments FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE id = task_comments.task_id 
      AND (
        assignee_id = auth.uid() OR
        tenant_id IS NULL OR
        EXISTS (
          SELECT 1 FROM tenant_members 
          WHERE tenant_id = tasks.tenant_id 
          AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can add comments to tasks"
  ON task_comments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own comments"
  ON task_comments FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own comments"
  ON task_comments FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view task attachments"
  ON task_attachments FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE id = task_attachments.task_id 
      AND (
        assignee_id = auth.uid() OR
        tenant_id IS NULL OR
        EXISTS (
          SELECT 1 FROM tenant_members 
          WHERE tenant_id = tasks.tenant_id 
          AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can add attachments to tasks"
  ON task_attachments FOR INSERT TO authenticated
  WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Users can manage task attachments"
  ON task_attachments FOR ALL TO authenticated
  USING (uploaded_by = auth.uid());

CREATE POLICY "Users can view subtasks"
  ON subtasks FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE id = subtasks.task_id 
      AND (
        assignee_id = auth.uid() OR
        tenant_id IS NULL OR
        EXISTS (
          SELECT 1 FROM tenant_members 
          WHERE tenant_id = tasks.tenant_id 
          AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can manage subtasks"
  ON subtasks FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE id = subtasks.task_id 
      AND (
        assignee_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM tenant_members 
          WHERE tenant_id = tasks.tenant_id 
          AND user_id = auth.uid()
          AND role IN ('owner', 'admin', 'manager')
        )
      )
    )
  );

CREATE POLICY "Users can view tenant automations"
  ON automations FOR SELECT TO authenticated
  USING (
    tenant_id IS NULL OR
    EXISTS (
      SELECT 1 FROM tenant_members 
      WHERE tenant_id = automations.tenant_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage automations"
  ON automations FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_members 
      WHERE tenant_id = automations.tenant_id 
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_goals_tenant_id ON goals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_goals_project_id ON goals(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_tenant_id ON documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_milestones_tenant_id ON milestones(tenant_id);
CREATE INDEX IF NOT EXISTS idx_milestones_project_id ON milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_risks_tenant_id ON risks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_risks_project_id ON risks(project_id);
CREATE INDEX IF NOT EXISTS idx_change_requests_tenant_id ON change_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_change_requests_project_id ON change_requests(project_id);
CREATE INDEX IF NOT EXISTS idx_resources_tenant_id ON resources(tenant_id);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_tenant_id ON workflow_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_tenant_id ON workspaces(tenant_id);
CREATE INDEX IF NOT EXISTS idx_chat_channels_tenant_id ON chat_channels(tenant_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel_id ON chat_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_automations_tenant_id ON automations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_files_tenant_id ON files(tenant_id);
CREATE INDEX IF NOT EXISTS idx_files_project_id ON files(project_id);
CREATE INDEX IF NOT EXISTS idx_files_task_id ON files(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_attachments_task_id ON task_attachments(task_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON subtasks(task_id);
