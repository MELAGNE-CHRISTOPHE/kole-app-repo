// src/components/Auth/SignUpForm.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, Briefcase, FileText, ShieldQuestion, Bike, Loader2 } from "lucide-react";
import { auth } from '../../firebase/config';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { createOrUpdateUser } from '../../services/firestore';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox"; // Added Checkbox import

// Helper to get Firebase error messages
const getFirebaseErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return "Cet email est déjà utilisé par un autre compte.";
    case 'auth/invalid-email':
      return "Le format de l'email n'est pas valide.";
    case 'auth/weak-password':
      return "Le mot de passe est trop faible (minimum 6 caractères).";
    case 'auth/operation-not-allowed':
      return "L'inscription par email et mot de passe n'est pas activée.";
    default:
      return "Une erreur est survenue lors de l'inscription. Veuillez réessayer.";
  }
};

const SignUpForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [accountType, setAccountType] = useState<"client" | "driver" | null>(null);
  const [step, setStep] = useState(1);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Form field states
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState(''); // Optional
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Driver specific fields
  const [vehicleType, setVehicleType] = useState('Moto'); // Default to Moto
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  // TODO: Add states for file uploads if direct handling is needed:
  // const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  // const [idCard, setIdCard] = useState<File | null>(null);
  // const [driverLicenseDoc, setDriverLicenseDoc] = useState<File | null>(null);
  // const [vehicleRegistrationDoc, setVehicleRegistrationDoc] = useState<File | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Effect to clear error when step or account type changes
  useEffect(() => {
    setError(null);
  }, [step, accountType]);

  const handleFinalSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      let userId = '';
      let userEmail = email || null; // Use null if email is empty

      // 1. Create user with Firebase Auth (if email is provided)
      if (userEmail && password) { // Only attempt auth if email and password are provided
        const userCredential = await createUserWithEmailAndPassword(auth, userEmail, password);
        userId = userCredential.user.uid;
        console.log("Firebase Auth user created:", userId);
      } else if (!userEmail && accountType === 'client') {
        // For clients, if no email, we might rely on phone auth later (not implemented here)
        // For now, we'll proceed to save data without Firebase Auth User UID if no email.
        // This means createOrUpdateUser needs to handle user creation without a uid from auth.
        // Or, we decide phone is primary and use phone auth (significant change).
        // For this refactor, we'll assume createOrUpdateUser can handle it or this part is TBD for phone-only.
        console.log("Client sign-up without email. Firestore data will be saved without Auth UID for now.");
      } else if (!userEmail && accountType === 'driver') {
        // Drivers likely need a verifiable account, email is strongly recommended.
        // For now, similar to client, proceed but flag this.
         console.warn("Driver sign-up without email. This is not recommended. Firestore data will be saved without Auth UID for now.");
      }


      // 2. Prepare user data for Firestore
      const userData: any = {
        fullName,
        phoneNumber,
        email: userEmail, // Save email (or null)
        accountType,
        agreedToTerms,
        createdAt: new Date(),
        //role: accountType === 'driver' ? 'driver' : 'client', // Example role
      };

      if (accountType === "driver") {
        userData.driverProfile = {
          vehicleType,
          licenseNumber,
          licensePlate,
          // TODO: Add URLs of uploaded documents after storage
          // profilePhotoUrl: '',
          // idCardUrl: '',
          // driverLicenseDocUrl: '',
          // vehicleRegistrationDocUrl: '',
          applicationStatus: 'pending', // Initial status for driver applications
        };
      }
      
      // 3. Save user data to Firestore
      // Assuming createOrUpdateUser can handle a null/undefined userId if auth was skipped
      // or can create a user document with an auto-generated ID if userId is not from auth.
      // For this exercise, we'll call it with userId, which might be empty if no email auth.
      await createOrUpdateUser({ uid: userId, email: userEmail, displayName: fullName } as any, userData); // Cast to any to satisfy existing createOrUpdateUser if it expects a User object.
      console.log("User data saved to Firestore for:", fullName);

      setLoading(false);
      // Navigate to OTP verification or a success page
      // This logic is kept from the original SignUpPage.tsx for now.
      navigate("/otp-verification");

    } catch (firebaseError: any) {
      console.error("Error during final submission:", firebaseError);
      if (firebaseError.code) {
        setError(getFirebaseErrorMessage(firebaseError.code));
      } else {
        setError("Une erreur inconnue est survenue. Veuillez réessayer.");
      }
      setLoading(false);
    }
  };


  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    // Validations for Step 1
    if (step === 1) {
      if (!accountType) {
        setError("Veuillez sélectionner un type de compte (Client ou Chauffeur).");
        return;
      }
      if (!fullName.trim()) {
        setError("Veuillez entrer votre nom complet.");
        return;
      }
      if (!phoneNumber.trim()) { // Basic phone validation
        setError("Veuillez entrer votre numéro de téléphone.");
        return;
      }
      // Email is optional, so no validation if empty, but if provided, check format lightly
      if (email && !/\S+@\S+\.\S+/.test(email)) {
          setError("Veuillez entrer une adresse email valide ou laisser le champ vide.");
          return;
      }
      if (!password) {
        setError("Veuillez créer un mot de passe.");
        return;
      }
      if (password.length < 6) {
        setError("Le mot de passe doit faire au moins 6 caractères.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Les mots de passe ne correspondent pas.");
        return;
      }
      if (!agreedToTerms) {
        setError("Veuillez accepter les Termes & Conditions et la Politique de Confidentialité.");
        return;
      }
    }

    // Validations for Step 2 (Driver)
    if (step === 2 && accountType === "driver") {
      if (!licenseNumber.trim()) {
        setError("Veuillez entrer votre numéro de permis de conduire.");
        return;
      }
      if (!licensePlate.trim()) {
        setError("Veuillez entrer votre plaque d'immatriculation.");
        return;
      }
      // TODO: Add validation for file inputs if they become mandatory
    }

    // Logic for proceeding
    if (accountType === "driver" && step === 1) {
      setStep(2); // Go to driver's step 2
    } else {
      // This is the final submission point for clients, or for drivers after step 2
      handleFinalSubmit();
    }
  };

  const renderStep1 = () => (
    <>
      <h1 className="text-2xl font-bold text-center text-kole-text-primary mb-1">Créez votre compte</h1>
      <p className="text-center text-sm text-kole-text-secondary mb-6">Informations de base</p>
      
      <div className="mb-4">
        <label htmlFor="fullName" className="block text-sm font-medium text-kole-text-primary mb-1">Nom complet</label>
        <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-kole-text-secondary" />
            <Input type="text" id="fullName" placeholder="Votre nom complet" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full pl-10 pr-4 py-3 border-kole-border rounded-lg-kole focus:ring-kole-blue-primary kole-input" required disabled={loading} />
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="phone" className="block text-sm font-medium text-kole-text-primary mb-1">Numéro de téléphone</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-kole-text-secondary" />
          <Input type="tel" id="phone" placeholder="Votre numéro de téléphone" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full pl-10 pr-4 py-3 border-kole-border rounded-lg-kole focus:ring-kole-blue-primary kole-input" required disabled={loading} />
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-kole-text-primary mb-1">Email (Optionnel)</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-kole-text-secondary" />
          <Input type="email" id="email" placeholder="Votre adresse e-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 border-kole-border rounded-lg-kole focus:ring-kole-blue-primary kole-input" disabled={loading} />
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="password" className="block text-sm font-medium text-kole-text-primary mb-1">Mot de passe</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-kole-text-secondary" />
          <Input
            type={showPassword ? "text" : "password"}
            id="password"
            placeholder="Créez un mot de passe (min. 6 caractères)"
            value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-10 py-3 border-kole-border rounded-lg-kole focus:ring-kole-blue-primary kole-input" required disabled={loading}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-auto px-0 py-0 text-kole-text-secondary hover:text-kole-blue-primary"
            disabled={loading}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-kole-text-primary mb-1">Confirmer le mot de passe</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-kole-text-secondary" />
          <Input
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            placeholder="Confirmez votre mot de passe"
            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full pl-10 pr-10 py-3 border-kole-border rounded-lg-kole focus:ring-kole-blue-primary kole-input" required disabled={loading}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-auto px-0 py-0 text-kole-text-secondary hover:text-kole-blue-primary"
            disabled={loading}
          >
            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-kole-text-primary mb-2">Je suis un :</label>
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            onClick={() => { setAccountType("client"); if (loading) return; }}
            disabled={loading}
            // Using default variant and overriding with className for highly custom buttons
            className={`flex flex-col items-center justify-center p-4 border rounded-lg-kole transition-all duration-200 ease-in-out h-auto text-sm font-medium
                        ${accountType === "client" ? "bg-kole-blue-primary text-white border-kole-blue-primary ring-2 ring-offset-1 ring-kole-blue-primary"
                                                  : "bg-kole-cream hover:bg-kole-hover-bg border-kole-border text-kole-text-secondary"}`}
          >
            <User className={`mb-1 h-7 w-7 ${accountType === "client" ? "text-white" : "text-kole-blue-primary"}`} />
            Client
          </Button>
          <Button
            type="button"
            onClick={() => { setAccountType("driver"); if (loading) return; }}
            disabled={loading}
            className={`flex flex-col items-center justify-center p-4 border rounded-lg-kole transition-all duration-200 ease-in-out h-auto text-sm font-medium
                        ${accountType === "driver" ? "bg-kole-blue-primary text-white border-kole-blue-primary ring-2 ring-offset-1 ring-kole-blue-primary"
                                                  : "bg-kole-cream hover:bg-kole-hover-bg border-kole-border text-kole-text-secondary"}`}
          >
            <Briefcase className={`mb-1 h-7 w-7 ${accountType === "driver" ? "text-white" : "text-kole-blue-primary"}`} />
            Chauffeur
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center">
          <Checkbox
            id="termsAndConditions"
            name="termsAndConditions" // name prop might not be used by Radix but good for forms
            checked={agreedToTerms}
            onCheckedChange={(isChecked) => setAgreedToTerms(!!isChecked)}
            disabled={loading}
            className="h-4 w-4 text-kole-blue-primary border-kole-border rounded focus-visible:ring-1 focus-visible:ring-kole-blue-primary data-[state=checked]:bg-kole-blue-primary data-[state=checked]:text-white"
          />
          <label htmlFor="termsAndConditions" className="ml-2 block text-xs text-kole-text-secondary">
            J'accepte les <a href="/terms" target="_blank" rel="noopener noreferrer" className="font-medium text-kole-blue-primary hover:underline">Termes & Conditions</a> et la <a href="/privacy" target="_blank" rel="noopener noreferrer" className="font-medium text-kole-blue-primary hover:underline">Politique de Confidentialité</a>.
          </label>
        </div>
      </div>
    </>
  );

  const renderDriverStep2 = () => (
    <>
      <h1 className="text-2xl font-bold text-center text-kole-text-primary mb-1">Informations Chauffeur</h1>
      <p className="text-center text-sm text-kole-text-secondary mb-6">Véhicule & Documents</p>

      <div className="mb-4">
        <label htmlFor="vehicleTypeDisplay" className="block text-sm font-medium text-kole-text-primary mb-1">Type de véhicule</label>
        <div className="relative">
            <Bike className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-kole-text-secondary" />
            <Input type="text" id="vehicleTypeDisplay" value={vehicleType} readOnly className="w-full pl-10 pr-4 py-3 border-kole-border rounded-lg-kole bg-gray-100 cursor-not-allowed kole-input" />
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="licenseNumber" className="block text-sm font-medium text-kole-text-primary mb-1">Numéro de permis de conduire</label>
        <div className="relative">
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-kole-text-secondary" />
            <Input type="text" id="licenseNumber" placeholder="Votre numéro de permis" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} className="w-full pl-10 pr-4 py-3 border-kole-border rounded-lg-kole focus:ring-kole-blue-primary kole-input" required disabled={loading} />
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="licensePlate" className="block text-sm font-medium text-kole-text-primary mb-1">Plaque d'immatriculation (Moto)</label>
        <div className="relative">
            <ShieldQuestion className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-kole-text-secondary" />
            <Input type="text" id="licensePlate" placeholder="AB-123-CD" value={licensePlate} onChange={(e) => setLicensePlate(e.target.value)} className="w-full pl-10 pr-4 py-3 border-kole-border rounded-lg-kole focus:ring-kole-blue-primary kole-input" required disabled={loading} />
        </div>
      </div>

      <p className="text-sm text-kole-text-secondary mb-2">Documents à fournir (Photo de profil, Pièce d'identité, Permis de conduire, Carte grise du véhicule) :</p>
      <div className="mb-4">
        <label htmlFor="profilePhotoUpload" className="block text-sm font-medium text-kole-text-primary mb-1">Photo de profil</label>
        <Input type="file" id="profilePhotoUpload" disabled={loading} className="w-full text-sm text-kole-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-kole-blue-primary file:text-white hover:file:bg-kole-blue-dark kole-input" />
      </div>
      <div className="mb-4">
        <label htmlFor="idCardUpload" className="block text-sm font-medium text-kole-text-primary mb-1">Pièce d'identité</label>
        <Input type="file" id="idCardUpload" disabled={loading} className="w-full text-sm text-kole-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-kole-blue-primary file:text-white hover:file:bg-kole-blue-dark kole-input" />
      </div>
      <div className="mb-4">
        <label htmlFor="driverLicenseUpload" className="block text-sm font-medium text-kole-text-primary mb-1">Permis de conduire</label>
        <Input type="file" id="driverLicenseUpload" disabled={loading} className="w-full text-sm text-kole-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-kole-blue-primary file:text-white hover:file:bg-kole-blue-dark kole-input" />
      </div>
      <div className="mb-4">
        <label htmlFor="vehicleRegUpload" className="block text-sm font-medium text-kole-text-primary mb-1">Carte grise du véhicule</label>
        <Input type="file" id="vehicleRegUpload" disabled={loading} className="w-full text-sm text-kole-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-kole-blue-primary file:text-white hover:file:bg-kole-blue-dark kole-input" />
      </div>

       <Button
        type="button"
        onClick={() => { if (!loading) setStep(1); }}
        disabled={loading}
        className="w-full bg-kole-cream text-kole-text-primary py-3 rounded-lg-kole hover:bg-kole-hover-bg border border-kole-border transition duration-300 font-semibold flex items-center justify-center mt-4 h-auto text-base"
      >
        Précédent
      </Button>
    </>
  );

  return (
    <>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md border border-red-300">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        {step === 1 && renderStep1()}
        {step === 2 && accountType === "driver" && renderDriverStep2()}

        <Button
          type="submit"
          disabled={loading || (step === 1 && (!accountType || !agreedToTerms))}
          className={`w-full kole-btn-primary py-3.5 text-lg font-semibold flex items-center justify-center mt-6 ${(loading || (step === 1 && (!accountType || !agreedToTerms))) ? 'opacity-50 cursor-not-allowed' : ''}`} // Adjusted to text-lg and py-3.5 for consistency
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" /> {/* Using Loader2 */}
              {accountType === "driver" && step === 1 ? "Chargement..." : "Inscription..."}
            </span>
          ) : (
            <>
              {accountType === "driver" && step === 1 ? "Suivant" : "S'inscrire"} <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </form>
    </>
  );
};

export default SignUpForm;
