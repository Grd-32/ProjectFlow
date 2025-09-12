import React from 'react';
import Sidebar from './Sidebar';
import TopNavigation from './TopNavigation';
import ResponsiveLayout from './ResponsiveLayout';
import MobileNavigation from './MobileNavigation';
import VoiceCommands from './VoiceCommands';

interface LayoutProps {
  children: React.ReactNode;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, voiceEnabled, onToggleVoice }) => {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <ResponsiveLayout
        sidebar={<Sidebar />}
        topNav={<TopNavigation />}
      >
        <div className="flex-1 overflow-auto pb-16 md:pb-0">
          {children}
        </div>
      </ResponsiveLayout>
      <MobileNavigation />
      <VoiceCommands isEnabled={voiceEnabled} onToggle={onToggleVoice} />
    </div>
  );
};

export default Layout;