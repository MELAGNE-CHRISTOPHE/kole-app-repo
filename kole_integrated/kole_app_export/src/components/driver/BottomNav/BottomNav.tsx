import React from 'react';

// TODO: Replace with actual icons (e.g., from an icon library or SVG files)
const IconPlaceholder = ({ name, size = 24 }: { name: string; size?: number }) => (
  <div style={{ width: size, height: size, border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
    {name.substring(0, 1)}
  </div>
);

interface NavItemProps {
  iconName: string;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ iconName, label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center flex-1 p-2 transition-colors duration-200 
                  ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
    >
      <IconPlaceholder name={iconName} />
      <span className={`mt-1 text-xs ${isActive ? 'font-semibold' : ''}`}>{label}</span>
    </button>
  );
};

interface BottomNavProps {
  activeItem?: string;
  onNavigate?: (item: string) => void;
}

const navItems = [
  { id: 'home', label: 'Accueil', icon: 'HomeIcon' }, // Corresponds to ChauffeurScreen
  { id: 'rides', label: 'Courses', icon: 'ListIcon' },
  { id: 'earnings', label: 'Revenus', icon: 'ChartIcon' },
  { id: 'profile', label: 'Profil', icon: 'UserIcon' },
];

const BottomNav: React.FC<BottomNavProps> = ({ activeItem = 'home', onNavigate }) => {
  const handleItemClick = (itemId: string) => {
    if (onNavigate) {
      onNavigate(itemId);
    }
    // TODO: Implement actual navigation logic (e.g., using React Router)
    console.log(`Navigating to ${itemId}`);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-t-md flex justify-around border-t border-gray-200">
      {navItems.map((item) => (
        <NavItem
          key={item.id}
          iconName={item.icon}
          label={item.label}
          isActive={activeItem === item.id}
          onClick={() => handleItemClick(item.id)}
        />
      ))}
    </nav>
  );
};

export default BottomNav;

