// src/pages/client/ClientProfilePage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card"; // Added Card components
import { ChevronRight, Edit3, Bell, CreditCard, HelpCircle, Info, LogOut, Loader2, MapPin, BarChart3, TrendingUp, DollarSign, CalendarDays } from "lucide-react"; // Added more icons for stats
import ClientBottomNavBar from "../../components/ClientBottomNavBar";
import { getUserProfile, logoutUser, UserProfileData, getUserRideStats, UserRideStats } from "../../services/userService"; // Added UserRideStats and service
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
  const [isLoading, setIsLoading] = useState(true); // Combined loading state for profile
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [rideStats, setRideStats] = useState<UserRideStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); // For profile
      setIsLoadingStats(true);

      const profileResult = await getUserProfile();
      if (profileResult.data) {
        setProfile(profileResult.data);
      } else if (profileResult.error) {
        toast.error(t(profileResult.error.messageKey, { details: profileResult.error.details }));
      }
      setIsLoading(false); // Profile loading done

      const statsResult = await getUserRideStats();
      if (statsResult.data) {
        setRideStats(statsResult.data);
      } else if (statsResult.error) {
        toast.error(t(statsResult.error.messageKey));
      }
      setIsLoadingStats(false); // Stats loading done
    };
    fetchData();
  }, [t]);

  const handleLogout = async () => {
    setIsLoggingOut(true); // Keep this for logout button's own loading state
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

        {/* Ride Stats Section */}
        <Card className="kole-card border-kole-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-md font-semibold text-kole-text-primary">{t('clientProfilePage.rideStats.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-kole-blue-primary mr-2" />
                <span className="text-kole-text-secondary">{t('clientProfilePage.rideStats.loadingStats')}</span>
              </div>
            ) : rideStats ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div className="flex items-center">
                  <BarChart3 size={18} className="text-kole-blue-primary mr-2.5" />
                  <span className="text-kole-text-secondary">{t('clientProfilePage.rideStats.totalRides')}:</span>
                  <span className="font-semibold text-kole-text-primary ml-auto">{rideStats.totalRides}</span>
                </div>
                <div className="flex items-center">
                  <TrendingUp size={18} className="text-kole-blue-primary mr-2.5" />
                  <span className="text-kole-text-secondary">{t('clientProfilePage.rideStats.totalDistance')}:</span>
                  <span className="font-semibold text-kole-text-primary ml-auto">{rideStats.totalDistanceKm.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} {t('clientProfilePage.rideStats.kmUnit')}</span>
                </div>
                <div className="flex items-center">
                  <DollarSign size={18} className="text-kole-blue-primary mr-2.5" />
                  <span className="text-kole-text-secondary">{t('clientProfilePage.rideStats.totalSpent')}:</span>
                  <span className="font-semibold text-kole-text-primary ml-auto">{rideStats.totalSpentFCFA.toLocaleString()} {t('clientProfilePage.rideStats.currencyUnit')}</span>
                </div>
                {rideStats.memberSince && (
                  <div className="flex items-center">
                    <CalendarDays size={18} className="text-kole-blue-primary mr-2.5" />
                    <span className="text-kole-text-secondary">{t('clientProfilePage.rideStats.memberSince')}:</span>
                    <span className="font-semibold text-kole-text-primary ml-auto">{rideStats.memberSince}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-kole-text-secondary text-center py-4">{t('userService.errors.fetchRideStatsFailed')}</p> // Display error if stats failed but profile loaded
            )}
          </CardContent>
        </Card>

        <div className="space-y-2.5">
          <ProfileMenuItem icon={Edit3} label={t('clientProfilePage.editInfo')} onClick={() => navigate('/client/profile/edit')} />
          <ProfileMenuItem icon={MapPin} label={t('clientProfilePage.manageFavoritePlaces')} onClick={() => navigate('/client/profile/favorites')} />
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
