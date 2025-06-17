import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { ArrowLeft } from 'lucide-react';
import RideInfoCard from '../../components/client/RideInfoCard'; // Import RideInfoCard

const ClientSearchingDriverPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const rideDetails = location.state || {
    pickup: { address: 'Position actuelle' },
    destination: { address: 'Destination' },
    price: 700,
    estimatedTime: '10 min'
  };
  
  const [searchTime, setSearchTime] = useState(0);
  const [driverFound, setDriverFound] = useState(false);
  const [driverDetails, setDriverDetails] = useState<any>(null);
  
  // Simuler la recherche d'un chauffeur
  useEffect(() => {
    const searchInterval = setInterval(() => {
      setSearchTime(prev => prev + 1);
      
      // Simuler la découverte d'un chauffeur après 5 secondes
      if (searchTime === 5) {
        setDriverFound(true);
        setDriverDetails({
          name: 'Konan Kouadio',
          rating: 4.8,
          vehicle: 'Honda PCX',
          plate: 'AB 1234 CD',
          arrivalTime: '3 min',
          photo: 'https://randomuser.me/api/portraits/men/32.jpg'
        });
        
        clearInterval(searchInterval);
        
        // Rediriger vers la page de suivi après 3 secondes
        setTimeout(() => {
          navigate('/client/track-ride', {
            state: {
              ...rideDetails,
              driver: driverDetails
            }
          });
        }, 3000);
      }
    }, 1000);
    
    return () => clearInterval(searchInterval);
  }, [searchTime, navigate, rideDetails]);
  
  // Annuler la recherche
  const cancelSearch = () => {
    navigate('/client');
  };

  return (
    <div className="flex flex-col h-screen bg-kole-cream-bg"> {/* Page background */}
      {/* Barre d'état supérieure */}
      <div className="bg-white shadow-sm p-4 flex items-center">
        <button onClick={cancelSearch} className="mr-4 p-2 rounded-full hover:bg-kole-hover-bg"> {/* Kôlê icon button style */}
          <ArrowLeft className="h-5 w-5 text-kole-text-primary" />
        </button>
        <h1 className="text-lg font-semibold text-kole-text-primary"> {/* Kôlê text color */}
          {driverFound ? 'Chauffeur trouvé !' : 'Recherche de chauffeur...'}
        </h1>
      </div>
      
      {/* Contenu principal */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {!driverFound ? (
          <>
            {/* Kôlê themed spinner */}
            <div className="w-24 h-24 rounded-full border-4 border-t-kole-blue-primary border-kole-blue-primary/30 animate-spin mb-6"></div>
            <h2 className="text-xl font-bold mb-2 text-kole-text-primary">Recherche du chauffeur le plus proche</h2> {/* Kôlê text color */}
            <p className="text-kole-text-secondary mb-6">Veuillez patienter pendant que nous trouvons un chauffeur...</p> {/* Kôlê text color */}
            <p className="text-sm text-kole-text-tertiary">Temps de recherche: {searchTime}s</p> {/* Kôlê text color */}
          </>
        ) : (
          <div className="w-full max-w-md animate-fade-in">
            <div className="flex justify-center mb-6">
              {/* Kôlê themed success icon */}
              <div className="w-20 h-20 rounded-full bg-kole-green-light flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-kole-green-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-center mb-6 text-kole-text-primary">Chauffeur trouvé !</h2> {/* Kôlê text color */}
            
            <Card className="mb-4 border-kole-border"> {/* Kôlê border */}
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
                    <img src={driverDetails?.photo} alt="Driver" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-kole-text-primary">{driverDetails?.name}</h3> {/* Kôlê text color */}
                    <div className="flex items-center">
                      {/* Kôlê themed star icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-kole-orange-primary" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm ml-1 text-kole-text-secondary">{driverDetails?.rating}</span> {/* Kôlê text color */}
                    </div>
                    <p className="text-sm text-kole-text-secondary">{driverDetails?.vehicle} • {driverDetails?.plate}</p> {/* Kôlê text color */}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <p className="text-center text-kole-text-secondary"> {/* Kôlê text color */}
              {driverDetails?.name} arrive dans {driverDetails?.arrivalTime}
            </p>
            <p className="text-center text-kole-text-secondary text-sm mt-1"> {/* Kôlê text color */}
              Redirection automatique...
            </p>
          </div>
        )}
      </div>
      
      {/* Panneau inférieur */}
      <div className="bg-white border-t border-kole-border p-4">
        {/* The outer Card for the bottom panel might not be needed if RideInfoCard is itself a Card.
            However, the "Annuler la recherche" button is outside RideInfoCard.
            So, we keep the existing Card structure here and place RideInfoCard inside its CardContent.
            RideInfoCard itself also renders a Card, so this will be a Card within a Card.
            Alternatively, RideInfoCard could be designed to not have its own Card shell if it's always embedded.
            For now, following the structure: Card > CardContent > RideInfoCard + Button
        */}
        <Card className="border-kole-border">
          <CardContent className="p-4">
            <RideInfoCard
              pickupAddress={rideDetails.pickup.address}
              destinationAddress={rideDetails.destination.address}
              price={rideDetails.price}
              estimatedTime={rideDetails.estimatedTime}
            />
            
            {!driverFound && (
              <Button 
                variant="outline" 
                className="w-full mt-4 border-kole-destructive text-kole-destructive hover:bg-kole-destructive/10 focus-visible:ring-kole-destructive" /* Kôlê destructive outline button */
                onClick={cancelSearch}
              >
                Annuler la recherche
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientSearchingDriverPage;
