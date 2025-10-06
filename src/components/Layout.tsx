import React from 'react';
import Sidebar from './Sidebar';
import TopNavigation from './TopNavigation';
import ResponsiveLayout from './ResponsiveLayout';
import MobileNavigation from './MobileNavigation';
import { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [voiceEnabled, setVoiceEnabled] = useState(false);

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
    </div>
  );
};

export default Layout;