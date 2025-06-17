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
    <div className="flex flex-col h-screen bg-kole-cream-bg"> {/* Page background */}
      {/* Barre d'état supérieure */}
      <div className="bg-white shadow-sm p-4 flex items-center border-b border-kole-border"> {/* Kôlê border */}
        <button onClick={goHome} className="mr-4 p-2 rounded-full hover:bg-kole-hover-bg"> {/* Kôlê icon button style */}
          <ArrowLeft className="h-5 w-5 text-kole-text-primary" />
        </button>
        <h1 className="text-lg font-semibold text-kole-text-primary">Trajet terminé</h1> {/* Kôlê text color */}
      </div>
      
      {/* Contenu principal */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex flex-col items-center mb-8 pt-6">
          <div className="w-20 h-20 rounded-full bg-kole-green-light flex items-center justify-center mb-4"> {/* Kôlê success bg */}
            <CheckCircle className="h-12 w-12 text-kole-green-dark" /> {/* Kôlê success icon color */}
          </div>
          <h2 className="text-xl font-bold mb-2 text-kole-text-primary">Trajet terminé avec succès !</h2> {/* Kôlê text color */}
          <p className="text-kole-text-secondary text-center">Merci d'avoir utilisé Kôlê pour votre déplacement.</p> {/* Kôlê text color */}
        </div>
        
        <Card className="mb-6 kole-card border-kole-border"> {/* Kôlê card style */}
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-kole-text-primary">Récapitulatif</CardTitle> {/* Kôlê text color */}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
                  <img src={rideDetails.driver.photo} alt="Driver" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-medium text-kole-text-primary">{rideDetails.driver.name}</h3> {/* Kôlê text color */}
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`h-4 w-4 ${star <= rideDetails.rating ? 'text-kole-orange-primary fill-kole-orange-primary' : 'text-kole-border'}`} /* Kôlê star colors */
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              {rideDetails.comment && (
                <div className="bg-kole-cream-light p-3 rounded-md"> {/* Kôlê light bg for comment */}
                  <p className="text-sm italic text-kole-text-secondary">"{rideDetails.comment}"</p> {/* Kôlê text color */}
                </div>
              )}
              
              <div className="space-y-2 pt-2 border-t border-kole-border"> {/* Kôlê border */}
                <div className="flex justify-between">
                  <p className="text-sm text-kole-text-secondary">Tarif de base</p> {/* Kôlê text color */}
                  <p className="text-sm font-medium text-kole-text-primary">{rideDetails.price} FCFA</p> {/* Kôlê text color */}
                </div>
                
                {rideDetails.extraCharge > 0 && (
                  <div className="flex justify-between">
                    <p className="text-sm text-kole-text-secondary">Frais d'attente</p> {/* Kôlê text color */}
                    <p className="text-sm font-medium text-kole-destructive">+{rideDetails.extraCharge} FCFA</p> {/* Kôlê destructive color */}
                  </div>
                )}
                
                <div className="flex justify-between border-t border-kole-border pt-2"> {/* Kôlê border */}
                  <p className="font-medium text-kole-text-primary">Total payé</p> {/* Kôlê text color */}
                  <p className="font-medium text-kole-text-primary">{rideDetails.price + (rideDetails.extraCharge || 0)} FCFA</p> {/* Kôlê text color */}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1 kole-btn-outline" /* Kôlê outline button style */
            onClick={viewHistory}
          >
            Voir l'historique
          </Button>
          <Button 
            className="flex-1 kole-btn-primary" /* Kôlê primary button style */
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
