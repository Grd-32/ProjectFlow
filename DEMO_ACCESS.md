# Demo Access Guide

## Quick Start - Try Demo Account

The easiest way to explore the system is to use the **Demo Account** feature:

### On the Login Page:

1. Navigate to the application
2. Click the **"Try Demo Account"** button
3. You'll be instantly logged in with access to all features

### Demo Account Details:

- **Email:** demo@demo.com
- **User ID:** 66666666-6666-6666-6666-666666666666
- **Role:** Admin
- **Department:** Management

## What's Included in Demo Data

The demo account comes pre-populated with realistic data stored in Supabase:

### Users (6 demo users)
- **John Doe** - Admin, Management
- **Sarah Chen** - Manager, Engineering
- **Mike Johnson** - Member, Engineering
- **Alex Rodriguez** - Member, Design
- **Emily Davis** - Member, Engineering
- **Demo User** (You) - Admin, Management

### Projects (3 active projects)

1. **Website Redesign**
   - Status: Active
   - Budget: $50,000 | Spent: $18,500
   - Progress: 65%
   - Manager: Sarah Chen
   - Team: 3 members
   - Due: Dec 31, 2024

2. **Mobile App Development**
   - Status: Planning
   - Budget: $120,000 | Spent: $0
   - Progress: 15%
   - Manager: John Doe
   - Team: 2 members
   - Due: Jun 30, 2025

3. **API Integration Platform**
   - Status: Active
   - Budget: $75,000 | Spent: $32,000
   - Progress: 45%
   - Manager: Sarah Chen
   - Team: 2 members
   - Due: Mar 31, 2025

### Tasks (6+ tasks across projects)
- Various statuses: In Progress, Pending, Complete
- Different priorities: High, Medium, Low
- Real subtasks and comments
- Time tracking data
- File attachments

### Additional Data
- **2 Goals** tracking project completion
- **2 Milestones** with dependencies
- **2 Documents** with project requirements
- **Multiple Notifications** showing system activity
- **2 Workspaces** organizing projects
- **Task Comments** showing team collaboration

## Real Data Integration

### All Data is Real
- ✅ **Stored in Supabase** - Not mock data
- ✅ **Real-time synchronization** - Changes appear instantly across all users
- ✅ **Persistent** - Data persists across sessions
- ✅ **Searchable** - All data is indexed and searchable
- ✅ **Relational** - Projects → Tasks → Subtasks → Comments

### What You Can Do

#### Create & Edit
- Create new projects, tasks, goals, documents
- Edit existing data (names, descriptions, statuses)
- Update progress, budgets, and timelines
- Add comments and attachments to tasks
- Create subtasks and check them off

#### Delete
- Remove tasks, projects, or other entities
- Changes are immediate and permanent
- Relationships are maintained (cascading deletes where appropriate)

#### Real-Time Collaboration
- Open the app in multiple tabs/browsers
- Make a change in one place
- See it update instantly in another
- Team collaboration features fully functional

#### Analytics & Reporting
- All charts and stats use real database queries
- Filter and search across all data
- Export reports with actual data
- Dashboard aggregates live metrics

## Testing Scenarios

### Scenario 1: Task Management
1. Navigate to Tasks page
2. Create a new task
3. Assign it to a team member
4. Add subtasks and comments
5. Mark it complete
6. See notifications generated

### Scenario 2: Project Tracking
1. Go to Projects page
2. Click on "Website Redesign"
3. Update the progress
4. See budget utilization update
5. View related tasks
6. Check milestone progress

### Scenario 3: Team Collaboration
1. Open a task
2. Add a comment
3. Mention another user (@Sarah)
4. See notification created for that user
5. Check the activity feed

### Scenario 4: Reporting
1. Navigate to Reports page
2. View project completion rates (real data)
3. Check team workload distribution
4. Export report as PDF or Excel
5. Filter by date range or project

### Scenario 5: Time Tracking
1. Go to Tasks page → Time view
2. Start timer on a task
3. Let it run for a bit
4. Stop the timer
5. See actual hours update on task

## Database Structure

### Core Tables
- `users` - Team members and roles
- `projects` - Project management
- `tasks` - Task tracking with dependencies
- `goals` - Goal tracking
- `documents` - Knowledge base
- `milestones` - Project milestones
- `notifications` - User notifications
- `task_comments` - Discussion threads
- `task_attachments` - File uploads
- `subtasks` - Task breakdown
- `workspaces` - Project organization

### Security
- Row Level Security (RLS) enabled
- Tenant isolation
- Role-based access control
- Public/private project sharing

## Data Services

All modules use the service layer located in `src/services/`:

```typescript
// Example: Using project service
import { projectService } from './services/projectService';

// Get all projects
const { data, error } = await projectService.getAll();

// Create new project
const { data, error } = await projectService.create({
  name: 'New Project',
  status: 'Planning',
  budget: 100000
  // ... more fields
});

// Update project
const { data, error } = await projectService.update(id, {
  progress: 75,
  status: 'Active'
});

// Real-time subscription
const subscription = projectService.subscribeToProjects((payload) => {
  console.log('Project changed:', payload);
});
```

## Alternative Login Methods

### Manual Login
You can also log in manually with demo credentials:

- **Organization Domain:** demo
- **Email:** demo@demo.com
- **Password:** demo123

### Other Demo Users
You can test with different roles:

- **john@demo.com** - Admin role
- **sarah@demo.com** - Manager role
- **mike@demo.com** - Member role
- **alex@demo.com** - Member (Design)
- **emily@demo.com** - Member (Engineering)

## Development Notes

### Environment Setup
The application requires Supabase credentials in `.env`:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Database Migrations
All migrations are in `supabase/migrations/`:
- Initial schema setup
- Comprehensive tables
- Demo seed data
- RLS policies

### Real-Time Features
- WebSocket connections via Supabase Realtime
- Automatic state synchronization
- Optimistic UI updates
- Conflict resolution

## Troubleshooting

### Can't See Demo Data?
1. Check that Supabase is configured (`.env` file)
2. Verify migrations were run successfully
3. Check browser console for errors
4. Try refreshing the page

### Changes Not Persisting?
1. Check network tab for API errors
2. Verify Supabase connection
3. Check RLS policies
4. Look for console errors

### Real-Time Not Working?
1. Check WebSocket connection
2. Verify Supabase Realtime is enabled
3. Check browser console for subscription errors
4. Try reconnecting

## Next Steps

Once you've explored the demo:

1. **Review the Code**
   - Check `src/services/` for data operations
   - Look at `src/hooks/useSupabaseData.ts` for React hooks
   - Review `src/contexts/` for state management

2. **Read Documentation**
   - `DATA_ARCHITECTURE.md` - Complete data architecture
   - `README.md` - Project overview

3. **Customize**
   - Add your own projects
   - Invite your team
   - Configure integrations
   - Customize workflows

4. **Deploy**
   - Set up production Supabase instance
   - Configure environment variables
   - Deploy to your hosting platform

## Support

For issues or questions:
- Check the documentation
- Review code comments
- Inspect browser console
- Check Supabase dashboard

Enjoy exploring the system! All data is real and fully functional.
