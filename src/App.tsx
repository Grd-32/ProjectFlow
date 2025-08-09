import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider } from './contexts/UserContext';
import { TaskProvider } from './contexts/TaskContext';
import { ProjectProvider } from './contexts/ProjectContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import { TimeTrackingProvider } from './contexts/TimeTrackingContext';
import { ChatProvider } from './contexts/ChatContext';
import { IntegrationProvider } from './contexts/IntegrationContext';
import { AIProvider } from './contexts/AIContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Projects from './pages/Projects';
import Goals from './pages/Goals';
import Docs from './pages/Docs';
import Calendar from './pages/Calendar';
import Automations from './pages/Automations';
import Users from './pages/Users';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import ProjectManagement from './pages/ProjectManagement';

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <IntegrationProvider>
          <AIProvider>
            <WorkspaceProvider>
              <TimeTrackingProvider>
                <ChatProvider>
                  <UserProvider>
                    <TaskProvider>
                      <ProjectProvider>
                        <Router>
                          <Layout>
                            <Routes>
                              <Route path="/" element={<Dashboard />} />
                              <Route path="/tasks" element={<Tasks />} />
                              <Route path="/projects" element={<Projects />} />
                              <Route path="/goals" element={<Goals />} />
                              <Route path="/docs" element={<Docs />} />
                              <Route path="/calendar" element={<Calendar />} />
                              <Route path="/automations" element={<Automations />} />
                              <Route path="/users" element={<Users />} />
                              <Route path="/project-management" element={<ProjectManagement />} />
                              <Route path="/reports" element={<Reports />} />
                              <Route path="/settings" element={<Settings />} />
                            </Routes>
                          </Layout>
                        </Router>
                      </ProjectProvider>
                    </TaskProvider>
                  </UserProvider>
                </ChatProvider>
              </TimeTrackingProvider>
            </WorkspaceProvider>
          </AIProvider>
        </IntegrationProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;