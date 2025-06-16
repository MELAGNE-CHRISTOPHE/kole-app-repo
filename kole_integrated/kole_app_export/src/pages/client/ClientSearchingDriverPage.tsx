import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { ArrowLeft } from 'lucide-react';

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
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Barre d'état supérieure */}
      <div className="bg-white shadow-sm p-4 flex items-center">
        <button onClick={cancelSearch} className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-gray-800">
          {driverFound ? 'Chauffeur trouvé !' : 'Recherche de chauffeur...'}
        </h1>
      </div>
      
      {/* Contenu principal */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {!driverFound ? (
          <>
            <div className="w-24 h-24 rounded-full border-4 border-t-blue-600 border-blue-200 animate-spin mb-6"></div>
            <h2 className="text-xl font-bold mb-2">Recherche du chauffeur le plus proche</h2>
            <p className="text-gray-500 mb-6">Veuillez patienter pendant que nous trouvons un chauffeur...</p>
            <p className="text-sm text-gray-400">Temps de recherche: {searchTime}s</p>
          </>
        ) : (
          <div className="w-full max-w-md animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-center mb-6">Chauffeur trouvé !</h2>
            
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
                    <img src={driverDetails?.photo} alt="Driver" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold">{driverDetails?.name}</h3>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm ml-1">{driverDetails?.rating}</span>
                    </div>
                    <p className="text-sm text-gray-500">{driverDetails?.vehicle} • {driverDetails?.plate}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <p className="text-center text-gray-500">
              {driverDetails?.name} arrive dans {driverDetails?.arrivalTime}
            </p>
            <p className="text-center text-gray-500 text-sm mt-1">
              Redirection automatique...
            </p>
          </div>
        )}
      </div>
      
      {/* Panneau inférieur */}
      <div className="bg-white border-t border-gray-200 p-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between mb-2">
              <div>
                <p className="text-sm text-gray-500">De</p>
                <p className="font-medium">{rideDetails.pickup.address}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">À</p>
                <p className="font-medium">{rideDetails.destination.address}</p>
              </div>
            </div>
            
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500">Prix</p>
                <p className="font-bold">{rideDetails.price} FCFA</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Durée estimée</p>
                <p className="font-medium">{rideDetails.estimatedTime}</p>
              </div>
            </div>
            
            {!driverFound && (
              <Button 
                variant="outline" 
                className="w-full mt-4 border-red-300 text-red-500 hover:bg-red-50"
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
