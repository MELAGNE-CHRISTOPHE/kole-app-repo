import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ArrowLeft, Star, DollarSign } from 'lucide-react';
import { Textarea } from '../../components/ui/textarea';

const ClientRateRidePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const rideDetails = location.state || {
    driver: {
      name: 'Konan Kouadio',
      photo: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    price: 700,
    extraCharge: 0
  };
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Soumettre l'évaluation
  const submitRating = () => {
    setIsSubmitting(true);
    
    // Simuler un délai de soumission
    setTimeout(() => {
      navigate('/client/ride-completed', {
        state: {
          ...rideDetails,
          rating,
          comment
        }
      });
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Barre d'état supérieure */}
      <div className="bg-white shadow-sm p-4 flex items-center">
        <button onClick={() => navigate('/client')} className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-gray-800">Évaluer votre trajet</h1>
      </div>
      
      {/* Contenu principal */}
      <div className="flex-1 p-4 overflow-y-auto">
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Comment s'est passé votre trajet ?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full overflow-hidden mb-3">
                <img src={rideDetails.driver.photo} alt="Driver" className="w-full h-full object-cover" />
              </div>
              <h3 className="font-medium mb-4">Avec {rideDetails.driver.name}</h3>
              
              <div className="flex gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star} 
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star 
                      className={`h-8 w-8 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} 
                    />
                  </button>
                ))}
              </div>
              
              <Textarea
                placeholder="Commentaires additionnels (optionnel)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full mb-4"
              />
              
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={submitRating}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Envoi en cours...' : 'Soumettre l\'évaluation'}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Détails du trajet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <p className="text-sm">Tarif de base</p>
                <p className="text-sm font-medium">{rideDetails.price} FCFA</p>
              </div>
              
              {rideDetails.extraCharge > 0 && (
                <div className="flex justify-between">
                  <p className="text-sm">Frais d'attente</p>
                  <p className="text-sm font-medium text-red-500">+{rideDetails.extraCharge} FCFA</p>
                </div>
              )}
              
              <div className="flex justify-between border-t pt-2">
                <p className="font-medium">Total</p>
                <p className="font-medium">{rideDetails.price + (rideDetails.extraCharge || 0)} FCFA</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientRateRidePage;
