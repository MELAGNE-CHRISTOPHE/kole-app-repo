// src/components/driver/DriverTabBar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaList, FaWallet, FaUser } from 'react-icons/fa';
import '../../styles/theme.css';

const DriverTabBar: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <div className="tab-bar">
      <Link 
        to="/demo/driver/dashboard" 
        className={`tab-item ${pathname.includes('/dashboard') ? 'active' : ''}`}
      >
        <FaHome className={`tab-icon ${pathname.includes('/dashboard') ? 'text-[#0D6EFD]' : 'text-[#666666]'}`} />
        <span className={pathname.includes('/dashboard') ? 'text-[#0D6EFD] font-medium' : 'text-[#666666]'}>Accueil</span>
      </Link>
      <Link 
        to="/demo/driver/courses" 
        className={`tab-item ${pathname.includes('/courses') ? 'active' : ''}`}
      >
        <FaList className={`tab-icon ${pathname.includes('/courses') ? 'text-[#0D6EFD]' : 'text-[#666666]'}`} />
        <span className={pathname.includes('/courses') ? 'text-[#0D6EFD] font-medium' : 'text-[#666666]'}>Courses</span>
      </Link>
      <Link 
        to="/demo/driver/revenus" 
        className={`tab-item ${pathname.includes('/revenus') ? 'active' : ''}`}
      >
        <FaWallet className={`tab-icon ${pathname.includes('/revenus') ? 'text-[#0D6EFD]' : 'text-[#666666]'}`} />
        <span className={pathname.includes('/revenus') ? 'text-[#0D6EFD] font-medium' : 'text-[#666666]'}>Revenus</span>
      </Link>
      <Link 
        to="/demo/driver/profil" 
        className={`tab-item ${pathname.includes('/profil') ? 'active' : ''}`}
      >
        <FaUser className={`tab-icon ${pathname.includes('/profil') ? 'text-[#0D6EFD]' : 'text-[#666666]'}`} />
        <span className={pathname.includes('/profil') ? 'text-[#0D6EFD] font-medium' : 'text-[#666666]'}>Profil</span>
      </Link>
    </div>
  );
};

export default DriverTabBar;
