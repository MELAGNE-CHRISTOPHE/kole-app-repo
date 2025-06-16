import React, { useState } from "react";
// import ChauffeurScreen from "../../components/driver/ChauffeurScreen"; // Temporairement commenté
import MinimalTestComponent from "../../components/driver/MinimalTestComponent"; // Import du composant de test
import { BottomNav } from "../../components/driver/BottomNav";
import { Toaster } from "sonner"; 

const ChauffeurDashboardPage: React.FC = () => {
  const [activeNav, setActiveNav] = useState("home");

  const handleNavigation = (navId: string) => {
    setActiveNav(navId);
    console.log(`Navigation vers la section : ${navId}`);
  };

  const renderContent = () => {
    switch (activeNav) {
      case "home":
        // return <ChauffeurScreen />;
        return <MinimalTestComponent />; // Utilisation du composant de test
      case "rides":
        return <div style={{padding: "20px", textAlign: "center"}}>Page Historique des Courses (à implémenter)</div>;
      case "earnings":
        return <div style={{padding: "20px", textAlign: "center"}}>Page Revenus (à implémenter)</div>;
      case "profile":
        return <div style={{padding: "20px", textAlign: "center"}}>Page Profil (à implémenter)</div>;
      default:
        // return <ChauffeurScreen />;
        return <MinimalTestComponent />; // Utilisation du composant de test par défaut
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Toaster richColors position="top-center" />
      <div style={{ flexGrow: 1, overflowY: "auto" }}>
        {renderContent()}
      </div>
      <BottomNav activeItem={activeNav} onNavigate={handleNavigation} />
    </div>
  );
};

export default ChauffeurDashboardPage;

