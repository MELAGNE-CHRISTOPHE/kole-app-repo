// src/pages/client/ClientProfilePage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button"; // Import Button if needed for logout styling
import { ChevronRight, Edit3, Bell, CreditCard, HelpCircle, Info, LogOut, Loader2 } from "lucide-react"; // Added Loader2
import ClientBottomNavBar from "../../components/ClientBottomNavBar";
import { getUserProfile, logoutUser, UserProfileData, ServiceError } from "../../services/userService"; // Import from userService
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';

interface ProfileMenuItemProps {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  isLogout?: boolean;
  disabled?: boolean; // Added disabled prop
}

const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({ icon: Icon, label, onClick, isLogout, disabled }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`w-full flex items-center justify-between p-3.5 rounded-lg-kole transition-colors duration-150 
                ${isLogout 
                  ? "text-kole-destructive bg-kole-red-error/10 hover:bg-kole-red-error/20"
                  : "text-kole-text-primary bg-white hover:bg-kole-hover-bg"}
                ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
  >
    <div className="flex items-center">
      <Icon size={20} className={`mr-3 ${isLogout ? "text-kole-destructive" : "text-kole-blue-primary"}`} />
      <span className={`text-sm font-medium ${isLogout ? "text-kole-destructive" : "text-kole-text-primary"}`}>{label}</span>
    </div>
    {!isLogout && <ChevronRight size={18} className="text-kole-text-tertiary" />}
  </button>
);

const ClientProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      const result = await getUserProfile();
      if (result.data) {
        setProfile(result.data);
      } else if (result.error) {
        toast.error(t(result.error.messageKey, { details: result.error.details }));
      }
      setIsLoading(false);
    };
    fetchProfile();
  }, [t]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const result = await logoutUser();
    if (result.error) {
      toast.error(t(result.error.messageKey, { details: result.error.details }));
    } else {
      // TODO: Implement actual auth context clearing, e.g., auth.signOut(); (from Firebase)
      // For now, we assume the context/global state would be cleared here.
      toast.success(t('clientProfilePage.logoutSuccess')); // Optional success message
      navigate("/login");
    }
    setIsLoggingOut(false);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col bg-kole-cream-bg items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-kole-blue-primary mb-4" />
        <p className="text-kole-text-secondary">{t('clientProfilePage.loadingProfile')}</p>
      </div>
    );
  }

  if (!profile) {
    // This case handles if loading is done but profile is still null (error occurred)
    // A more robust UI might show an error message and a retry button.
    // For now, the toast provides error feedback, and this prevents crashing.
    return (
      <div className="h-screen flex flex-col bg-kole-cream-bg items-center justify-center">
        <p className="text-kole-destructive">{t('userService.errors.fetchProfileFailed')}</p>
        {/* Optionally, add a button to retry fetching profile */}
         <ClientBottomNavBar />
      </div>
    );
  }

  const initials = `${profile.firstName.charAt(0)}${profile.lastName.charAt(0) || ''}`.toUpperCase();

  return (
    <div className="h-screen flex flex-col bg-kole-cream-bg">
      <div className="bg-kole-cream-bg p-4 pt-6 flex items-center sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-kole-text-primary ml-1">{t('clientProfilePage.title')}</h1>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-6">
        <div className="flex flex-col items-center text-center p-5 bg-white rounded-xl-kole shadow-sm border-kole-border">
          <Avatar className="h-24 w-24 mb-3 border-4 border-kole-blue-primary/50">
            <AvatarImage src={profile.avatarUrl} alt={t('clientProfilePage.avatarAlt', { name: `${profile.firstName} ${profile.lastName}` })} />
            <AvatarFallback className="bg-kole-blue-primary text-white text-3xl">{initials}</AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-semibold text-kole-text-primary">{`${profile.firstName} ${profile.lastName}`}</h2>
          <p className="text-sm text-kole-text-secondary">{profile.email}</p>
          {profile.phoneNumber && <p className="text-sm text-kole-text-secondary">{profile.phoneNumber}</p>}
        </div>

        <div className="space-y-2.5">
          <ProfileMenuItem icon={Edit3} label={t('clientProfilePage.editInfo')} onClick={() => console.log("Navigate to Edit Info")} />
          <ProfileMenuItem icon={Bell} label={t('clientProfilePage.notificationPrefs')} onClick={() => console.log("Navigate to Notification Preferences")} />
          <ProfileMenuItem icon={CreditCard} label={t('clientProfilePage.managePayments')} onClick={() => console.log("Navigate to Manage Payments")} />
          <ProfileMenuItem icon={HelpCircle} label={t('clientProfilePage.helpSupport')} onClick={() => console.log("Navigate to Help & Support")} />
          <ProfileMenuItem icon={Info} label={t('clientProfilePage.aboutKole')} onClick={() => console.log("Navigate to About Kôlê")} />
        </div>

        <div className="pt-2">
            <ProfileMenuItem
              icon={isLoggingOut ? Loader2 : LogOut}
              label={isLoggingOut ? t('clientProfilePage.loggingOut') : t('clientProfilePage.logout')}
              onClick={handleLogout}
              isLogout
              disabled={isLoggingOut}
            />
        </div>
      </div>
      <ClientBottomNavBar />
    </div>
  );
};

export default ClientProfilePage;
