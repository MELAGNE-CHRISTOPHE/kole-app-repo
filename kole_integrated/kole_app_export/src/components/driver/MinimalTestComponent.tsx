import React from "react";

const MinimalTestComponent: React.FC = () => {
  console.log("MinimalTestComponent RENDERING");
  return (
    <div style={{ padding: "20px", border: "3px dashed purple", backgroundColor: "lightgreen", height: "300px" }}>
      <h1 style={{ color: "purple" }}>Minimal Test Component</h1>
      <p>Ce composant de test est rendu par ChauffeurDashboardPage.</p>
      <p>Si vous voyez ceci, le problème n'est PAS dans ChauffeurDashboardPage ou le routage de base.</p>
    </div>
  );
};

export default MinimalTestComponent;

