import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ArrowLeft, Star, Loader2 } from 'lucide-react'; // Added Loader2
import { Textarea } from '../../components/ui/textarea';
import * as rideService from '../../services/rideService'; // Import rideService
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const ClientRateRidePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    rideDetails: passedRideDetails, // Contains price, extraCharge
    driver: passedDriverDetails,
    bookingId: navBookingId
  } = location.state || {};

  // Fallback for driver details if not passed properly
  const driver = passedDriverDetails || {
    name: 'Chauffeur Kôlê',
    photo: `https://ui-avatars.com/api/?name=C+K&background=random&color=fff`,
  };

  // Fallback for ride details if not passed properly
  const ride = passedRideDetails || {
    price: 0,
    extraCharge: 0,
  };
  
  const bookingId = navBookingId || `mockBooking_${Date.now()}`; // Fallback bookingId

  const [rating, setRating] = useState(0); // Start with 0 to ensure user selects a rating
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmitRating = async () => {
    if (rating === 0) {
      toast.error(t('clientRateRidePage.validation.ratingRequired'));
      return;
    }
    setIsSubmitting(true);
    
    const ratingData: rideService.RatingData = {
      bookingId,
      rating,
      comment,
    };

    const result = await rideService.submitRideRating(ratingData);

    if (result.error) {
      toast.error(t(result.error.messageKey, { details: result.error.details }));
    } else if (result.data?.success && result.data.messageKey) {
      toast.success(t(result.data.messageKey));
      // Pass all necessary info to the completion page
      navigate('/client/ride-completed', {
        state: {
          rideDetails: { // This structure should match what ClientRideCompletedPage expects
            driver: driver, // The driver details
            price: ride.price,
            extraCharge: ride.extraCharge,
            rating: rating, // The rating given by user
            comment: comment, // The comment given by user
          },
          bookingId: bookingId // Pass bookingId if needed by completion page
        }
      });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col h-screen bg-kole-cream-bg">
      <div className="bg-white shadow-sm p-4 flex items-center border-b border-kole-border">
        <button onClick={() => navigate('/client')} className="mr-4 p-2 rounded-full hover:bg-kole-hover-bg">
          <ArrowLeft className="h-5 w-5 text-kole-text-primary" />
        </button>
        <h1 className="text-lg font-semibold text-kole-text-primary">{t('clientRateRidePage.pageTitle')}</h1>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        <Card className="mb-6 kole-card border-kole-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-kole-text-primary">{t('clientRateRidePage.cardTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full overflow-hidden mb-3">
                <img src={driver.photo} alt={driver.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="font-medium mb-4 text-kole-text-primary">{t('clientRateRidePage.driverIntro', { driverName: driver.name })}</h3>
              
              <div className="flex gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star} 
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                    aria-label={t('clientRateRidePage.aria.rateStars', { count: star })}
                  >
                    <Star 
                      className={`h-8 w-8 transition-colors ${star <= rating ? 'text-kole-orange-primary fill-kole-orange-primary' : 'text-kole-border hover:text-kole-orange-primary/70'}`}
                    />
                  </button>
                ))}
              </div>
              
              <Textarea
                placeholder={t('clientRateRidePage.commentPlaceholder')}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full mb-4 kole-input"
              />
              
              <Button 
                className="w-full kole-btn-primary"
                onClick={handleSubmitRating}
                disabled={isSubmitting || rating === 0}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('clientRateRidePage.buttons.submittingRating')}
                  </span>
                ) : (
                  t('clientRateRidePage.buttons.submitRating')
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="kole-card border-kole-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-kole-text-primary">{t('clientRateRidePage.rideDetailsTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <p className="text-sm text-kole-text-secondary">{t('clientRateRidePage.baseFareLabel')}</p>
                <p className="text-sm font-medium text-kole-text-primary">{ride.price} FCFA</p>
              </div>
              
              {ride.extraCharge > 0 && (
                <div className="flex justify-between">
                  <p className="text-sm text-kole-text-secondary">{t('clientRateRidePage.waitingFeeLabel')}</p>
                  <p className="text-sm font-medium text-kole-destructive">+{ride.extraCharge} FCFA</p>
                </div>
              )}
              
              <div className="flex justify-between border-t border-kole-border pt-2">
                <p className="font-medium text-kole-text-primary">{t('clientRateRidePage.totalLabel')}</p>
                <p className="font-medium text-kole-text-primary">{ride.price + (ride.extraCharge || 0)} FCFA</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientRateRidePage;
