# Data Architecture & Integration Guide

## Overview

The application now uses Supabase as the primary database with real-time synchronization across all modules. All data operations flow through a service layer that provides type-safe access to the database.

## Database Schema

### Core Tables

1. **users** - User accounts and profiles
   - Stores user information, roles, departments
   - Links to tenant for multi-tenancy
   - Has RLS policies for access control

2. **projects** - Project management
   - Tracks project status, budget, progress
   - Links to manager (user) and team members
   - Supports public sharing with settings
   - Connected to tasks, milestones, risks, change requests

3. **tasks** - Task tracking
   - Assigned to users within projects
   - Tracks status, priority, hours (estimated/actual)
   - Supports dependencies and tags
   - Links to subtasks, comments, and attachments

4. **goals** - Goal tracking
   - Tracks progress towards targets
   - Can be linked to projects
   - Categorized for reporting

5. **documents** - Knowledge base
   - Project documentation
   - Searchable by tags
   - Linked to authors and projects

6. **milestones** - Project milestones
   - Due dates and dependencies
   - Status tracking
   - Linked to projects

7. **risks** - Risk management
   - Probability and impact assessment
   - Mitigation strategies
   - Status tracking

8. **change_requests** - Change management
   - Track scope, timeline, budget, resource changes
   - Approval workflow
   - Impact and cost tracking

9. **resources** - Resource allocation
   - Human, equipment, material, software
   - Cost and availability tracking
   - Skills and department categorization

10. **workspaces** - Workspace organization
    - Group related projects
    - Custom settings per workspace
    - Linked to projects array

11. **notifications** - User notifications
    - Real-time alerts
    - Links to related entities
    - Read/unread status

12. **time_entries** - Time tracking
    - Track time per task
    - Billable hours
    - Approval workflow

13. **subtasks** - Task breakdown
    - Ordered list of subtasks
    - Completion tracking

14. **task_comments** - Task discussions
    - Threaded conversations
    - Linked to users

15. **task_attachments** - File attachments
    - Associated with tasks
    - Tracks uploader and metadata

16. **chat_channels** - Team communication
    - Project, team, direct, general channels
    - Member lists
    - Privacy settings

17. **chat_messages** - Chat messages
    - Text, file, system messages
    - Mentions and replies
    - Edit tracking

18. **automations** - Workflow automation
    - Trigger-action configurations
    - Run statistics
    - Active/inactive status

19. **files** - File management
    - Files and folders
    - Version tracking
    - Permissions and sharing

20. **tenants** - Multi-tenancy
    - Organization/company data
    - Subscription and billing
    - Usage tracking
    - Settings and configuration

21. **tenant_members** - Team membership
    - User-tenant relationships
    - Roles and permissions
    - Invitation tracking

## Service Layer

### Available Services

All services are located in `src/services/` and provide:
- CRUD operations
- Real-time subscriptions
- Type-safe interfaces
- Error handling
- Fallback for when Supabase is not configured

#### projectService
```typescript
import { projectService } from './services/projectService';

// Get all projects
const { data, error } = await projectService.getAll();

// Get by ID
const { data, error } = await projectService.getById(id);

// Create
const { data, error } = await projectService.create({
  name: 'New Project',
  description: 'Project description',
  status: 'Planning',
  priority: 'High',
  start_date: '2025-01-01',
  end_date: '2025-12-31',
  budget: 100000,
  manager_id: userId
});

// Update
const { data, error } = await projectService.update(id, {
  status: 'Active',
  progress: 25
});

// Delete
const { error } = await projectService.delete(id);

// Subscribe to changes
const subscription = projectService.subscribeToProjects((payload) => {
  console.log('Change detected:', payload);
});
// Later: subscription.unsubscribe();

// Milestones
const { data, error } = await projectService.getMilestones(projectId);
const { data, error } = await projectService.createMilestone({ ... });
const { data, error } = await projectService.updateMilestone(id, { ... });
const { error } = await projectService.deleteMilestone(id);

// Risks
const { data, error } = await projectService.getRisks(projectId);
const { data, error } = await projectService.createRisk({ ... });

// Change Requests
const { data, error } = await projectService.getChangeRequests(projectId);
const { data, error } = await projectService.createChangeRequest({ ... });
```

#### taskService
```typescript
import { taskService } from './services/taskService';

// Get all tasks
const { data, error } = await taskService.getAll();

// Get by project
const { data, error } = await taskService.getByProject(projectId);

// Get by assignee
const { data, error } = await taskService.getByAssignee(userId);

// Create
const { data, error } = await taskService.create({
  name: 'New Task',
  description: 'Task description',
  status: 'Pending',
  priority: 'High',
  assignee_id: userId,
  project_id: projectId,
  due_date: '2025-01-15',
  estimated_hours: 8
});

// Comments
const { data, error } = await taskService.getComments(taskId);
const { data, error } = await taskService.addComment(taskId, userId, 'Comment text');

// Attachments
const { data, error } = await taskService.getAttachments(taskId);
const { data, error } = await taskService.addAttachment({ ... });
const { error } = await taskService.deleteAttachment(id);

// Subtasks
const { data, error } = await taskService.getSubtasks(taskId);
const { data, error } = await taskService.createSubtask({ ... });
const { data, error } = await taskService.updateSubtask(id, { completed: true });

// Subscribe
const subscription = taskService.subscribeToTasks((payload) => { ... });
const subscription = taskService.subscribeToProjectTasks(projectId, (payload) => { ... });
```

#### userService
```typescript
import { userService } from './services/userService';

// Standard CRUD operations
const { data, error } = await userService.getAll();
const { data, error } = await userService.getById(id);
const { data, error } = await userService.create({ ... });
const { data, error } = await userService.update(id, { ... });
const { error } = await userService.delete(id);

// Subscribe
const subscription = userService.subscribeToUsers((payload) => { ... });
```

#### goalService
```typescript
import { goalService } from './services/goalService';

const { data, error } = await goalService.getAll();
const { data, error } = await goalService.getByProject(projectId);
const { data, error } = await goalService.create({ ... });
const { data, error } = await goalService.update(id, { progress: 75 });
```

#### documentService
```typescript
import { documentService } from './services/documentService';

const { data, error } = await documentService.getAll();
const { data, error } = await documentService.getByProject(projectId);
const { data, error } = await documentService.create({ ... });
const { data, error } = await documentService.update(id, { content: '...' });
```

## React Hooks for Real-Time Data

Located in `src/hooks/useSupabaseData.ts`:

### useSupabaseProjects
```typescript
import { useSupabaseProjects } from './hooks/useSupabaseData';

function MyComponent() {
  const {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refresh
  } = useSupabaseProjects();

  // projects automatically updates with real-time changes
  // loading indicates if initial fetch is in progress
  // error contains any error that occurred
  // CRUD functions available
  // refresh() to manually reload
}
```

### useSupabaseTasks
```typescript
import { useSupabaseTasks } from './hooks/useSupabaseData';

function MyComponent() {
  const {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    refresh
  } = useSupabaseTasks();
}
```

### useSupabaseUsers
```typescript
import { useSupabaseUsers } from './hooks/useSupabaseData';

function MyComponent() {
  const {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    refresh
  } = useSupabaseUsers();
}
```

### useSupabaseGoals
```typescript
import { useSupabaseGoals } from './hooks/useSupabaseData';

function MyComponent() {
  const {
    goals,
    loading,
    error,
    createGoal,
    updateGoal,
    deleteGoal,
    refresh
  } = useSupabaseGoals();
}
```

## Real-Time Synchronization

All data changes are automatically synchronized across all connected clients in real-time:

1. **Automatic Updates**: When data changes in the database (INSERT, UPDATE, DELETE), all subscribed components receive the update
2. **Optimistic UI**: Services return data immediately while background sync occurs
3. **Conflict Resolution**: Last write wins (can be enhanced with custom logic)
4. **Connection Handling**: Automatically reconnects on network changes

## Cross-Module Data Flow

### Project → Tasks → Time Tracking
```typescript
// When a project is updated
projectService.update(projectId, { status: 'Active' });
// → Triggers project subscription
// → Dashboard updates project status
// → Related tasks are still linked
// → Time entries remain associated

// When a task status changes
taskService.update(taskId, { status: 'Complete' });
// → Task subscription fires
// → Project progress can be recalculated
// → Time tracking stops for that task
// → Notifications sent to assignee and manager
```

### Goals ← Projects ← Tasks
```typescript
// Goals track projects
// Projects track tasks
// When tasks complete:
taskService.update(taskId, { status: 'Complete' });
// → Project progress updates
// → Goal progress can be recalculated
// → Dashboard reflects changes
// → Reports updated in real-time
```

### Notifications
```typescript
// Created automatically through context
// When task assigned:
// → Notification created for assignee
// → Real-time update appears in notification panel
// → Email/push notifications can be triggered

// When project status changes:
// → All team members notified
// → Manager receives special notification
```

## Row Level Security (RLS)

All tables have RLS enabled with policies:

1. **Tenant Isolation**: Users can only access data from their tenant
2. **Role-Based Access**: Different permissions for owner, admin, manager, member, viewer
3. **Data Privacy**: Personal data only accessible by the user or admins
4. **Public Sharing**: Projects can be made public with specific settings

## Integration with Existing Contexts

The existing Context providers (ProjectContext, TaskContext, etc.) can be updated to use these services:

```typescript
// Example: Update ProjectContext to use projectService
import { projectService } from '../services/projectService';

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    loadProjects();

    const subscription = projectService.subscribeToProjects((payload) => {
      if (payload.eventType === 'INSERT') {
        setProjects(prev => [payload.new, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setProjects(prev => prev.map(p =>
          p.id === payload.new.id ? payload.new : p
        ));
      } else if (payload.eventType === 'DELETE') {
        setProjects(prev => prev.filter(p => p.id !== payload.old.id));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProjects() {
    const { data, error } = await projectService.getAll();
    if (!error && data) setProjects(data);
  }

  async function addProject(projectData) {
    const { data, error } = await projectService.create(projectData);
    if (error) throw error;
    return data;
  }

  // ... rest of the context
};
```

## Reporting & Analytics

All reporting can now query real data:

```typescript
// Get all completed tasks for a project
const { data: tasks } = await taskService.getByProject(projectId);
const completed = tasks.filter(t => t.status === 'Complete');
const completionRate = (completed.length / tasks.length) * 100;

// Budget utilization across all projects
const { data: projects } = await projectService.getAll();
const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);
const utilization = (totalSpent / totalBudget) * 100;

// Goal progress
const { data: goals } = await goalService.getAll();
const activeGoals = goals.filter(g => g.status === 'Active');
const averageProgress = activeGoals.reduce((sum, g) =>
  sum + (g.progress / g.target) * 100, 0) / activeGoals.length;
```

## Migration from Mock Data

To migrate existing components from mock data to real Supabase data:

1. Import the appropriate service or hook
2. Replace local state with service calls
3. Add subscription for real-time updates
4. Handle loading and error states
5. Update CRUD operations to use service methods

## Environment Setup

Ensure `.env` file has:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

If not configured, services fall back to mock mode gracefully.

## Next Steps

1. Update existing contexts to use services
2. Add loading states to UI components
3. Implement error boundaries
4. Add retry logic for failed operations
5. Enhance real-time sync with optimistic updates
6. Add data validation layers
7. Implement caching strategies
8. Add analytics tracking
