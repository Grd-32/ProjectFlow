/*
  # Add Demo Seed Data

  1. Demo Users
    - Creates demo users with different roles
    - Admin, Manager, Member roles
    
  2. Demo Projects
    - 3 sample projects with realistic data
    
  3. Demo Tasks
    - Multiple tasks per project
    
  4. Demo Goals, Documents, Notifications
*/

-- Insert Demo Users
INSERT INTO users (id, name, email, avatar, role, department, status, created_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'John Doe', 'john@demo.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=John', 'Admin', 'Management', 'Active', now()),
  ('22222222-2222-2222-2222-222222222222', 'Sarah Chen', 'sarah@demo.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', 'Manager', 'Engineering', 'Active', now()),
  ('33333333-3333-3333-3333-333333333333', 'Mike Johnson', 'mike@demo.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', 'Member', 'Engineering', 'Active', now()),
  ('44444444-4444-4444-4444-444444444444', 'Alex Rodriguez', 'alex@demo.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', 'Member', 'Design', 'Active', now()),
  ('55555555-5555-5555-5555-555555555555', 'Emily Davis', 'emily@demo.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily', 'Member', 'Engineering', 'Active', now()),
  ('66666666-6666-6666-6666-666666666666', 'Demo User', 'demo@demo.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo', 'Admin', 'Management', 'Active', now())
ON CONFLICT (id) DO NOTHING;

-- Insert Demo Projects
INSERT INTO projects (id, name, description, status, priority, start_date, end_date, budget, spent, progress, manager_id, team_members, created_at)
VALUES 
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Website Redesign',
    'Complete overhaul of company website with modern design and improved UX',
    'Active',
    'High',
    '2024-11-01',
    '2024-12-31',
    50000,
    18500,
    65,
    '22222222-2222-2222-2222-222222222222',
    ARRAY['33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555']::uuid[],
    now()
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Mobile App Development',
    'Native mobile application for iOS and Android platforms',
    'Planning',
    'Critical',
    '2025-01-15',
    '2025-06-30',
    120000,
    0,
    15,
    '11111111-1111-1111-1111-111111111111',
    ARRAY['33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222']::uuid[],
    now()
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'API Integration Platform',
    'Build robust API integration platform for third-party services',
    'Active',
    'Medium',
    '2024-10-01',
    '2025-03-31',
    75000,
    32000,
    45,
    '22222222-2222-2222-2222-222222222222',
    ARRAY['33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555']::uuid[],
    now()
  )
ON CONFLICT (id) DO NOTHING;

-- Insert Demo Tasks
INSERT INTO tasks (id, name, description, status, priority, assignee_id, project_id, due_date, estimated_hours, actual_hours, tags, created_at)
VALUES 
  (
    '11111111-aaaa-aaaa-aaaa-111111111111',
    'Design new landing page hero section',
    'Create compelling hero section with animations',
    'In progress',
    'High',
    '44444444-4444-4444-4444-444444444444',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '2024-12-15',
    16,
    8,
    ARRAY['design', 'frontend', 'ui'],
    now()
  ),
  (
    '22222222-aaaa-aaaa-aaaa-222222222222',
    'Implement user authentication flow',
    'Set up secure login and registration',
    'Pending',
    'High',
    '33333333-3333-3333-3333-333333333333',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '2024-12-18',
    24,
    0,
    ARRAY['backend', 'security', 'auth'],
    now()
  ),
  (
    '33333333-aaaa-aaaa-aaaa-333333333333',
    'Optimize database queries',
    'Review and optimize slow queries',
    'Complete',
    'Medium',
    '55555555-5555-5555-5555-555555555555',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '2024-12-10',
    12,
    14,
    ARRAY['backend', 'performance'],
    now()
  ),
  (
    '44444444-bbbb-bbbb-bbbb-444444444444',
    'Mobile app wireframes',
    'Create initial wireframes',
    'In progress',
    'High',
    '44444444-4444-4444-4444-444444444444',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '2024-12-20',
    20,
    12,
    ARRAY['mobile', 'design'],
    now()
  ),
  (
    '55555555-bbbb-bbbb-bbbb-555555555555',
    'Set up CI/CD pipeline',
    'Configure automated deployment',
    'Pending',
    'Medium',
    '33333333-3333-3333-3333-333333333333',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '2025-01-05',
    16,
    0,
    ARRAY['devops', 'automation'],
    now()
  ),
  (
    '66666666-cccc-cccc-cccc-666666666666',
    'API rate limiting implementation',
    'Implement token bucket algorithm',
    'In progress',
    'High',
    '33333333-3333-3333-3333-333333333333',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '2024-12-25',
    18,
    6,
    ARRAY['backend', 'api'],
    now()
  )
ON CONFLICT (id) DO NOTHING;

-- Insert Demo Subtasks
INSERT INTO subtasks (task_id, name, completed, order_index)
VALUES 
  ('11111111-aaaa-aaaa-aaaa-111111111111', 'Create wireframes', true, 0),
  ('11111111-aaaa-aaaa-aaaa-111111111111', 'Design mockups', true, 1),
  ('11111111-aaaa-aaaa-aaaa-111111111111', 'Implement with React', false, 2),
  ('22222222-aaaa-aaaa-aaaa-222222222222', 'Set up OAuth', false, 0),
  ('22222222-aaaa-aaaa-aaaa-222222222222', 'Create login UI', false, 1)
ON CONFLICT DO NOTHING;

-- Insert Demo Goals
INSERT INTO goals (id, title, description, progress, target, due_date, status, category, project_id, created_by)
VALUES 
  (
    '11111111-0000-0000-0000-000000000001',
    'Launch Website Redesign',
    'Complete development and launch redesigned website',
    65,
    100,
    '2024-12-31',
    'Active',
    'Product',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '22222222-2222-2222-2222-222222222222'
  ),
  (
    '22222222-0000-0000-0000-000000000002',
    'Mobile App MVP',
    'Develop and release MVP',
    15,
    100,
    '2025-06-30',
    'Active',
    'Product',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '11111111-1111-1111-1111-111111111111'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert Demo Milestones
INSERT INTO milestones (id, name, description, due_date, status, project_id)
VALUES 
  (
    '11111111-0001-0001-0001-000000000001',
    'Design System Complete',
    'Finalize design system',
    '2024-12-15',
    'In Progress',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  ),
  (
    '22222222-0001-0001-0001-000000000002',
    'Frontend Development Complete',
    'Complete frontend',
    '2024-12-25',
    'Pending',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert Demo Documents
INSERT INTO documents (id, title, content, author_id, project_id, tags)
VALUES 
  (
    '11111111-0002-0002-0002-000000000001',
    'Website Redesign Requirements',
    'Detailed requirements for website redesign',
    '22222222-2222-2222-2222-222222222222',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    ARRAY['requirements', 'planning']
  ),
  (
    '22222222-0002-0002-0002-000000000002',
    'Mobile App Technical Spec',
    'Technical specifications for mobile app',
    '11111111-1111-1111-1111-111111111111',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    ARRAY['technical', 'mobile']
  )
ON CONFLICT (id) DO NOTHING;

-- Insert Demo Notifications
INSERT INTO notifications (type, title, message, user_id, read, related_entity_type, related_entity_id, related_entity_name, action_url)
VALUES 
  (
    'info',
    'Task Assigned',
    'You have been assigned to "Design new landing page hero section"',
    '44444444-4444-4444-4444-444444444444',
    false,
    'task',
    '11111111-aaaa-aaaa-aaaa-111111111111',
    'Design new landing page hero section',
    '/tasks'
  ),
  (
    'success',
    'Task Completed',
    'Task "Optimize database queries" marked complete',
    '22222222-2222-2222-2222-222222222222',
    false,
    'task',
    '33333333-aaaa-aaaa-aaaa-333333333333',
    'Optimize database queries',
    '/tasks'
  )
ON CONFLICT DO NOTHING;

-- Insert Demo Task Comments
INSERT INTO task_comments (task_id, user_id, content)
VALUES 
  (
    '11111111-aaaa-aaaa-aaaa-111111111111',
    '33333333-3333-3333-3333-333333333333',
    'Looking good! Can we adjust the color scheme?'
  ),
  (
    '11111111-aaaa-aaaa-aaaa-111111111111',
    '44444444-4444-4444-4444-444444444444',
    'Sure, I will update the design with brand colors.'
  )
ON CONFLICT DO NOTHING;

-- Insert Demo Workspaces
INSERT INTO workspaces (id, name, description, color, icon, owner_id, projects)
VALUES 
  (
    '11111111-0003-0003-0003-000000000001',
    'Product Development',
    'All product-related projects',
    '#3B82F6',
    'rocket',
    '11111111-1111-1111-1111-111111111111',
    ARRAY['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb']::uuid[]
  ),
  (
    '22222222-0003-0003-0003-000000000002',
    'Infrastructure',
    'Backend and infrastructure projects',
    '#10B981',
    'server',
    '22222222-2222-2222-2222-222222222222',
    ARRAY['cccccccc-cccc-cccc-cccc-cccccccccccc']::uuid[]
  )
ON CONFLICT (id) DO NOTHING;
