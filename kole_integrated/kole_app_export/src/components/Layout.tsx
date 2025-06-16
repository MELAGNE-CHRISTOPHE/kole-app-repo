// src/components/Layout.tsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout: React.FC = () => {
  const location = useLocation();
  
  // Chemins pour lesquels on ne veut pas afficher le Header/Footer
  const clientPaths = ["/client/book", "/client/searching", "/client/track-ride", "/client/rate-ride", "/client/history", "/client/wallet", "/client/topup", "/client/profile"];
  const driverPaths = ["/driver/dashboard", "/driver/navigate-to-client", "/driver/navigate-to-destination", "/driver/history", "/driver/earnings", "/driver/withdraw"];

  // Ne pas afficher Header/Footer sur les pages client et chauffeur qui ont leur propre nav
  if (clientPaths.some(path => location.pathname.startsWith(path)) || driverPaths.some(path => location.pathname.startsWith(path))) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0]">
      <Header />
      <main className="flex-grow py-4 md:py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
