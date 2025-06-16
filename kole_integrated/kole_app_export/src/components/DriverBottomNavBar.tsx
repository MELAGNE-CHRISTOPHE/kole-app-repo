// src/components/DriverBottomNavBar.tsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, ListCollapse, DollarSign, UserCircle } from "lucide-react"; // Remplacé ShieldCheck par Home pour Accueil

const navItemsDriver = [
  // Libellé et icône mis à jour pour "Accueil" selon le rapport
  { path: "/driver/dashboard", icon: Home, label: "Accueil" }, 
  { path: "/driver/history", icon: ListCollapse, label: "Courses" },
  { path: "/driver/earnings", icon: DollarSign, label: "Revenus" }, // "Gains" devient "Revenus" pour cohérence avec titre écran
  { path: "/driver/profile", icon: UserCircle, label: "Profil" }, // Chemin mis à jour pour pointer vers le profil chauffeur
];

const DriverBottomNavBar: React.FC = () => {
  const location = useLocation();

  const isDriverPage = location.pathname.startsWith("/driver/");

  if (!isDriverPage) {
    return null; 
  }

  return (
    // Barre de navigation blanche comme spécifié
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-t-lg border-t border-kole-divider md:hidden font-sans">
      <div className="flex justify-around items-center h-16">
        {navItemsDriver.map((item) => {
          // Logique d'activation simplifiée : l'item est actif si son chemin correspond au début du chemin actuel.
          // Cela gère le cas où /driver/dashboard est la page d'accueil du module chauffeur.
          const isActive = location.pathname.startsWith(item.path);
          
          return (
            <Link
              key={item.label}
              to={item.path}
              // Couleur active en bleu Kôlê, texte normal en gris secondaire
              className={`flex flex-col items-center justify-center w-1/4 text-xs transition-colors duration-200 
                          ${isActive ? "text-kole-blue-primary" : "text-kole-text-secondary hover:text-kole-blue-primary"}`}
            >
              {/* Icône active en bleu Kôlê, icône inactive avec couleur du texte */}
              <item.icon 
                className={`h-6 w-6 mb-0.5`} 
                strokeWidth={isActive ? 2.5 : 2} 
                color={isActive ? "#0052FF" : "currentColor"} // Assure que l'icône active est bleue
              />
              {/* Texte de l'icône active en gras */}
              <span className={`${isActive ? "font-semibold" : "font-normal"}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default DriverBottomNavBar;

