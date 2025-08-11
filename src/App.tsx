import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './components/MultiLanguageSupport';
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
import OfflineMode from './components/OfflineMode';
import VoiceCommands from './components/VoiceCommands';
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
import { useState, useEffect } from 'react';

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <ThemeProvider>
      <LanguageProvider>
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
                          <OfflineMode isOnline={isOnline} />
                          <VoiceCommands 
                            isEnabled={voiceEnabled} 
                            onToggle={() => setVoiceEnabled(!voiceEnabled)} 
                          />
                        </ProjectProvider>
                      </TaskProvider>
                    </UserProvider>
                  </ChatProvider>
                </TimeTrackingProvider>
              </WorkspaceProvider>
            </AIProvider>
          </IntegrationProvider>
        </NotificationProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;