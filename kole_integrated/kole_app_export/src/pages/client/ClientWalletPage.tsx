// src/pages/client/ClientWalletPage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { ScrollArea } from "../../components/ui/scroll-area";
// import { ArrowLeft, PlusCircle, Download, Upload, ListFilter } from "lucide-react"; // PlusCircle, Download, Upload non utilisés. ArrowLeft et ListFilter commentés dans le code.
import ClientBottomNavBar from "../../components/ClientBottomNavBar";

// Dummy data structure based on the mockup "Client_Portefeuille.png"
const walletData = {
  balance: 1500, // Solde en FCFA
  transactions: [
    {
      id: "t1",
      date: "08/05/2025",
      description: "Recharge Mobile Money",
      amount: 1000,
      type: "credit" as "credit" | "debit",
    },
    {
      id: "t2",
      date: "07/05/2028", // Date seems off in mockup, using as is for now
      description: "Paiement course",
      amount: -500,
      type: "debit" as "credit" | "debit",
    },
    // Add more transactions to test scrolling if needed
    {
      id: "t3",
      date: "06/05/2025",
      description: "Recharge Kôlê",
      amount: 2000,
      type: "credit" as "credit" | "debit",
    },
    {
      id: "t4",
      date: "05/05/2025",
      description: "Course Kôlê",
      amount: -800,
      type: "debit" as "credit" | "debit",
    },
  ]
};

const ClientWalletPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col bg-kole-cream-bg">
      {/* Header */}
      <div className="bg-kole-cream-bg p-4 pt-6 flex items-center justify-between sticky top-0 z-10">
        {/* <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-200/50">
          <ArrowLeft size={24} className="text-kole-text-primary" />
        </button> */}
        <h1 className="text-2xl font-bold text-kole-text-primary ml-1">Mon Portefeuille Kôlê</h1>
        {/* Filter button can be added if functionality is required */}
        {/* <button className="p-2 rounded-full hover:bg-gray-200/50">
          <ListFilter size={22} className="text-kole-text-primary" />
        </button> */}
      </div>
      
      {/* Balance Card */}
      <div className="px-4 mb-5">
        <Card className="bg-white text-kole-text-primary rounded-xl-kole shadow-sm border-kole-border overflow-hidden">
          <CardContent className="p-5 text-center">
            <p className="text-sm text-kole-text-secondary mb-1">Solde actuel :</p>
            <p className="text-4xl font-bold text-kole-blue-primary">{walletData.balance.toLocaleString()}<span className="text-3xl align-baseline"> FCFA</span></p>
            <Button 
              className="w-full mt-4 bg-kole-blue-primary text-white py-3 rounded-lg-kole hover:bg-kole-blue-dark transition duration-300 font-semibold text-base"
              onClick={() => navigate("/client/topup")} 
            >
              Recharger mon portefeuille
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <h2 className="text-lg font-semibold text-kole-text-primary mb-2 px-4">Historique des transactions</h2>
      {walletData.transactions.length > 0 ? (
        <ScrollArea className="flex-grow px-4 pb-4">
          <div className="space-y-2.5">
            {walletData.transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3.5 bg-white rounded-lg-kole shadow-sm border-kole-border">
                <div>
                  <p className="font-medium text-sm text-kole-text-primary">{transaction.description}</p>
                  <p className="text-xs text-kole-text-tertiary">{transaction.date}</p>
                </div>
                <p className={`font-semibold text-sm ${transaction.type === "credit" ? "text-green-500" : "text-red-500"}`}>
                  {transaction.type === "credit" ? "+" : "-"}{Math.abs(transaction.amount).toLocaleString()} FCFA
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
          <p className="text-kole-text-secondary text-base">Aucune transaction pour le moment.</p>
        </div>
      )}
      <ClientBottomNavBar />
    </div>
  );
};

export default ClientWalletPage;

