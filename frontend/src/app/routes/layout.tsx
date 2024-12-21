// app/layout.tsx
import React, { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div>
        <div className='navbar'>
         
        </div>
      {children}
    </div>
  );
};

export default Layout;
