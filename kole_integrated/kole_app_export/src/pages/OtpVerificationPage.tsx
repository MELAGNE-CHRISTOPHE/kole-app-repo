// src/pages/OtpVerificationPage.tsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; // Ajout de useLocation
import { ShieldCheck, ArrowLeft, RotateCcw } from "lucide-react";
import KoleLogo from "/assets/kole_logo_new.png";
// import { AuthContext } from "../context/AuthContext"; // Pour la logique de vérification et de navigation

const OtpVerificationPage: React.FC = () => {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const navigate = useNavigate();
  const location = useLocation(); // Pour récupérer le numéro de téléphone si passé en state
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [timer, setTimer] = useState(60); // Minuteur ajusté à 60s
  const [canResend, setCanResend] = useState(false);

  // Exemple: récupérer le numéro de téléphone depuis la navigation
  const phoneNumber = location.state?.phoneNumber || "+XXX XX XX XX XX"; // Numéro par défaut si non fourni

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, []);

  useEffect(() => {
    if (timer > 0) {
      setCanResend(false);
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (!/^[0-9]?$/.test(element.value)) return;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    if (element.value && index < otp.length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const enteredOtp = otp.join("");
    // TODO: Implémenter la logique de vérification OTP réelle avec Firebase
    console.log("OTP Entered:", enteredOtp, "for phone:", phoneNumber);
    if (enteredOtp.length === 6) {
      // TODO: La navigation doit dépendre du type d'utilisateur (client/chauffeur) et du succès de la vérification
      // Exemple: const userType = location.state?.userType;
      // if (userType === "driver") navigate("/driver/dashboard"); else navigate("/client/home");
      alert(`Code ${enteredOtp} soumis pour vérification (simulation).`);
      navigate("/client/home"); // Placeholder
    } else {
      alert("Veuillez entrer un code OTP valide à 6 chiffres.");
    }
  };

  const handleResendOtp = () => {
    if (canResend) {
      // TODO: Implémenter la logique de renvoi d'OTP réelle avec Firebase
      console.log("Resending OTP for:", phoneNumber);
      setOtp(new Array(6).fill(""));
      setTimer(60); // Réinitialiser le minuteur à 60s
      // setCanResend(false); // Est géré par useEffect sur timer
      if (inputRefs.current[0]) {
        inputRefs.current[0]?.focus();
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-kole-cream-bg p-4">
      <div className="bg-white p-6 md:p-8 rounded-xl-kole shadow-lg w-full max-w-md">
        <img src={KoleLogo} alt="Kôlê Logo" className="h-12 w-auto mx-auto mb-2" />
        <p className="text-center text-kole-text_secondary font-semibold text-sm mb-6">VOTRE TRAJET, NOTRE MISSION</p>
        <h1 className="text-xl font-bold text-center text-kole-text-primary mb-2">Vérifiez votre numéro</h1>
        <p className="text-center text-sm text-kole-text-secondary mb-6">
          Nous avons envoyé un code à 6 chiffres au <span className="font-semibold text-kole-text-primary">{phoneNumber}</span>. Veuillez le saisir ci-dessous.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="flex justify-center gap-2 sm:gap-3 mb-6">
            {otp.map((data, index) => (
              <input
                key={index}
                type="tel"
                name={`otp-${index}`}
                maxLength={1}
                className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-semibold border border-kole-border rounded-lg-kole focus:outline-none focus:ring-2 focus:ring-kole-blue-primary appearance-none"
                value={data}
                onChange={(e) => handleChange(e.target, index)}
                onFocus={(e) => e.target.select()}
                onKeyDown={(e) => handleKeyDown(e, index)}
                ref={(el) => (inputRefs.current[index] = el)}
                autoComplete="one-time-code"
                inputMode="numeric"
              />
            ))}
          </div>

          <button 
            type="submit"
            className="w-full bg-kole-blue-primary text-white py-3.5 rounded-lg-kole hover:bg-kole-blue-dark transition duration-300 font-semibold flex items-center justify-center text-base mb-4"
          >
            <ShieldCheck className="mr-2 h-5 w-5" /> Vérifier
          </button>
        </form>

        <div className="text-center text-sm mb-6">
          <button 
            onClick={handleResendOtp}
            disabled={!canResend}
            className={`text-kole-blue-primary hover:underline flex items-center justify-center mx-auto ${!canResend ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <RotateCcw className="mr-1 h-4 w-4" /> 
            {canResend ? "Renvoyer le code" : `Renvoyer le code (${String(Math.floor(timer/60)).padStart(2,"")}:${String(timer%60).padStart(2,"0")})`}
          </button>
        </div>

        <p className="text-center text-sm text-kole-text-secondary">
          <Link to="/signup" className="font-medium text-kole-blue-primary hover:underline flex items-center justify-center">
            <ArrowLeft className="mr-1 h-4 w-4" /> Retour à l\u0027inscription
          </Link>
        </p>
      </div>
    </div>
  );
};

export default OtpVerificationPage;

