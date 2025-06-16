// src/components/ClientBottomNavBar.tsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, ListCollapse, Wallet, UserCircle } from "lucide-react";

const navItems = [
  { path: "/client/map", icon: Home, label: "Accueil" },
  { path: "/client/history", icon: ListCollapse, label: "Trajets" },
  { path: "/client/wallet", icon: Wallet, label: "Portefeuille" },
  { path: "/client/profile", icon: UserCircle, label: "Profil" }, // Correction du lien vers /client/profile
];

const ClientBottomNavBar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-t-lg border-t border-gray-200 md:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          // Ajustement de la logique isActive pour /client/map et /client/profile
          const isActive = location.pathname === item.path || 
                         (item.path === "/client/map" && location.pathname === "/dashboard" && !location.pathname.startsWith("/driver")) ||
                         (item.path === "/client/profile" && location.pathname === "/profile"); // Gérer le cas où /profile est utilisé pour le client
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center justify-center w-1/4 text-xs transition-colors duration-200 
                          ${isActive ? "text-kole-blue-primary" : "text-gray-500 hover:text-kole-blue-primary"}`}
            >
              <item.icon className={`h-6 w-6 mb-0.5 ${isActive ? "fill-kole-blue-primary opacity-20" : ""}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`${isActive ? "font-semibold" : "font-normal"}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default ClientBottomNavBar;

