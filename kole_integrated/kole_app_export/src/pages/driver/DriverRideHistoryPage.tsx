import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import DriverNavBar from '../../../components/driver/DriverNavBar'; // Remplacé par BottomNav

// Placeholder pour Ionicons
const Ionicons = ({ name, size, color, style }: any) => <span style={{...style, fontSize: size, color: color }}>{`[Icon: ${name}]`}</span>;

interface Ride {
  id: string;
  date: string;
  time: string;
  pickupAddress: string;
  destinationAddress: string;
  fare: number;
}

// Simuler une fonction pour récupérer l'historique des courses
const fetchRideHistory = async (): Promise<Ride[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        { id: '1', date: "Aujourd'hui", time: '14:30', pickupAddress: 'Rue des Palmiers', destinationAddress: 'Marché Central', fare: 700 },
        { id: '2', date: 'Hier', time: '09:15', pickupAddress: 'Aéroport International', destinationAddress: 'Hôtel Le Grand', fare: 1200 },
        { id: '3', date: '12/05/2025', time: '18:00', pickupAddress: 'Stade Municipal', destinationAddress: 'Restaurant La Fourchette', fare: 550 },
        { id: '4', date: '12/05/2025', time: '11:30', pickupAddress: 'Centre Commercial', destinationAddress: 'Quartier Résidentiel Sud', fare: 800 },
      ]);
    }, 1000);
  });
};

const DriverRideHistoryPage: React.FC = () => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalEarningsToday, setTotalEarningsToday] = useState<number>(0);

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      try {
        const history = await fetchRideHistory();
        setRides(history);
        const todayRides = history.filter(ride => ride.date === "Aujourd'hui");
        const earnings = todayRides.reduce((sum, ride) => sum + ride.fare, 0);
        setTotalEarningsToday(earnings);
      } catch (e) {
        setError("Impossible de charger l'historique des courses.");
        console.error(e);
      }
      setIsLoading(false);
    };
    loadHistory();
  }, []);

  // Styles en ligne temporaires
  const styles = {
    container: { flex: 1, backgroundColor: '#FFF8F0', paddingBottom: '60px' },
    centered: { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20, flexDirection: 'column' as 'column' },
    errorText: { color: 'red', fontSize: 16, textAlign: 'center' as 'center' },
    header: { backgroundColor: '#FFFFFF', padding: '20px', paddingTop: '20px', paddingBottom: '10px', borderBottom: '1px solid #E0E0E0' },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#4A2E1F', textAlign: 'center' as 'center' },
    earningsTodayText: { textAlign: 'center' as 'center', fontSize: 16, color: '#0052FF', fontWeight: 'bold', padding: '10px 0', backgroundColor: '#E6F0FF' },
    listContentContainer: { padding: '0 10px 10px' },
    rideItemContainer: { backgroundColor: '#FFFFFF', borderRadius: 8, padding: 15, margin: '8px 0', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' },
    rideDateContainer: { marginBottom: 8 },
    rideDate: { fontSize: 13, color: '#757575' },
    rideInfoContainer: { marginBottom: 8 },
    addressContainer: { display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    icon: { marginRight: 6 },
    rideAddress: { fontSize: 14, color: '#4A2E1F', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as 'nowrap' },
    rideFare: { fontSize: 15, fontWeight: 'bold', color: '#008000', textAlign: 'right' as 'right' },
    loadingText: { marginTop: '10px'}
  };

  const renderRideItem = (item: Ride) => (
    <div style={styles.rideItemContainer as React.CSSProperties} key={item.id}>
      <div style={styles.rideDateContainer as React.CSSProperties}>
        <p style={styles.rideDate as React.CSSProperties}>{item.date}, {item.time}</p>
      </div>
      <div style={styles.rideInfoContainer as React.CSSProperties}>
        <div style={styles.addressContainer as React.CSSProperties}>
            <Ionicons name="navigate-circle-outline" size={16} color="#0052FF" style={styles.icon} />
            <p style={styles.rideAddress as React.CSSProperties}>Départ: {item.pickupAddress}</p>
        </div>
        <div style={styles.addressContainer as React.CSSProperties}>
            <Ionicons name="flag-outline" size={16} color="#0052FF" style={styles.icon} />
            <p style={styles.rideAddress as React.CSSProperties}>Arrivée: {item.destinationAddress}</p>
        </div>
      </div>
      <p style={styles.rideFare as React.CSSProperties}>Gain: {item.fare.toLocaleString()} FCFA</p>
    </div>
  );

  if (isLoading) {
    return <div style={styles.centered as React.CSSProperties}><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div><p style={styles.loadingText}>Chargement de l'historique...</p></div>;
  }

  if (error) {
    return <div style={styles.centered as React.CSSProperties}><p style={styles.errorText as React.CSSProperties}>{error}</p></div>;
  }

  return (
    <div style={styles.container as React.CSSProperties}>
      <div style={styles.header as React.CSSProperties}>
        <h2 style={styles.headerTitle as React.CSSProperties}>Mes Courses</h2>
      </div>
      {totalEarningsToday > 0 && (
          <p style={styles.earningsTodayText as React.CSSProperties}>Gains aujourd'hui : {totalEarningsToday.toLocaleString()} FCFA</p>
      )}
      <div style={styles.listContentContainer as React.CSSProperties}>
        {rides.length === 0 ? (
          <div style={styles.centered as React.CSSProperties}><p>Aucune course dans l'historique.</p></div>
        ) : (
          rides.map(item => renderRideItem(item))
        )}
      </div>
      {/* <DriverNavBar /> remplacé par BottomNav dans ChauffeurDashboardPage */}
    </div>
  );
};

export default DriverRideHistoryPage;

