import React, { useEffect /*, useContext*/ } from "react"; // useContext commenté car non utilisé pour l'instant
import { useNavigate } from "react-router-dom";
import koleLogo from "/assets/kole_logo_new.png";
// import { AuthContext } from "../context/AuthContext"; // Supposons un AuthContext pour l'état de connexion

const SplashScreen: React.FC = () => {
  const navigate = useNavigate();
  // const { currentUser } = useContext(AuthContext); // Exemple d'utilisation du contexte d'authentification

  useEffect(() => {
    const timer = setTimeout(() => {
      // TODO: Implémenter la vérification de l'état d'authentification (currentUser)
      // if (currentUser) {
      //   // Vérifier si l'utilisateur est client ou chauffeur et rediriger vers l'écran principal approprié
      //   // Exemple: navigate(currentUser.type === 'client' ? '/client/home' : '/driver/dashboard');
      //   navigate("/client/home"); // Placeholder pour utilisateur connecté
      // } else {
      //   navigate("/login");
      // }
      navigate("/login"); // Redirection actuelle maintenue en attendant la logique d'auth
    }, 3000);

    return () => clearTimeout(timer);
  // }, [navigate, currentUser]);
  }, [navigate]); // Dépendance actuelle maintenue

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-kole-cream_bg p-4">
      {/* TODO: Vérifier si bg-kole-cream_bg inclut le motif géométrique africain spécifié ou ajouter un style dédié. */}
      <img src={koleLogo} alt="Kôlê Logo" className="w-40 h-auto mb-4" />
      {/* TODO: Vérifier si la police et la couleur du logo correspondent aux spécifications "serif élégante, couleur claire (blanc cassé/beige clair)" si ce n'est pas une image fixe. */}
      <p className="text-center text-kole-text_secondary font-semibold text-lg">VOTRE TRAJET, NOTRE MISSION</p>
      {/* Indicateur de chargement optionnel non implémenté pour l'instant */}
    </div>
  );
};

export default SplashScreen;

