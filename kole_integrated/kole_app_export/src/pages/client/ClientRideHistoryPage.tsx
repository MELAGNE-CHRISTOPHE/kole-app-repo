// src/pages/client/ClientRideHistoryPage.tsx
import React from "react";
// import { useNavigate } from "react-router-dom"; // Supprimé car non utilisé pour l'instant
import { Card, CardContent } from "../../components/ui/card";
import { ScrollArea } from "../../components/ui/scroll-area";
import { ListFilter } from "lucide-react"; // ArrowLeft supprimé car non utilisé
import ClientBottomNavBar from "../../components/ClientBottomNavBar";

// Dummy data structure based on the mockup "Client_Historique_Trajets.png"
const rideHistoryData = [
  {
    id: "1",
    date: "Hier, 10:15",
    pickup: "Cocody Angré",
    destination: "Plateau Cite Admin.",
    price: "700 FCFA",
    driverName: "Moussa K.",
    status: "Terminé", // Implicit from mockup context
  },
  {
    id: "2",
    date: "Hier, 8:20",
    pickup: "Cocody Angré",
    destination: "Popougon Maroc",
    price: "850 FCFA",
    driverName: "Moussa K.",
    status: "Terminé",
  },
  {
    id: "3",
    date: "Hier, 7:00",
    pickup: "Cocody Angré",
    destination: "Marcory Résidentiel",
    price: "500 FCFA",
    driverName: "Moussa K.",
    status: "Terminé",
  },
  // Add more entries as needed to test scrolling
];

const ClientRideHistoryPage: React.FC = () => {
  // const navigate = useNavigate(); // Supprimé car non utilisé pour l'instant

  return (
    <div className="h-screen flex flex-col bg-kole-cream-bg">
      {/* Header */}
      <div className="bg-kole-cream-bg p-4 pt-6 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-kole-text-primary ml-1">Mes trajets</h1>
        <button className="p-2 rounded-full hover:bg-gray-200/50">
          <ListFilter size={22} className="text-kole-text-primary" />
        </button>
      </div>
      
      {rideHistoryData.length > 0 ? (
        <ScrollArea className="flex-grow px-4 pb-4">
          <div className="space-y-3">
            {rideHistoryData.map((ride) => (
              <Card key={ride.id} className="overflow-hidden bg-white shadow-sm rounded-xl-kole border-kole-border">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-1.5">
                    <p className="text-xs text-kole-text-secondary">{ride.date}</p>
                    <p className="text-base font-semibold text-kole-blue-primary">{ride.price}</p>
                  </div>

                  <div className="mb-1">
                    <p className="text-sm text-kole-text-secondary">
                      Départ: <span className="font-medium text-kole-text-primary">{ride.pickup}</span>
                    </p>
                    <p className="text-sm text-kole-text-secondary">
                      Arrivée: <span className="font-medium text-kole-text-primary">{ride.destination}</span>
                    </p>
                  </div>
                  
                  <p className="text-sm text-kole-text-secondary">
                    Chauffeur: <span className="font-medium text-kole-text-primary">{ride.driverName}</span>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-kole-text-secondary text-lg">Aucun trajet pour le moment.</p>
          <p className="text-sm text-kole-text-tertiary mt-1">Vos courses passées s’afficheront ici.</p>
        </div>
      )}
      <ClientBottomNavBar />
    </div>
  );
};

export default ClientRideHistoryPage;

