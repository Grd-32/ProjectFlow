/*
  # Multi-Tenant System Schema

  1. New Tables
    - `tenants` - Organization/company data with billing and settings
    - `tenant_members` - User membership in organizations with roles
    - `user_profiles` - Extended user profile information
    - `subscriptions` - Subscription and billing information
    - `usage_tracking` - Track usage metrics for billing
    - `access_requests` - Handle access requests from potential customers

  2. Security
    - Enable RLS on all new tables
    - Add policies for tenant isolation
    - Ensure users can only access their tenant's data

  3. Indexes
    - Add performance indexes for common queries
    - Optimize for tenant-based filtering
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  phone text,
  timezone text DEFAULT 'UTC',
  language text DEFAULT 'en',
  tenant_id uuid,
  last_login_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tenants Table (Organizations/Companies)
CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  domain text UNIQUE NOT NULL,
  subdomain text UNIQUE NOT NULL,
  plan text NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'enterprise')),
  status text NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'suspended', 'cancelled')),
  trial_ends_at timestamptz,
  subscription_id text,
  settings jsonb DEFAULT '{}',
  billing jsonb DEFAULT '{}',
  usage jsonb DEFAULT '{"users": 0, "projects": 0, "storage": 0, "apiCalls": 0}',
  owner jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tenant Members Table (User-Tenant relationships)
CREATE TABLE IF NOT EXISTS tenant_members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'manager', 'member', 'viewer')),
  permissions jsonb DEFAULT '{}',
  joined_at timestamptz DEFAULT now(),
  invited_by uuid REFERENCES auth.users(id),
  invitation_accepted_at timestamptz,
  UNIQUE(tenant_id, user_id)
);

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  stripe_subscription_id text UNIQUE,
  stripe_customer_id text,
  plan text NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing', 'incomplete')),
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  amount integer NOT NULL, -- in cents
  currency text NOT NULL DEFAULT 'USD',
  interval text NOT NULL DEFAULT 'month' CHECK (interval IN ('month', 'year')),
  cancel_at_period_end boolean DEFAULT false,
  trial_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Usage Tracking Table
CREATE TABLE IF NOT EXISTS usage_tracking (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  metric_name text NOT NULL,
  metric_value integer NOT NULL DEFAULT 0,
  recorded_at timestamptz DEFAULT now(),
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL
);

-- Access Requests Table
CREATE TABLE IF NOT EXISTS access_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text NOT NULL,
  company text NOT NULL,
  role text,
  team_size text,
  use_case text,
  message text,
  phone text,
  timeline text,
  budget text,
  current_tool text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'demo_scheduled', 'converted', 'rejected')),
  assigned_to uuid REFERENCES auth.users(id),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Audit Log Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  entity_name text,
  details jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  severity text DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Service role can manage profiles"
  ON user_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Tenants Policies
CREATE POLICY "Users can view their tenants"
  ON tenants
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_members 
      WHERE tenant_id = tenants.id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Tenant owners can update their tenants"
  ON tenants
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_members 
      WHERE tenant_id = tenants.id 
      AND user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Authenticated users can create tenants"
  ON tenants
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Tenant Members Policies
CREATE POLICY "Users can view tenant members"
  ON tenant_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM tenant_members tm 
      WHERE tm.tenant_id = tenant_members.tenant_id 
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Tenant admins can manage members"
  ON tenant_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_members 
      WHERE tenant_id = tenant_members.tenant_id 
      AND user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- Subscriptions Policies
CREATE POLICY "Users can view their tenant subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_members 
      WHERE tenant_id = subscriptions.tenant_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Tenant owners can manage subscriptions"
  ON subscriptions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_members 
      WHERE tenant_id = subscriptions.tenant_id 
      AND user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- Usage Tracking Policies
CREATE POLICY "Users can view their tenant usage"
  ON usage_tracking
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_members 
      WHERE tenant_id = usage_tracking.tenant_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage usage tracking"
  ON usage_tracking
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Access Requests Policies
CREATE POLICY "Anyone can create access requests"
  ON access_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view access requests"
  ON access_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- Audit Logs Policies
CREATE POLICY "Users can view their tenant audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_members 
      WHERE tenant_id = audit_logs.tenant_id 
      AND user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Service role can manage audit logs"
  ON audit_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Update existing tables to include tenant_id
DO $$
BEGIN
  -- Add tenant_id to users table if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE users ADD COLUMN tenant_id uuid REFERENCES tenants(id);
  END IF;

  -- Add tenant_id to projects table if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE projects ADD COLUMN tenant_id uuid REFERENCES tenants(id);
  END IF;

  -- Add tenant_id to tasks table if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE tasks ADD COLUMN tenant_id uuid REFERENCES tenants(id);
  END IF;

  -- Add tenant_id to notifications table if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE notifications ADD COLUMN tenant_id uuid REFERENCES tenants(id);
  END IF;

  -- Add tenant_id to time_entries table if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'time_entries' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE time_entries ADD COLUMN tenant_id uuid REFERENCES tenants(id);
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_tenant_id ON user_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_members_tenant_id ON tenant_members(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_members_user_id ON tenant_members(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant_id ON subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_tenant_id ON usage_tracking(tenant_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_period ON usage_tracking(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_access_requests_status ON access_requests(status);
CREATE INDEX IF NOT EXISTS idx_access_requests_created_at ON access_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Add tenant_id indexes to existing tables
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_projects_tenant_id ON projects(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tasks_tenant_id ON tasks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_tenant_id ON notifications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_tenant_id ON time_entries(tenant_id);

-- Update RLS policies for existing tables to include tenant isolation
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view tenant users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    tenant_id IS NULL OR
    EXISTS (
      SELECT 1 FROM tenant_members 
      WHERE tenant_id = users.tenant_id 
      AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can view own projects" ON projects;
CREATE POLICY "Users can view tenant projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    tenant_id IS NULL OR
    EXISTS (
      SELECT 1 FROM tenant_members 
      WHERE tenant_id = projects.tenant_id 
      AND user_id = auth.uid()
    ) OR
    is_publicly_shared = true
  );

DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
CREATE POLICY "Users can view tenant tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (
    tenant_id IS NULL OR
    EXISTS (
      SELECT 1 FROM tenant_members 
      WHERE tenant_id = tasks.tenant_id 
      AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view tenant notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    (tenant_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM tenant_members 
      WHERE tenant_id = notifications.tenant_id 
      AND user_id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "Users can view own time entries" ON time_entries;
CREATE POLICY "Users can view tenant time entries"
  ON time_entries
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    (tenant_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM tenant_members 
      WHERE tenant_id = time_entries.tenant_id 
      AND user_id = auth.uid()
    ))
  );

-- Functions for usage tracking
CREATE OR REPLACE FUNCTION update_tenant_usage()
RETURNS trigger AS $$
BEGIN
  -- Update tenant usage when users, projects, or other resources change
  IF TG_TABLE_NAME = 'tenant_members' THEN
    UPDATE tenants 
    SET usage = jsonb_set(
      usage, 
      '{users}', 
      (SELECT COUNT(*)::text::jsonb FROM tenant_members WHERE tenant_id = NEW.tenant_id)
    ),
    updated_at = now()
    WHERE id = NEW.tenant_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for usage tracking
DROP TRIGGER IF EXISTS update_tenant_usage_on_member_change ON tenant_members;
CREATE TRIGGER update_tenant_usage_on_member_change
  AFTER INSERT OR DELETE ON tenant_members
  FOR EACH ROW
  EXECUTE FUNCTION update_tenant_usage();

-- Function to create audit log entries
CREATE OR REPLACE FUNCTION create_audit_log(
  p_tenant_id uuid,
  p_user_id uuid,
  p_action text,
  p_entity_type text,
  p_entity_id text,
  p_entity_name text DEFAULT NULL,
  p_details jsonb DEFAULT '{}',
  p_severity text DEFAULT 'low'
)
RETURNS uuid AS $$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO audit_logs (
    tenant_id,
    user_id,
    action,
    entity_type,
    entity_id,
    entity_name,
    details,
    severity,
    ip_address,
    user_agent
  ) VALUES (
    p_tenant_id,
    p_user_id,
    p_action,
    p_entity_type,
    p_entity_id,
    p_entity_name,
    p_details,
    p_severity,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent'
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check tenant limits
CREATE OR REPLACE FUNCTION check_tenant_limits(
  p_tenant_id uuid,
  p_resource_type text
)
RETURNS boolean AS $$
DECLARE
  tenant_record tenants%ROWTYPE;
  current_usage integer;
  limit_value integer;
BEGIN
  SELECT * INTO tenant_record FROM tenants WHERE id = p_tenant_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Get current usage
  current_usage := (tenant_record.usage->p_resource_type)::integer;
  
  -- Get limit based on plan
  CASE tenant_record.plan
    WHEN 'starter' THEN
      CASE p_resource_type
        WHEN 'users' THEN limit_value := 10;
        WHEN 'storage' THEN limit_value := 10;
        ELSE limit_value := -1; -- unlimited
      END CASE;
    WHEN 'professional' THEN
      CASE p_resource_type
        WHEN 'users' THEN limit_value := 50;
        WHEN 'storage' THEN limit_value := 100;
        ELSE limit_value := -1; -- unlimited
      END CASE;
    WHEN 'enterprise' THEN
      limit_value := -1; -- unlimited
  END CASE;
  
  -- Return true if under limit or unlimited
  RETURN limit_value = -1 OR current_usage < limit_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample data for development
INSERT INTO tenants (
  id,
  name,
  domain,
  subdomain,
  plan,
  status,
  trial_ends_at,
  settings,
  billing,
  usage,
  owner
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Demo Organization',
  'demo.projectflow.app',
  'demo',
  'professional',
  'trial',
  now() + interval '14 days',
  '{"maxUsers": 50, "maxProjects": -1, "maxStorage": 100, "features": ["basic_features", "advanced_analytics", "integrations"], "onboardingCompleted": false}',
  '{"amount": 2900, "currency": "USD"}',
  '{"users": 1, "projects": 2, "storage": 5.2, "apiCalls": 150, "lastUpdated": "2024-12-12T00:00:00Z"}',
  '{"id": "1", "name": "Demo User", "email": "demo@projectflow.app"}'
) ON CONFLICT (id) DO NOTHING;