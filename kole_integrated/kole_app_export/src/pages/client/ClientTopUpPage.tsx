// src/pages/client/ClientTopUpPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { ArrowLeft, CheckCircle } from "lucide-react";
import ClientBottomNavBar from "../../components/ClientBottomNavBar";

// Placeholder for payment operator logos - replace with actual SVGs or images
const FimeLogo = () => <div className="w-8 h-5 bg-gray-300 rounded-sm flex items-center justify-center text-gray-600 text-xs font-bold">F</div>;
const WaveLogo = () => <div className="w-8 h-5 bg-blue-300 rounded-sm flex items-center justify-center text-blue-700 text-xs font-bold">W</div>;
const OrangeMoneyLogo = () => <div className="w-8 h-5 bg-orange-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">OM</div>;

const predefinedAmounts = [500, 1000, 2000];

const ClientTopUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedAmount, setSelectedAmount] = useState<number | string>("");
  const [customAmountInput, setCustomAmountInput] = useState<string>("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("Mobile Money"); // Default to Mobile Money as per mockup
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleAmountButtonClick = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmountInput(""); 
  };

  const handleCustomAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
        setCustomAmountInput(value);
        setSelectedAmount(value); 
    }
  };

  const handleShowCustomAmountInput = () => {
    setSelectedAmount("custom"); // Special value to indicate custom input is active
    setCustomAmountInput("");
    // Optionally focus the input field here using a ref
  };

  const getFinalAmount = () => {
    if (selectedAmount === "custom") {
      return parseFloat(customAmountInput) || 0;
    }
    return parseFloat(String(selectedAmount)) || 0;
  };

  const handleConfirmTopUp = () => {
    const amountToRecharge = getFinalAmount();
    if (amountToRecharge <= 0) {
      alert("Veuillez sélectionner ou entrer un montant valide.");
      return;
    }
    if (!selectedPaymentMethod) {
        alert("Veuillez sélectionner un mode de paiement.");
        return;
    }
    // Simulate success and show modal
    setShowSuccessModal(true);
    // In a real app, here you would call the payment API
    // After payment success/failure, navigate or show appropriate message
    // For now, just navigate back to wallet after a delay
    setTimeout(() => {
        setShowSuccessModal(false);
        navigate("/client/wallet");
    }, 3000);
  };

  return (
    <div className="h-screen flex flex-col bg-kole-cream-bg">
      {/* Header */}
      <div className="bg-kole-cream-bg p-4 pt-6 flex items-center sticky top-0 z-20">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-200/50">
          <ArrowLeft size={24} className="text-kole-text-primary" />
        </button>
        <h1 className="text-xl font-semibold text-kole-text-primary ml-3">Recharger mon portefeuille</h1>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-5">
        <div className="text-center mb-4">
          <img src="/assets/branding/Kôlê.png" alt="Kôlê Logo" className="h-10 mx-auto mb-1" /> 
        </div>
        
        <div>
          <label className="block text-base font-medium text-kole-text-primary mb-2.5">Choisir un montant</label>
          <div className="grid grid-cols-2 gap-3 mb-3">
            {predefinedAmounts.map((amount) => (
              <Button 
                key={amount} 
                variant={selectedAmount === amount ? "default" : "outline"} 
                onClick={() => handleAmountButtonClick(amount)}
                className={`w-full py-3 text-sm rounded-lg-kole font-medium 
                            ${selectedAmount === amount 
                              ? "bg-kole-blue-primary text-white border-kole-blue-primary shadow-md"
                              : "border-kole-border text-kole-text-primary bg-white hover:bg-kole-hover-bg hover:border-kole-blue-primary"}`}
              >
                {amount.toLocaleString()} FCFA
              </Button>
            ))}
            <Button 
              variant={selectedAmount === "custom" ? "default" : "outline"} 
              onClick={handleShowCustomAmountInput}
              className={`w-full py-3 text-sm rounded-lg-kole font-medium 
                          ${selectedAmount === "custom" 
                            ? "bg-kole-blue-primary text-white border-kole-blue-primary shadow-md"
                            : "border-kole-border text-kole-text-primary bg-white hover:bg-kole-hover-bg hover:border-kole-blue-primary"}`}
            >
              Autre montant
            </Button>
          </div>
          {selectedAmount === "custom" && (
            <Input 
              type="number" 
              placeholder="Entrez le montant"
              value={customAmountInput}
              onChange={handleCustomAmountInputChange}
              className="w-full py-3 border-kole-border rounded-lg-kole focus:ring-kole-blue-primary focus:border-kole-blue-primary text-center bg-white text-kole-text-primary placeholder:text-kole-text-secondary"
              autoFocus
            />
          )}
        </div>

        <div>
          <label className="block text-base font-medium text-kole-text-primary mb-2.5">Mode de paiement</label>
          <div 
            onClick={() => setSelectedPaymentMethod("Mobile Money")} 
            className={`p-4 border rounded-lg-kole cursor-pointer transition-all duration-200 bg-white 
                        ${selectedPaymentMethod === "Mobile Money" 
                          ? "border-kole-blue-primary ring-2 ring-kole-blue-primary shadow-lg"
                          : "border-kole-border hover:border-kole-blue-primary/50"}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-base font-medium text-kole-text-primary">Mobile Money</span>
              {selectedPaymentMethod === "Mobile Money" && <CheckCircle size={20} className="text-kole-blue-primary" />}
            </div>
            <div className="flex space-x-2 mt-2.5 pt-2.5 border-t border-kole-border/50">
              <FimeLogo />
              <WaveLogo />
              <OrangeMoneyLogo />
              {/* Add more operator logos as needed */}
            </div>
          </div>
          {/* Add other payment methods here if needed, e.g., Card payment */}
        </div>
          
        <Button 
          onClick={handleConfirmTopUp} 
          className="w-full bg-kole-blue-primary text-white py-3.5 rounded-lg-kole hover:bg-kole-blue-dark transition duration-300 font-semibold text-base mt-6 shadow-md"
          disabled={getFinalAmount() <= 0 || !selectedPaymentMethod}
        >
          Confirmer le rechargement de {getFinalAmount() > 0 ? getFinalAmount().toLocaleString() : "X"} FCFA
        </Button>
      </div>
      
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-xl-kole shadow-2xl w-full max-w-xs text-center flex flex-col items-center">
            <div className="bg-green-100 p-3 rounded-full mb-5">
                <CheckCircle size={40} className="text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-kole-text-primary mb-2">Rechargement Réussi !</h3>
            <p className="text-sm text-kole-text-secondary mb-1">
              Votre portefeuille a été rechargé de
            </p>
            <p className="text-2xl font-bold text-kole-blue-primary mb-6">
                {getFinalAmount().toLocaleString()} FCFA
            </p>
            {/* <Button onClick={() => {setShowSuccessModal(false); navigate("/client/wallet");}} className="w-full bg-kole-blue-primary text-white rounded-lg-kole py-2.5">Super !</Button> */}
          </div>
        </div>
      )}
      <ClientBottomNavBar />
    </div>
  );
};

export default ClientTopUpPage;

