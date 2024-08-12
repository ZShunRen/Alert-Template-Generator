import React from 'react';
import ResponsiveAppBar from './header';


const Layout = ({ children }) => {
  return (
    <div>
      <ResponsiveAppBar />
      <main>{children}</main>
    </div>
  );
};

export default Layout;