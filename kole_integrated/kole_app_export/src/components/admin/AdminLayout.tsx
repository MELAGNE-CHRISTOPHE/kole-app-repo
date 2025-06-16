import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  MapPin,
  CreditCard,
  BarChart3,
  Settings
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/admin/dashboard' },
    { icon: UserCheck, label: 'Gestion Chauffeurs', path: '/admin/chauffeurs' },
    { icon: Users, label: 'Gestion Clients', path: '/admin/clients' },
    { icon: MapPin, label: 'Suivi des Trajets', path: '/admin/trajets' },
    { icon: CreditCard, label: 'Finance', path: '/admin/finance' },
    { icon: BarChart3, label: 'Statistiques', path: '/admin/statistiques' },
    { icon: Settings, label: 'Paramètres', path: '/admin/parametres' },
  ];

  const handleLogout = () => {
    navigate('/login');
  };

  const getCurrentPageTitle = () => {
    const currentItem = menuItems.find(item => item.path === location.pathname);
    return currentItem ? currentItem.label : 'Tableau de Bord';
  };

  return (
    <div className="admin-layout">
      {/* Sidebar exactement comme dans l'image dashboardadmin.png */}
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            Kôlê Admin
          </div>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
                           (item.path === '/admin/dashboard' && location.pathname === '/admin');
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
      
      {/* Zone de contenu principal avec header selon l'image */}
      <div className="admin-main">
        <header className="admin-header">
          <h1 className="header-title">{getCurrentPageTitle()}</h1>
          <div className="header-actions">
            <button
              onClick={handleLogout}
              className="disconnect-btn"
            >
              Déconnexion
            </button>
          </div>
        </header>
        
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

