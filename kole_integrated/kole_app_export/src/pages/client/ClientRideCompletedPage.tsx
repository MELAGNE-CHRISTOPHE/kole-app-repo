import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ArrowLeft, CheckCircle, Star } from 'lucide-react';

const ClientRideCompletedPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const rideDetails = location.state || {
    driver: {
      name: 'Konan Kouadio',
      photo: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    price: 700,
    extraCharge: 0,
    rating: 5,
    comment: ''
  };
  
  // Retourner à l'accueil
  const goHome = () => {
    navigate('/client');
  };
  
  // Voir l'historique des trajets
  const viewHistory = () => {
    navigate('/client/ride-history');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Barre d'état supérieure */}
      <div className="bg-white shadow-sm p-4 flex items-center">
        <button onClick={goHome} className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-gray-800">Trajet terminé</h1>
      </div>
      
      {/* Contenu principal */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex flex-col items-center mb-8 pt-6">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">Trajet terminé avec succès !</h2>
          <p className="text-gray-500 text-center">Merci d'avoir utilisé Kôlê pour votre déplacement.</p>
        </div>
        
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Récapitulatif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
                  <img src={rideDetails.driver.photo} alt="Driver" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-medium">{rideDetails.driver.name}</h3>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`h-4 w-4 ${star <= rideDetails.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              {rideDetails.comment && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm italic">"{rideDetails.comment}"</p>
                </div>
              )}
              
              <div className="space-y-2 pt-2 border-t">
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
                  <p className="font-medium">Total payé</p>
                  <p className="font-medium">{rideDetails.price + (rideDetails.extraCharge || 0)} FCFA</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={viewHistory}
          >
            Voir l'historique
          </Button>
          <Button 
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            onClick={goHome}
          >
            Retour à l'accueil
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClientRideCompletedPage;
