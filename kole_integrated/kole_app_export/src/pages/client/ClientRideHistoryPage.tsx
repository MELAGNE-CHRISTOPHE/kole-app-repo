// src/pages/client/ClientRideHistoryPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ScrollArea } from '../../components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input"; // Added Input
import { Calendar as CalendarIcon, ArrowLeft, Filter, Loader2, MapPin, AlertTriangle, Search as SearchIcon, X as XIcon } from 'lucide-react'; // Added SearchIcon, XIcon
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from "@/components/ui/popover";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { debounce } from '@/utils/debounce'; // Assuming debounce utility path
import ClientBottomNavBar from '../../components/ClientBottomNavBar';
import { getRideHistory, RideHistoryEntry, RideHistoryFilters } from '../../services/rideService';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const ClientRideHistoryPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [rides, setRides] = useState<RideHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Filter state
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [activeFilters, setActiveFilters] = useState<RideHistoryFilters>({});
  const [tempDateFrom, setTempDateFrom] = useState<Date | undefined>(undefined);
  const [tempDateTo, setTempDateTo] = useState<Date | undefined>(undefined);
  const [tempStatusKey, setTempStatusKey] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');


  const fetchHistory = async (page: number, filters: RideHistoryFilters = activeFilters) => {
    setIsLoading(true);
    // Ensure searchTerm from input is part of the filters for this specific fetch
    const currentFilters = { ...filters, searchTerm: searchTerm || undefined };
    const result = await getRideHistory(page, 5, currentFilters);
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
    fetchHistory(currentPage, activeFilters);
  }, [currentPage, activeFilters, t]); // searchTerm changes will trigger activeFilters update, then this effect

  // Debounced function to apply search term to activeFilters
  const debouncedApplySearch = React.useCallback(
    debounce((newSearchTerm: string) => {
      setActiveFilters(prevFilters => ({
        ...prevFilters,
        searchTerm: newSearchTerm.trim() === '' ? undefined : newSearchTerm.trim(),
      }));
      setCurrentPage(1); // Reset to first page on new search
    }, 500),
    [] // No dependencies, this callback is stable
  );

  useEffect(() => {
    debouncedApplySearch(searchTerm);
  }, [searchTerm, debouncedApplySearch]);

  const handleOpenFilterSheet = () => {
    setTempDateFrom(activeFilters.dateFrom);
    setTempDateTo(activeFilters.dateTo);
    setTempStatusKey(activeFilters.statusKey);
    setShowFilterSheet(true);
  };

  const handleApplyFilters = () => {
    setActiveFilters({
      dateFrom: tempDateFrom,
      dateTo: tempDateTo,
      statusKey: tempStatusKey,
    });
    setCurrentPage(1); // Reset to first page when filters change
    setShowFilterSheet(false);
  };

  const handleResetFilters = () => {
    setTempDateFrom(undefined);
    setTempDateTo(undefined);
    setTempStatusKey(undefined);
    // setSearchTerm(''); // Also clear search term input on full filter reset
    setActiveFilters({ searchTerm: searchTerm }); // Keep current search term or reset it if desired
    // If resetting search term too:
    setSearchTerm('');
    setActiveFilters({});

    setCurrentPage(1);
    setShowFilterSheet(false);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    // setActiveFilters(prev => ({ ...prev, searchTerm: undefined })); // This will be handled by useEffect on searchTerm
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handleRedoTrip = (ride: RideHistoryEntry) => {
    navigate('/client/booking', {
      state: {
        initialPickupAddress: ride.pickup,
        initialDestinationAddress: ride.destination,
        initialPickupCoords: ride.pickupCoordinates,
        initialDestinationCoords: ride.destinationCoordinates,
      }
    });
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
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-kole-border sticky top-0 z-20">
        <div className="p-4 flex items-center">
          <Button variant="ghost" size="icon" className="mr-2 hover:bg-kole-hover-bg rounded-full" onClick={() => navigate('/client')}>
            <ArrowLeft className="h-5 w-5 text-kole-text-primary" />
          </Button>
          <h1 className="text-lg font-semibold text-kole-text-primary">{t('clientRideHistoryPage.title')}</h1>
          <Sheet open={showFilterSheet} onOpenChange={setShowFilterSheet}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-auto hover:bg-kole-hover-bg rounded-full" aria-label={t('clientRideHistoryPage.filterButtonLabel')} onClick={handleOpenFilterSheet}>
                <Filter className="h-5 w-5 text-kole-text-primary" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="kole-card rounded-t-xl max-h-[80vh] flex flex-col">
              <SheetHeader className="p-4 border-b border-kole-border">
                <SheetTitle className="text-kole-text-primary">{t('clientRideHistoryPage.filters.title')}</SheetTitle>
              </SheetHeader>
              <ScrollArea className="flex-1 p-4 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-kole-text-primary mb-1.5">{t('clientRideHistoryPage.filters.dateRange')}</label>
                <div className="grid grid-cols-2 gap-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={`w-full justify-start text-left font-normal kole-input ${!tempDateFrom ? "text-kole-text-secondary" : "text-kole-text-primary"}`}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {tempDateFrom ? format(tempDateFrom, "PPP", { locale: fr }) : <span>{t('clientRideHistoryPage.filters.from')}</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 kole-card" align="start">
                      <Calendar mode="single" selected={tempDateFrom} onSelect={setTempDateFrom} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={`w-full justify-start text-left font-normal kole-input ${!tempDateTo ? "text-kole-text-secondary" : "text-kole-text-primary"}`}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {tempDateTo ? format(tempDateTo, "PPP", { locale: fr }) : <span>{t('clientRideHistoryPage.filters.to')}</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 kole-card" align="start">
                      <Calendar mode="single" selected={tempDateTo} onSelect={setTempDateTo} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div>
                <label htmlFor="status-filter" className="block text-sm font-medium text-kole-text-primary mb-1.5">{t('clientRideHistoryPage.filters.status')}</label>
                <Select value={tempStatusKey || 'ALL'} onValueChange={(value) => setTempStatusKey(value === 'ALL' ? undefined : value)}>
                  <SelectTrigger id="status-filter" className="kole-input text-kole-text-primary">
                    <SelectValue placeholder={t('clientRideHistoryPage.filters.allStatuses')} />
                  </SelectTrigger>
                  <SelectContent className="kole-card">
                    <SelectItem value="ALL">{t('clientRideHistoryPage.filters.allStatuses')}</SelectItem>
                    <SelectItem value="rideStatuses.completed">{t('rideStatuses.completed')}</SelectItem>
                    <SelectItem value="rideStatuses.cancelled">{t('rideStatuses.cancelled')}</SelectItem>
                    {/* Add other relevant statuses here if needed */}
                  </SelectContent>
                </Select>
              </div>
            </ScrollArea>
            <SheetFooter className="p-4 border-t border-kole-border flex flex-row gap-2">
              <Button variant="outline" className="kole-btn-outline flex-1" onClick={handleResetFilters}>{t('clientRideHistoryPage.filters.reset')}</Button>
              <SheetClose asChild>
                <Button className="kole-btn-primary flex-1" onClick={handleApplyFilters}>{t('clientRideHistoryPage.filters.apply')}</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
        </div>
        {/* Search Input Area below header */}
        <div className="p-4 pt-0 bg-white">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-kole-text-secondary" />
            <Input
              type="search"
              placeholder={t('clientRideHistoryPage.filters.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="kole-input pl-10 pr-10 w-full"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 text-kole-text-secondary hover:bg-kole-hover-bg rounded-full"
                onClick={handleClearSearch}
                aria-label={t('clientRideHistoryPage.filters.clearSearch')}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>


      <ScrollArea className="flex-1 p-4">
        {isLoading && rides.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="h-12 w-12 animate-spin text-kole-blue-primary mb-4" />
            <p className="text-kole-text-secondary">{t('clientRideHistoryPage.loadingHistory')}</p>
          </div>
        ) : !isLoading && rides.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <AlertTriangle className="h-16 w-16 text-kole-text-tertiary mb-4" />
            <h2 className="text-xl font-semibold text-kole-text-primary mb-2">{t('clientRideHistoryPage.emptyStateTitle')}</h2>
            <p className="text-kole-text-secondary">
              {Object.values(activeFilters).some(val => val !== undefined) // Check if any filter is active
                ? t('clientRideHistoryPage.emptyStateWithFiltersSubtitle', "Aucun trajet ne correspond à vos filtres.")
                : t('clientRideHistoryPage.emptyStateSubtitle')}
            </p>
            {Object.keys(activeFilters).length > 0 && (
                <Button variant="link" onClick={handleResetFilters} className="mt-2 text-kole-blue-primary">
                    {t('clientRideHistoryPage.filters.reset')}
                </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Display active filters summary */}
            {Object.values(activeFilters).some(val => val !== undefined) && (
               <div className="p-3 mb-3 bg-kole-blue-primary/10 rounded-lg text-sm text-kole-blue-dark space-x-2">
                 <span>{t('clientRideHistoryPage.filters.filtersAppliedInfo', "Filtres actifs:")}</span>
                 {activeFilters.searchTerm && <span>{t('clientRideHistoryPage.filters.activeSearchText', { term: activeFilters.searchTerm })}</span>}
                 {activeFilters.dateFrom && <span>{t('clientRideHistoryPage.filters.from')} {format(activeFilters.dateFrom, "PPP", { locale: fr })}</span>}
                 {activeFilters.dateTo && <span>{t('clientRideHistoryPage.filters.to')} {format(activeFilters.dateTo, "PPP", { locale: fr })}</span>}
                 {activeFilters.statusKey && <span>{t('clientRideHistoryPage.filters.status')}: {t(activeFilters.statusKey)}</span>}
               </div>
            )}
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
                  <div className="mt-3 pt-3 border-t border-kole-border flex items-center gap-4">
                    <Button
                      variant="link"
                      size="sm"
                      className="text-kole-blue-primary hover:text-kole-blue-dark p-0 h-auto font-semibold"
                      onClick={() => handleRedoTrip(ride)}
                    >
                      {t('clientRideHistoryPage.buttons.redoTrip')}
                    </Button>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-kole-blue-primary hover:text-kole-blue-dark p-0 h-auto font-semibold"
                      onClick={() => navigate('/client/ride-receipt', { state: { ride } })}
                    >
                      {t('clientRideHistoryPage.buttons.viewReceipt')}
                    </Button>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-kole-red-destructive-text hover:text-kole-red-destructive-text/80 p-0 h-auto font-semibold" // Destructive link style
                      onClick={() => navigate('/client/report-issue', { state: { ride } })}
                    >
                      {t('clientRideHistoryPage.buttons.reportIssue')}
                    </Button>
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
