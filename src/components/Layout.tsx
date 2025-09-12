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
    <>
      <ResponsiveLayout
        sidebar={<Sidebar />}
        topNav={<TopNavigation />}
      >
        <div className="pb-16 md:pb-0">
          {children}
        </div>
      </ResponsiveLayout>
      <MobileNavigation />
      <VoiceCommands isEnabled={voiceEnabled} onToggle={onToggleVoice} />
    </>
  );
};

export default Layout;