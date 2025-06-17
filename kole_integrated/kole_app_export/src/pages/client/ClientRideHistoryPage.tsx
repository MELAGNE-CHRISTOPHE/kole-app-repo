// src/pages/client/ClientRideHistoryPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ScrollArea } from '../../components/ui/scroll-area';
import { ArrowLeft, Filter, Loader2, Calendar, MapPin, UserCircle, AlertTriangle } from 'lucide-react';
import ClientBottomNavBar from '../../components/ClientBottomNavBar';
import { getRideHistory, RideHistoryEntry, ServiceError } from '../../services/rideService';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Assuming Avatar is here

const ClientRideHistoryPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [rides, setRides] = useState<RideHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchHistory = async (page: number) => {
    setIsLoading(true);
    const result = await getRideHistory(page, 5); // Fetch 5 items per page
    if (result.data) {
      setRides(result.data);
      setTotalPages(result.totalPages);
      setCurrentPage(result.currentPage);
    } else if (result.error) {
      toast.error(t(result.error.messageKey, { details: result.error.details }));
      setRides([]); // Clear rides on error
      setTotalPages(0);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchHistory(currentPage);
  }, [currentPage, t]); // Added t to dependencies for toast messages

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const RideStatusBadge: React.FC<{ statusKey: string }> = ({ statusKey }) => {
    const statusText = t(statusKey);
    let bgColor = 'bg-kole-gray-light'; // Default or pending
    let textColor = 'text-kole-text-secondary';

    if (statusKey === 'rideStatuses.completed') {
      bgColor = 'bg-kole-green-light';
      textColor = 'text-kole-green-dark';
    } else if (statusKey === 'rideStatuses.cancelled') {
      bgColor = 'bg-kole-red-error/20'; // Lighter red
      textColor = 'text-kole-destructive';
    }
    // Add more conditions for other statuses if needed

    return (
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${bgColor} ${textColor}`}>
        {statusText}
      </span>
    );
  };


  return (
    <div className="flex flex-col h-screen bg-kole-cream-bg">
      <div className="bg-white shadow-sm p-4 flex items-center border-b border-kole-border sticky top-0 z-10">
        <Button variant="ghost" size="icon" className="mr-2 hover:bg-kole-hover-bg rounded-full" onClick={() => navigate('/client')}>
          <ArrowLeft className="h-5 w-5 text-kole-text-primary" />
        </Button>
        <h1 className="text-lg font-semibold text-kole-text-primary">{t('clientRideHistoryPage.title')}</h1>
        <Button variant="ghost" size="icon" className="ml-auto hover:bg-kole-hover-bg rounded-full" aria-label={t('clientRideHistoryPage.filterButtonLabel')}>
          <Filter className="h-5 w-5 text-kole-text-primary" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="h-12 w-12 animate-spin text-kole-blue-primary mb-4" />
            <p className="text-kole-text-secondary">{t('clientRideHistoryPage.loadingHistory')}</p>
          </div>
        ) : rides.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <AlertTriangle className="h-16 w-16 text-kole-text-tertiary mb-4" />
            <h2 className="text-xl font-semibold text-kole-text-primary mb-2">{t('clientRideHistoryPage.emptyStateTitle')}</h2>
            <p className="text-kole-text-secondary">{t('clientRideHistoryPage.emptyStateSubtitle')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rides.map((ride) => (
              <Card key={ride.id} className="kole-card border-kole-border overflow-hidden">
                <CardHeader className="p-4 bg-kole-cream-light border-b border-kole-border">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-semibold text-kole-text-primary">
                      {t('clientRideHistoryPage.labels.date')}: {ride.date}
                    </CardTitle>
                    <RideStatusBadge statusKey={ride.statusKey} />
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-kole-orange-primary mr-2.5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-kole-text-tertiary uppercase tracking-wider">{t('clientRideHistoryPage.labels.pickup')}</p>
                      <p className="text-sm text-kole-text-primary font-medium">{ride.pickup}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-kole-green-dark mr-2.5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-kole-text-tertiary uppercase tracking-wider">{t('clientRideHistoryPage.labels.destination')}</p>
                      <p className="text-sm text-kole-text-primary font-medium">{ride.destination}</p>
                    </div>
                  </div>
                  <div className="border-t border-kole-border my-2"></div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage src={ride.driverAvatarUrl} alt={ride.driverName} />
                        <AvatarFallback className="text-xs bg-kole-blue-primary text-white">
                          {ride.driverName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-sm text-kole-text-secondary">{t('clientRideHistoryPage.labels.driver')}: <span className="font-medium text-kole-text-primary">{ride.driverName}</span></p>
                    </div>
                    <p className="text-sm text-kole-text-secondary">{t('clientRideHistoryPage.labels.price')}: <span className="font-bold text-kole-text-primary">{ride.price}</span></p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>

      {totalPages > 0 && !isLoading && (
        <div className="p-4 border-t border-kole-border bg-white flex items-center justify-between sticky bottom-16 md:bottom-0">
          <Button
            variant="outline"
            className="kole-btn-outline"
            onClick={handlePreviousPage}
            disabled={currentPage <= 1 || isLoading}
          >
            {t('clientRideHistoryPage.pagination.previous')}
          </Button>
          <span className="text-sm text-kole-text-secondary">
            {t('clientRideHistoryPage.pagination.pageInfo', { currentPage, totalPages })}
          </span>
          <Button
            variant="outline"
            className="kole-btn-outline"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages || isLoading}
          >
            {t('clientRideHistoryPage.pagination.next')}
          </Button>
        </div>
      )}
      <ClientBottomNavBar />
    </div>
  );
};

export default ClientRideHistoryPage;
