import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './components/MultiLanguageSupport';
import { NotificationProvider } from './contexts/NotificationContext';
import { TenantProvider } from './contexts/TenantContext';
import { UserProvider } from './contexts/UserContext';
import { TaskProvider } from './contexts/TaskContext';
import { ProjectProvider } from './contexts/ProjectContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import { TimeTrackingProvider } from './contexts/TimeTrackingContext';
import { ChatProvider } from './contexts/ChatContext';
import { IntegrationProvider } from './contexts/IntegrationContext';
import { AIProvider } from './contexts/AIContext';
import { useRealTimeSync } from './hooks/useRealTimeSync';
import { useAuth } from './contexts/AuthContext';
import { useTenant } from './contexts/TenantContext';
import Layout from './components/Layout';
import TrialBanner from './components/TrialBanner';
import OnboardingFlow from './components/OnboardingFlow';
import OfflineMode from './components/OfflineMode';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import MultiTenantAuth from './components/MultiTenantAuth';
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
import { useState } from 'react';


// Component to initialize real-time sync
const SyncInitializer = () => {
  useRealTimeSync();
  return null;
};

// Main App Content Component
const AppContent = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { currentTenant, trialInfo, isLoading: tenantLoading } = useTenant();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  React.useEffect(() => {
    // Show onboarding for new tenants
    if (currentTenant && !currentTenant.settings.onboardingCompleted) {
      setShowOnboarding(true);
    }
  }, [currentTenant]);

  if (authLoading || tenantLoading) {
    return <LoadingSpinner fullScreen text="Loading ProjectFlow..." size="lg" />;
  }


  if (!currentTenant) {
    return <MultiTenantAuth onAuthSuccess={() => window.location.reload()} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {trialInfo?.isActive && <TrialBanner />}
        
        <Layout>
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          <OfflineMode isOnline={isOnline} />
          <PWAInstallPrompt />
        </Layout>

        <OnboardingFlow
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          onComplete={() => setShowOnboarding(false)}
        />
      </div>
    </Router>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <NotificationProvider>
            {/* <AuthProvider> */}
              <TenantProvider>
                <UserProvider>
                  <SettingsProvider>
                    <IntegrationProvider>
                      <WorkspaceProvider>
                        <TimeTrackingProvider>
                          <AIProvider>
                            <ChatProvider>
                              <TaskProvider>
                                <ProjectProvider>
                                  <AppContent />
                                </ProjectProvider>
                              </TaskProvider>
                            </ChatProvider>
                          </AIProvider>
                        </TimeTrackingProvider>
                      </WorkspaceProvider>
                    </IntegrationProvider>
                  </SettingsProvider>
                </UserProvider>
              </TenantProvider>
            {/* </AuthProvider> */}
          </NotificationProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;