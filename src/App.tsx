import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './components/MultiLanguageSupport';
import { UserProvider } from './contexts/UserContext';
import { TaskProvider } from './contexts/TaskContext';
import { ProjectProvider } from './contexts/ProjectContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import { TimeTrackingProvider } from './contexts/TimeTrackingContext';
import { ChatProvider } from './contexts/ChatContext';
import { IntegrationProvider } from './contexts/IntegrationContext';
import { AIProvider } from './contexts/AIContext';
import { useRealTimeSync } from './hooks/useRealTimeSync';
import Layout from './components/Layout';
import OfflineMode from './components/OfflineMode';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import LandingPage from './pages/LandingPage';
import ContactPage from './pages/ContactPage';
import DemoPage from './pages/DemoPage';
import ClientWebsite from './components/ClientWebsite';
import AccessRequestModal from './components/AccessRequestModal';
import AuthPage from './pages/AuthPage';
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


// Component to initialize real-time sync
const SyncInitializer = () => {
  useRealTimeSync();
  return null;
};

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showClientWebsite, setShowClientWebsite] = useState(true);
  const [showAccessRequest, setShowAccessRequest] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Simulate app initialization
    setTimeout(() => {
      setIsLoading(false);
      // Check if user is already authenticated
      const authToken = localStorage.getItem('auth-token');
      setIsAuthenticated(!!authToken);
    }, 2000);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Show client website first
  if (showClientWebsite) {
    return (
      <ErrorBoundary>
        <ThemeProvider>
          <LanguageProvider>
            <div>
              <ClientWebsite onNavigateToApp={() => setShowClientWebsite(false)} />
              <AccessRequestModal 
                isOpen={showAccessRequest} 
                onClose={() => setShowAccessRequest(false)} 
              />
            </div>
          </LanguageProvider>
        </ThemeProvider>
      </ErrorBoundary>
    );
  }

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Initializing ProjectFlow..." size="lg" />;
  }

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <ThemeProvider>
          <LanguageProvider>
            <UserProvider>
              <NotificationProvider>
                <TenantProvider>
                  <MultiTenantAuth onAuthSuccess={() => {
                    localStorage.setItem('auth-token', 'demo-token');
                    setIsAuthenticated(true);
                  }} />
                </TenantProvider>
              </NotificationProvider>
            </UserProvider>
          </LanguageProvider>
        </ThemeProvider>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <UserProvider>
            <NotificationProvider>
              <SettingsProvider>
                <IntegrationProvider>
                  <WorkspaceProvider>
                    <TimeTrackingProvider>
                      <AIProvider>
                        <ChatProvider>
                          <TaskProvider>
                            <ProjectProvider>
                              <Router>
                                <Layout voiceEnabled={voiceEnabled} onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}>
                                  <SyncInitializer />
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
                                  <OfflineMode />
                                  <PWAInstallPrompt />
                                </Layout>
                              </Router>
                            </ProjectProvider>
                          </TaskProvider>
                        </ChatProvider>
                      </AIProvider>
                    </TimeTrackingProvider>
                  </WorkspaceProvider>
                </IntegrationProvider>
              </SettingsProvider>
            </NotificationProvider>
          </UserProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;