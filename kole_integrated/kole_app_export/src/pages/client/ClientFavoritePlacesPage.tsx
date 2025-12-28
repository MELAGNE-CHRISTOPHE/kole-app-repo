// src/pages/client/ClientFavoritePlacesPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from '../../components/ui/dialog'; // For Add/Edit
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"; // For Delete
import { ArrowLeft, PlusCircle, Home, Briefcase, Trash2, MapPin, Loader2, AlertTriangle } from 'lucide-react';
import ClientBottomNavBar from '../../components/ClientBottomNavBar';
import * as userService from '../../services/userService';
import * as mapService from '../../services/mapService';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { debounce } from '../../utils/debounce';
import { cn } from '@/lib/utils';

interface FavoritePlaceFormData {
  label: string;
  addressQuery: string; // For search input
}

const ClientFavoritePlacesPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [favoritePlaces, setFavoritePlaces] = useState<userService.FavoritePlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const [addressSuggestions, setAddressSuggestions] = useState<mapService.MapboxFeature[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [selectedAddressForForm, setSelectedAddressForForm] = useState<mapService.MapboxFeature | null>(null);
  const [currentAddressQuery, setCurrentAddressQuery] = useState("");


  const favoritePlaceSchema = z.object({
    label: z.string().min(1, { message: t("clientFavoritePlacesPage.validation.labelRequired") }),
    addressQuery: z.string().min(1, { message: t("clientFavoritePlacesPage.validation.addressRequired") }),
  });

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<FavoritePlaceFormData>({
    resolver: zodResolver(favoritePlaceSchema),
    mode: 'onChange',
  });
  const watchedAddressQuery = watch("addressQuery");


  const fetchFavoritePlaces = useCallback(async () => {
    setIsLoading(true);
    const result = await userService.getFavoritePlaces();
    if (result.data) {
      setFavoritePlaces(result.data);
    } else if (result.error) {
      toast.error(t(result.error.messageKey));
    }
    setIsLoading(false);
  }, [t]);

  useEffect(() => {
    fetchFavoritePlaces();
  }, [fetchFavoritePlaces]);

  const debouncedFetchAddressSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.length < 3) {
        setAddressSuggestions([]);
        setIsSuggestionsLoading(false);
        return;
      }
      setIsSuggestionsLoading(true);
      // Assuming user's current location isn't available or critical for favorite place search here
      const result = await mapService.getPlaceAutocomplete(query);
      if (result.data) {
        setAddressSuggestions(result.data);
      } else {
        setAddressSuggestions([]);
        if (result.error) toast.error(t(result.error.messageKey));
      }
      setIsSuggestionsLoading(false);
    }, 500),
    [t]
  );

  useEffect(() => {
    if (currentAddressQuery && currentAddressQuery.length >= 3 && !selectedAddressForForm) {
      debouncedFetchAddressSuggestions(currentAddressQuery);
    } else {
      setAddressSuggestions([]);
    }
  }, [currentAddressQuery, selectedAddressForForm, debouncedFetchAddressSuggestions]);


  const handleAddSubmit: SubmitHandler<FavoritePlaceFormData> = async (data) => {
    if (!selectedAddressForForm) {
      toast.error(t('clientFavoritePlacesPage.noAddressSelected'));
      return;
    }
    setIsLoading(true); // Use general loading or a specific one for add form
    const placeData: Omit<userService.FavoritePlace, 'id'> = {
      label: data.label,
      address: selectedAddressForForm.place_name,
      latitude: selectedAddressForForm.center[1],
      longitude: selectedAddressForForm.center[0],
    };
    const result = await userService.addFavoritePlace(placeData);
    if (result.data) {
      toast.success(t('userService.success.favoriteAdded'));
      fetchFavoritePlaces(); // Refresh list
      setShowAddForm(false);
      reset();
      setSelectedAddressForForm(null);
      setCurrentAddressQuery("");
    } else if (result.error) {
      toast.error(t(result.error.messageKey));
    }
    setIsLoading(false);
  };

  const handleDeleteFavorite = async (placeId: string) => {
    setIsLoading(true); // Can use a specific deleting state if preferred
    const result = await userService.deleteFavoritePlace(placeId);
    if (result.data?.success && result.data.messageKey) {
      toast.success(t(result.data.messageKey));
      fetchFavoritePlaces(); // Refresh list
    } else if (result.error) {
      toast.error(t(result.error.messageKey));
    }
    setIsLoading(false);
  };

  const handleAddressQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('addressQuery', e.target.value, {shouldValidate: true});
    setCurrentAddressQuery(e.target.value);
    setSelectedAddressForForm(null); // Clear selected address when typing
  }

  const handleSuggestionClick = (suggestion: mapService.MapboxFeature) => {
    setValue('addressQuery', suggestion.place_name, {shouldValidate: true});
    setCurrentAddressQuery(suggestion.place_name);
    setSelectedAddressForForm(suggestion);
    setAddressSuggestions([]);
  }

  const getIconForLabel = (label: string) => {
    if (label.toLowerCase().includes('maison') || label.toLowerCase().includes('home')) return <Home className="h-5 w-5 text-kole-blue-primary mr-3 flex-shrink-0" />;
    if (label.toLowerCase().includes('travail') || label.toLowerCase().includes('bureau') || label.toLowerCase().includes('work')) return <Briefcase className="h-5 w-5 text-kole-blue-primary mr-3 flex-shrink-0" />;
    return <MapPin className="h-5 w-5 text-kole-text-secondary mr-3 flex-shrink-0" />;
  };


  return (
    <div className="h-screen flex flex-col bg-kole-cream-bg">
      <div className="bg-white shadow-sm p-4 flex items-center border-b border-kole-border sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-2 hover:bg-kole-hover-bg rounded-full">
          <ArrowLeft className="h-5 w-5 text-kole-text-primary" />
        </Button>
        <h1 className="text-lg font-semibold text-kole-text-primary">{t('clientFavoritePlacesPage.pageTitle')}</h1>
      </div>

      <ScrollArea className="flex-grow p-4">
        <div className="mb-4">
          <Dialog open={showAddForm} onOpenChange={(open) => {
            setShowAddForm(open);
            if (!open) {
              reset(); // Reset form when dialog closes
              setSelectedAddressForForm(null);
              setCurrentAddressQuery("");
              setAddressSuggestions([]);
            }
          }}>
            <DialogTrigger asChild>
              <Button className="w-full kole-btn-primary" onClick={() => setShowAddForm(true)}>
                <PlusCircle className="mr-2 h-5 w-5" /> {t('clientFavoritePlacesPage.addFavoriteButton')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white kole-card border-kole-border">
              <DialogHeader>
                <DialogTitle className="text-kole-text-primary">{t('clientFavoritePlacesPage.addFavoriteButton')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(handleAddSubmit)} className="space-y-4 pt-4">
                <div>
                  <label htmlFor="label" className="block text-sm font-medium text-kole-text-dark mb-1">{t('clientFavoritePlacesPage.labelLabel')}</label>
                  <Input id="label" placeholder={t('clientFavoritePlacesPage.labelPlaceholder')} {...register("label")} className="kole-input" />
                  {errors.label && <p className="text-xs text-red-500 mt-1">{errors.label.message}</p>}
                </div>
                <div className="relative">
                  <label htmlFor="addressQuery" className="block text-sm font-medium text-kole-text-dark mb-1">{t('clientFavoritePlacesPage.addressLabel')}</label>
                  <Input
                    id="addressQuery"
                    placeholder={t('clientFavoritePlacesPage.addressPlaceholder')}
                    {...register("addressQuery", { onChange: handleAddressQueryChange })}
                    className="kole-input"
                    autoComplete="off"
                  />
                  {errors.addressQuery && <p className="text-xs text-red-500 mt-1">{errors.addressQuery.message}</p>}

                  { (isSuggestionsLoading || addressSuggestions.length > 0 || (currentAddressQuery.length >=3 && !isSuggestionsLoading && !selectedAddressForForm)) &&
                    <Card className="absolute z-20 w-full mt-1 kole-card border-kole-border max-h-40 overflow-y-auto">
                      <CardContent className="p-0">
                        {isSuggestionsLoading && <div className="p-3 text-sm text-kole-text-secondary flex items-center justify-center"><Loader2 className="h-4 w-4 animate-spin mr-2" />{t('clientSearch.loadingSuggestions')}</div>}
                        {!isSuggestionsLoading && addressSuggestions.map(s => (
                          <button type="button" key={s.id} onClick={() => handleSuggestionClick(s)} className="flex items-center w-full text-left p-3 hover:bg-kole-hover-bg border-b border-kole-border last:border-b-0">
                             <MapPin className="h-4 w-4 text-kole-text-secondary mr-2 flex-shrink-0" />
                            <span className="text-sm text-kole-text-primary truncate">{s.place_name}</span>
                          </button>
                        ))}
                         {!isSuggestionsLoading && addressSuggestions.length === 0 && currentAddressQuery.length >=3 && !selectedAddressForForm &&
                            <div className="p-3 text-sm text-kole-text-secondary text-center">{t('clientSearch.noResults', {query: currentAddressQuery})}</div>
                        }
                      </CardContent>
                    </Card>
                  }
                </div>
                <DialogFooter className="pt-4">
                  <DialogClose asChild>
                    <Button type="button" variant="outline" className="kole-btn-outline">{t('clientFavoritePlacesPage.buttons.cancel')}</Button>
                  </DialogClose>
                  <Button type="submit" className="kole-btn-primary" disabled={isLoading || !selectedAddressForForm}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isLoading ? t('clientFavoritePlacesPage.buttons.saving') : t('clientFavoritePlacesPage.buttons.save')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading && favoritePlaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-10">
            <Loader2 className="h-10 w-10 animate-spin text-kole-blue-primary mb-3" />
            <p className="text-kole-text-secondary">{t('clientFavoritePlacesPage.loadingFavorites')}</p>
          </div>
        ) : !isLoading && favoritePlaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-10">
            <AlertTriangle className="h-12 w-12 text-kole-text-tertiary mb-3" />
            <p className="text-lg font-medium text-kole-text-primary mb-1">{t('clientFavoritePlacesPage.emptyFavorites')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {favoritePlaces.map((place) => (
              <Card key={place.id} className="kole-card border-kole-border bg-white">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center overflow-hidden">
                    {getIconForLabel(place.label)}
                    <div className="overflow-hidden">
                      <p className="text-sm font-semibold text-kole-text-primary truncate" title={place.label}>{place.label}</p>
                      <p className="text-xs text-kole-text-secondary truncate" title={place.address}>{place.address}</p>
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-kole-destructive hover:bg-kole-destructive/10 hover:text-kole-destructive flex-shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-white kole-card border-kole-border">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-kole-text-primary">{t('clientFavoritePlacesPage.confirmDeleteTitle')}</AlertDialogTitle>
                        <AlertDialogDescription className="text-kole-text-secondary">
                          {t('clientFavoritePlacesPage.confirmDeleteMessage', { label: place.label })}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="kole-btn-outline">{t('clientFavoritePlacesPage.buttons.cancel')}</AlertDialogCancel>
                        <AlertDialogAction className="kole-btn-destructive" onClick={() => handleDeleteFavorite(place.id)} disabled={isLoading}>
                           {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                           {t('clientFavoritePlacesPage.buttons.confirmDelete')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
      <ClientBottomNavBar />
    </div>
  );
};

export default ClientFavoritePlacesPage;
