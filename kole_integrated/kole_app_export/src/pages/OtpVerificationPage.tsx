// src/pages/OtpVerificationPage.tsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, ArrowLeft, RotateCcw } from "lucide-react";
import KoleLogo from "/assets/kole_logo_new.png";

const OtpVerificationPage: React.FC = () => {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const navigate = useNavigate();
  const location = useLocation();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const phoneNumber = location.state?.phoneNumber || "+XXX XX XX XX XX";

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
    console.log("OTP Entered:", enteredOtp, "for phone:", phoneNumber);
    if (enteredOtp.length === 6) {
      // TODO: Implement OTP verification logic with Firebase
      // TODO: Navigate based on user type and success
      alert(`Code ${enteredOtp} soumis pour vérification (simulation).`);
      navigate("/client"); // Adjusted placeholder navigation
    } else {
      alert("Veuillez entrer un code OTP valide à 6 chiffres.");
    }
  };

  const handleResendOtp = () => {
    if (canResend) {
      console.log("Resending OTP for:", phoneNumber);
      // TODO: Implement resend OTP logic with Firebase
      setOtp(new Array(6).fill(""));
      setTimer(60);
      if (inputRefs.current[0]) {
        inputRefs.current[0]?.focus();
      }
    }
  };

  return (
    // Consistent page layout with other auth pages
    <div className="min-h-screen bg-kole-cream-light african-pattern-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Branding elements - consistent with other auth pages */}
        <div className="text-center mb-8">
          <img src={KoleLogo} alt="Kôlê Logo" className="h-16 w-auto mx-auto mb-3" />
          <h1 className="text-4xl font-bold text-kole-brown-dark mb-2">Kôlê</h1>
          <p className="text-kole-text-secondary font-medium">VOTRE TRAJET, NOTRE MISSION</p>
        </div>

        {/* Main content card */}
        <div className="bg-white p-6 md:p-8 rounded-xl-kole shadow-lg w-full">
          <h2 className="text-xl font-bold text-center text-kole-text-primary mb-2">Vérifiez votre numéro</h2>
          <p className="text-center text-sm text-kole-text-secondary mb-6">
            Nous avons envoyé un code à 6 chiffres au <span className="font-semibold text-kole-text-primary">{phoneNumber}</span>. Veuillez le saisir ci-dessous.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="flex justify-center gap-2 sm:gap-3 mb-6">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="tel" // Using "tel" for numeric keyboard on mobile
                  name={`otp-${index}`}
                  maxLength={1}
                  className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-semibold border border-kole-border rounded-lg-kole focus:outline-none focus:ring-2 focus:ring-kole-blue-primary"
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
              // Standard Kôlê primary button style
              className="w-full kole-btn-primary py-3 text-lg font-semibold flex items-center justify-center mb-4"
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
              {canResend ? "Renvoyer le code" : `Renvoyer le code (${String(Math.floor(timer/60)).padStart(2,"0")}:${String(timer%60).padStart(2,"0")})`}
            </button>
          </div>

          <p className="text-center text-sm text-kole-text-secondary">
            <Link to="/signup" className="font-medium text-kole-blue-primary hover:underline flex items-center justify-center">
              <ArrowLeft className="mr-1 h-4 w-4" /> Retour à l'inscription
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OtpVerificationPage;
