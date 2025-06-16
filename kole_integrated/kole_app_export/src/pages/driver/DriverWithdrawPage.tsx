// src/pages/driver/DriverWithdrawPage.tsx
import React, { useState } from 'react';
import { FaArrowLeft, FaMoneyBillWave } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// Types pour les méthodes de retrait
type WithdrawalMethod = 'orange_money' | 'mtn_money' | 'moov_money' | 'wave';

interface WithdrawalOption {
  id: WithdrawalMethod;
  name: string;
  icon: string;
}

// Options de retrait disponibles
const withdrawalOptions: WithdrawalOption[] = [
  { id: 'orange_money', name: 'Orange Money', icon: '🟠' },
  { id: 'mtn_money', name: 'MTN Mobile Money', icon: '🟡' },
  { id: 'moov_money', name: 'Moov Money', icon: '🔵' },
  { id: 'wave', name: 'Wave', icon: '🌊' }
];

// Montants prédéfinis pour le retrait
const predefinedAmounts = [5000, 10000, 15000, 20000];

const DriverWithdrawalPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<WithdrawalMethod | null>(null);
  const [amount, setAmount] = useState<number | ''>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Solde disponible (fictif)
  const availableBalance = 45000;
  
  // Gérer la sélection d'un montant prédéfini
  const handleSelectAmount = (value: number) => {
    setAmount(value);
  };
  
  // Gérer la soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMethod || !amount || !phoneNumber) {
      alert('Veuillez remplir tous les champs');
      return;
    }
    
    if (amount > availableBalance) {
      alert('Montant insuffisant dans votre solde');
      return;
    }
    
    setIsProcessing(true);
    
    // Simuler un traitement de retrait
    setTimeout(() => {
      setIsProcessing(false);
      alert(`Retrait de ${amount} FCFA vers ${selectedMethod} au numéro ${phoneNumber} effectué avec succès!`);
      navigate('/driver/earnings');
    }, 2000);
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-primary-600 text-white p-6">
        <div className="flex items-center mb-4">
          <button onClick={() => navigate(-1)} className="mr-4">
            <FaArrowLeft />
          </button>
          <h1 className="text-2xl font-bold">Retrait d'argent</h1>
        </div>
        
        <div className="bg-white text-gray-800 rounded-xl p-4 shadow-inner">
          <p className="text-gray-500 text-sm">Solde disponible</p>
          <p className="text-2xl font-bold">{availableBalance.toLocaleString()} FCFA</p>
        </div>
      </div>
      
      <div className="p-6">
        <form onSubmit={handleSubmit}>
          {/* Sélection de la méthode de retrait */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Méthode de retrait</label>
            <div className="grid grid-cols-2 gap-3">
              {withdrawalOptions.map(option => (
                <button
                  key={option.id}
                  type="button"
                  className={`p-3 border rounded-xl flex items-center ${
                    selectedMethod === option.id 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-300'
                  }`}
                  onClick={() => setSelectedMethod(option.id)}
                >
                  <span className="text-2xl mr-2">{option.icon}</span>
                  <span>{option.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Montant du retrait */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Montant (FCFA)</label>
            <div className="grid grid-cols-2 gap-3 mb-3">
              {predefinedAmounts.map(preAmount => (
                <button
                  key={preAmount}
                  type="button"
                  className={`p-2 border rounded-lg ${
                    amount === preAmount 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-300'
                  }`}
                  onClick={() => handleSelectAmount(preAmount)}
                >
                  {preAmount.toLocaleString()} FCFA
                </button>
              ))}
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Montant personnalisé"
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          {/* Numéro de téléphone */}
          <div className="mb-8">
            <label className="block text-gray-700 font-medium mb-2">Numéro de téléphone</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Ex: 07 XX XX XX XX"
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          {/* Bouton de soumission */}
          <button
            type="submit"
            disabled={!selectedMethod || !amount || !phoneNumber || isProcessing}
            className={`w-full bg-primary-600 text-white py-4 rounded-xl flex items-center justify-center ${
              (!selectedMethod || !amount || !phoneNumber || isProcessing) ? 'opacity-50' : ''
            }`}
          >
            {isProcessing ? (
              <>Traitement en cours...</>
            ) : (
              <>
                <FaMoneyBillWave className="mr-2" />
                Effectuer le retrait
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DriverWithdrawalPage;
