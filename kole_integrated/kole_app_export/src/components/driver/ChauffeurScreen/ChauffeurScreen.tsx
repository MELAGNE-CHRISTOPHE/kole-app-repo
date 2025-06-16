import React, { /* Suspense, lazy, */ useState } from "react";
// import { StatusButton } from "../StatusButton";
// import Loader from "../../common/Loader"; 
// import MapContainer from "./MapContainer"; 

const ChauffeurScreen: React.FC = () => {
  const [/*isOnline*/, setIsOnline] = useState(false);

  const handleStatusChange = (newStatus: boolean) => {
    setIsOnline(newStatus);
    console.log(`ChauffeurScreen: Nouveau statut chauffeur: ${newStatus ? "En ligne" : "Hors ligne"}`);
  };

  console.log("ChauffeurScreen MINIMAL RENDERING TEST"); 

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "#f0f0f0", border: "5px solid red" }}>
      <header style={{ padding: "1rem", backgroundColor: "lightcoral", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", display: "flex", justifyContent: "center", alignItems: "center", position: "relative", zIndex: 10 }}>
        {/* <StatusButton initialStatus={isOnline} onStatusChange={handleStatusChange} driverId="chauffeur123" /> */}
        <h1 style={{color: "white"}}>ChauffeurScreen Header (Minimal Test)</h1>
      </header>

      <main style={{ flexGrow: 1, display: "flex", flexDirection: "column", position: "relative", padding: "20px", backgroundColor: "lightyellow", border: "3px solid green" }}>
        {/* <MapContainer /> */}
        <h2 style={{color: "blue", margin: "auto"}}>ChauffeurScreen Main Content Area (Minimal Test)</h2>
        <p>Si vous voyez ce texte, ChauffeurScreen se rend correctement.</p>
        <button onClick={() => handleStatusChange(true)}>Test Statut En Ligne</button>
      </main>
       <footer style={{ padding: "1rem", backgroundColor: "lightskyblue", textAlign: "center"}}>
        <p>ChauffeurScreen Footer (Minimal Test)</p>
      </footer>
    </div>
  );
};

export default ChauffeurScreen;

