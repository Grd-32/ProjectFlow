import React from 'react';
import Sidebar from './Sidebar';
import TopNavigation from './TopNavigation';
import ResponsiveLayout from './ResponsiveLayout';
import MobileNavigation from './MobileNavigation';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
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
      <VoiceCommands />
    </>
  );
};

export default Layout;