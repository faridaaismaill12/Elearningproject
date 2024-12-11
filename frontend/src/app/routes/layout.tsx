import React, { ReactNode } from 'react'
import Sidebar from './_components/sidebar/Sidebar'

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout">
    <Sidebar />
    <main className="main-content">
      {children}
    </main>
  </div>
  );
}

export default Layout;
 
