// src/pages/client/ClientProfilePage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
// import { Button } from "../../components/ui/button";
import { ChevronRight, Edit3, Bell, CreditCard, HelpCircle, Info, LogOut /*, ArrowLeft */ } from "lucide-react";
import ClientBottomNavBar from "../../components/ClientBottomNavBar";

// Dummy user data - replace with actual data from context or API
const userData = {
  firstName: "Prénom",
  lastName: "Nom",
  email: "utilisateur@example.com",
  avatarUrl: "/home/ubuntu/kole_project/design_mockups/client/Client_Profil_Parametres.png", // Placeholder
};

const ProfileMenuItem: React.FC<{ icon: React.ElementType; label: string; onClick?: () => void; isLogout?: boolean }> = ({ icon: Icon, label, onClick, isLogout }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between p-3.5 rounded-lg-kole transition-colors duration-150 
                ${isLogout 
                  ? "text-kole-red-error bg-kole-red-error/10 hover:bg-kole-red-error/20" 
                  : "text-kole-text-primary bg-white hover:bg-kole-hover-bg"}`}
  >
    <div className="flex items-center">
      <Icon size={20} className={`mr-3 ${isLogout ? "text-kole-red-error" : "text-kole-blue-primary"}`} />
      <span className={`text-sm font-medium ${isLogout ? "text-kole-red-error" : "text-kole-text-primary"}`}>{label}</span>
    </div>
    {!isLogout && <ChevronRight size={18} className="text-kole-text-tertiary" />}
  </button>
);

const ClientProfilePage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: Implement actual logout logic (clear auth tokens, redirect to login)
    console.log("User logged out");
    navigate("/login"); 
  };

  return (
    <div className="h-screen flex flex-col bg-kole-cream-bg">
      {/* Header */}
      <div className="bg-kole-cream-bg p-4 pt-6 flex items-center sticky top-0 z-10">
         {/* <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-200/50">
          <ArrowLeft size={24} className="text-kole-text-primary" />
        </button> */}
        <h1 className="text-2xl font-bold text-kole-text-primary ml-1">Mon Profil</h1>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-6">
        {/* User Info Section */}
        <div className="flex flex-col items-center text-center p-5 bg-white rounded-xl-kole shadow-sm border-kole-border">
          <Avatar className="h-24 w-24 mb-3 border-4 border-kole-blue-primary/50">
            <AvatarImage src={`https://ui-avatars.com/api/?name=${userData.firstName}+${userData.lastName}&background=0D8ABC&color=fff&size=128&font-size=0.4`} alt={`${userData.firstName} ${userData.lastName}`} />
            <AvatarFallback className="bg-kole-blue-primary text-white text-3xl">{userData.firstName.charAt(0)}{userData.lastName.charAt(0)}</AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-semibold text-kole-text-primary">{`${userData.firstName} ${userData.lastName}`}</h2>
          <p className="text-sm text-kole-text-secondary">{userData.email}</p>
        </div>

        {/* Menu Items Section */}
        <div className="space-y-2.5">
          <ProfileMenuItem icon={Edit3} label="Modifier mes informations" onClick={() => console.log("Navigate to Edit Info")} />
          <ProfileMenuItem icon={Bell} label="Préférences de notification" onClick={() => console.log("Navigate to Notification Preferences")} />
          <ProfileMenuItem icon={CreditCard} label="Gérer les paiements" onClick={() => console.log("Navigate to Manage Payments")} />
          <ProfileMenuItem icon={HelpCircle} label="Aide et Support" onClick={() => console.log("Navigate to Help & Support")} />
          <ProfileMenuItem icon={Info} label="À propos de Kôlê" onClick={() => console.log("Navigate to About Kôlê")} />
        </div>

        {/* Logout Button */}
        <div className="pt-2">
            <ProfileMenuItem icon={LogOut} label="Se déconnecter" onClick={handleLogout} isLogout />
        </div>
      </div>
      <ClientBottomNavBar />
    </div>
  );
};

export default ClientProfilePage;

