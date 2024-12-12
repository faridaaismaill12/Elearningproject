// app/layout.tsx
import React, { ReactNode } from 'react';
import Navbar from './_components/navbar/Navbar';
interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div>
        <div className='navbar'>
         <Navbar/>
        </div>
      {children}
    </div>
  );
};

export default Layout;
