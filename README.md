# ProjectFlow - Enterprise Project Management System

A comprehensive, real-time project management platform built with React, TypeScript, and Supabase.

## 🚀 Quick Start - Try Demo

**The fastest way to explore ProjectFlow:**

1. Launch the application
2. Click **"Try Demo Account"** button on the login page
3. Instantly access a fully-featured system with real data

For detailed demo access information, see **[DEMO_ACCESS.md](./DEMO_ACCESS.md)**

## ✨ Features

### Core Functionality
- ✅ **Project Management** - Create, track, and manage projects with budgets, timelines, and teams
- ✅ **Task Tracking** - Kanban boards, list views, subtasks, dependencies, and time tracking
- ✅ **Team Collaboration** - Real-time chat, comments, mentions, and notifications
- ✅ **Goal Setting** - Track organizational and project goals with progress metrics
- ✅ **Time Tracking** - Track billable hours, generate timesheets, and analyze productivity
- ✅ **Document Management** - Knowledge base with version control and search
- ✅ **Reporting & Analytics** - Real-time dashboards, custom reports, and data export

### Advanced Features
- ✅ **Real-Time Synchronization** - Instant updates across all connected users
- ✅ **Workspaces** - Organize projects into logical groups
- ✅ **Milestones** - Track project milestones with dependencies
- ✅ **Risk Management** - Identify, assess, and mitigate project risks
- ✅ **Change Requests** - Manage scope, timeline, and budget changes
- ✅ **Resource Management** - Allocate and track human and material resources
- ✅ **Workflow Automation** - Create custom automation rules
- ✅ **File Management** - Upload, organize, and share files
- ✅ **Multi-Tenancy** - Full organizational isolation and security
- ✅ **Role-Based Access Control** - Granular permissions and access control
- ✅ **Public Project Sharing** - Share projects publicly with custom permissions

### User Experience
- 🎨 **Modern UI** - Clean, intuitive interface with dark mode support
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 🔔 **Smart Notifications** - Context-aware alerts and activity feeds
- 🔍 **Global Search** - Search across projects, tasks, docs, and more
- 📊 **Visual Analytics** - Charts, graphs, and progress indicators
- ⚡ **Performance** - Optimized for speed with lazy loading and caching

## 🏗️ Architecture

### Technology Stack
- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Real-Time:** Supabase Realtime (WebSockets)
- **Auth:** Supabase Auth
- **Icons:** Lucide React
- **Date Handling:** date-fns
- **Exports:** jsPDF, xlsx

### Data Layer
All data operations use a service layer for type-safe database access:

```typescript
// Service Layer (src/services/)
projectService.ts  - Projects, milestones, risks, change requests
taskService.ts     - Tasks, comments, attachments, subtasks
userService.ts     - User management
goalService.ts     - Goal tracking
documentService.ts - Knowledge base

// React Hooks (src/hooks/)
useSupabaseData.ts - Real-time data hooks for all entities

// Contexts (src/contexts/)
ProjectContext, TaskContext, UserContext, etc. - State management
```

See **[DATA_ARCHITECTURE.md](./DATA_ARCHITECTURE.md)** for complete architecture documentation.

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (for production use)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Run migrations**
   Migrations are in `supabase/migrations/`. They run automatically via the Supabase CLI or can be applied through the Supabase dashboard.

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   ```

## 📂 Project Structure

```
project/
├── src/
│   ├── components/     # React components
│   ├── contexts/       # React contexts for state management
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities and configurations
│   ├── pages/          # Page components
│   ├── services/       # Data service layer
│   └── utils/          # Helper functions
├── supabase/
│   └── migrations/     # Database migrations
├── public/             # Static assets
├── DATA_ARCHITECTURE.md   # Complete data architecture guide
├── DEMO_ACCESS.md         # Demo account access guide
└── README.md              # This file
```

## 🗄️ Database Schema

### Core Tables
- **users** - User accounts and profiles
- **projects** - Project management with budgets and timelines
- **tasks** - Task tracking with dependencies and time tracking
- **goals** - Organizational and project goals
- **documents** - Knowledge base and documentation
- **milestones** - Project milestones with dependencies
- **risks** - Risk management
- **change_requests** - Change control
- **resources** - Resource allocation
- **workspaces** - Project organization
- **notifications** - User notifications
- **time_entries** - Time tracking
- **task_comments** - Task discussions
- **task_attachments** - File attachments
- **subtasks** - Task breakdown
- **chat_channels** - Team communication
- **chat_messages** - Chat history
- **automations** - Workflow automation
- **files** - File management
- **tenants** - Multi-tenancy
- **tenant_members** - Team membership

All tables have Row Level Security (RLS) enabled for security.

## 🔒 Security

- **Row Level Security (RLS)** - All tables protected with RLS policies
- **Tenant Isolation** - Complete data separation between organizations
- **Role-Based Access** - Owner, Admin, Manager, Member, Viewer roles
- **Audit Logging** - Track all important actions
- **Secure Authentication** - Supabase Auth with OAuth support
- **Data Encryption** - At rest and in transit

## 🚢 Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy dist/ folder to Vercel
```

### Netlify
```bash
npm run build
# Deploy dist/ folder to Netlify
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 📊 Demo Data

The application includes comprehensive demo data:
- 6 demo users with different roles
- 3 projects with realistic budgets and timelines
- 6+ tasks across projects
- Goals, milestones, documents, and notifications
- Comments, subtasks, and time entries

All demo data is stored in Supabase and fully functional.

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🐛 Known Issues

- Chunk size warning during build (expected for this feature set)
- Browserslist database may need updating (cosmetic warning)

## 🔮 Roadmap

- [ ] Advanced reporting with custom report builder
- [ ] Mobile apps (iOS/Android)
- [ ] Integrations with Slack, Jira, GitHub
- [ ] AI-powered task suggestions
- [ ] Custom fields for all entities
- [ ] Advanced workflow automation
- [ ] Calendar integrations (Google Calendar, Outlook)
- [ ] Two-factor authentication
- [ ] SSO (SAML, OAuth)
- [ ] Custom branding for enterprise

## 📚 Documentation

- **[DEMO_ACCESS.md](./DEMO_ACCESS.md)** - How to access and use the demo
- **[DATA_ARCHITECTURE.md](./DATA_ARCHITECTURE.md)** - Complete data architecture guide

## 🆘 Support

For issues, questions, or feature requests:
1. Check the documentation
2. Review existing issues
3. Create a new issue with details

## 🎯 Credits

Built with:
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/)
- [Lucide Icons](https://lucide.dev/)

---

**Ready to get started?** Click the "Try Demo Account" button and explore! 🚀
