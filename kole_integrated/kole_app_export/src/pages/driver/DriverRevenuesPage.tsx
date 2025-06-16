// src/pages/driver/DriverRevenuesPage.tsx
import React, { useState } from 'react';
import { FaWallet, FaMoneyBillWave, FaHistory } from 'react-icons/fa';
import DriverBottomNav from '../../components/driver/DriverBottomNav';

// Types pour les transactions
type TransactionType = 'earn' | 'commission' | 'withdrawal' | 'bonus';

// Données fictives pour les statistiques et l'historique
const dummyData = {
    balance: 45000,
    todayEarnings: 12500,
    weekEarnings: 35000,
    monthEarnings: 150000,
    transactions: [
        {
            id: '1',
            description: 'Course #12345',
            amount: 2500,
            date: '2023-05-17',
            type: 'earn' as TransactionType
        },
        {
            id: '2',
            description: 'Commission Kôlê',
            amount: -250,
            date: '2023-05-17',
            type: 'commission' as TransactionType
        },
        {
            id: '3',
            description: 'Retrait vers Orange Money',
            amount: -10000,
            date: '2023-05-16',
            type: 'withdrawal' as TransactionType
        },
        {
            id: '4',
            description: 'Bonus fidélité',
            amount: 1000,
            date: '2023-05-15',
            type: 'bonus' as TransactionType
        }
    ]
};

const DriverRevenuesPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'today' | 'week' | 'month'>('today');
    
    // Formater les montants en FCFA
    const formatAmount = (amount: number) => {
        return `${amount.toLocaleString()} FCFA`;
    };
    
    // Déterminer la classe CSS en fonction du type de transaction
    const getTransactionClass = (type: TransactionType) => {
        switch(type) {
            case 'earn':
            case 'bonus':
                return 'text-green-600';
            case 'commission':
            case 'withdrawal':
                return 'text-red-600';
            default:
                return '';
        }
    };
    
    // Formater le montant avec signe + ou -
    const formatTransactionAmount = (amount: number) => {
        return amount > 0 ? `+${formatAmount(amount)}` : formatAmount(amount);
    };
    
    return (
        <div className="min-h-screen bg-gray-100">
            <div className="bg-primary-600 text-white p-6 rounded-b-3xl shadow-md">
                <h1 className="text-2xl font-bold mb-4">Mes Revenus</h1>
                
                <div className="bg-white text-gray-800 rounded-xl p-4 shadow-inner">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Solde disponible</p>
                            <p className="text-2xl font-bold">{formatAmount(dummyData.balance)}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="p-6">
                {/* Onglets pour les périodes */}
                <div className="flex bg-white rounded-xl mb-6 shadow-md">
                    <button 
                        className={`flex-1 py-3 text-center ${activeTab === 'today' ? 'text-primary-600 border-b-2 border-primary-600 font-medium' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('today')}
                    >
                        Aujourd'hui
                    </button>
                    <button 
                        className={`flex-1 py-3 text-center ${activeTab === 'week' ? 'text-primary-600 border-b-2 border-primary-600 font-medium' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('week')}
                    >
                        Semaine
                    </button>
                    <button 
                        className={`flex-1 py-3 text-center ${activeTab === 'month' ? 'text-primary-600 border-b-2 border-primary-600 font-medium' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('month')}
                    >
                        Mois
                    </button>
                </div>
                
                {/* Statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-xl shadow-md flex items-center">
                        <div className="bg-blue-100 p-3 rounded-full mr-4">
                            <FaWallet className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Revenus {activeTab === 'today' ? "aujourd'hui" : activeTab === 'week' ? 'cette semaine' : 'ce mois'}</p>
                            <p className="font-bold">
                                {activeTab === 'today' ? formatAmount(dummyData.todayEarnings) : 
                                 activeTab === 'week' ? formatAmount(dummyData.weekEarnings) : 
                                 formatAmount(dummyData.monthEarnings)}
                            </p>
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-xl shadow-md flex items-center">
                        <div className="bg-green-100 p-3 rounded-full mr-4">
                            <FaMoneyBillWave className="text-green-600" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Courses complétées</p>
                            <p className="font-bold">
                                {activeTab === 'today' ? '5' : 
                                 activeTab === 'week' ? '23' : 
                                 '87'}
                            </p>
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-xl shadow-md flex items-center">
                        <div className="bg-purple-100 p-3 rounded-full mr-4">
                            <FaHistory className="text-purple-600" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Heures en ligne</p>
                            <p className="font-bold">
                                {activeTab === 'today' ? '4h 30m' : 
                                 activeTab === 'week' ? '28h 15m' : 
                                 '112h 45m'}
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* Historique des transactions */}
                <div className="bg-white rounded-xl shadow-md p-4">
                    <h3 className="text-lg font-semibold mb-4">Historique des transactions</h3>
                    
                    <div className="space-y-4">
                        {dummyData.transactions.map(transaction => (
                            <div key={transaction.id} className="flex items-center justify-between border-b pb-3">
                                <div>
                                    <p className="font-medium">{transaction.description}</p>
                                    <p className="text-gray-500 text-sm">{transaction.date}</p>
                                </div>
                                <p className={getTransactionClass(transaction.type)}>
                                    {formatTransactionAmount(transaction.amount)}
                                </p>
                            </div>
                        ))}
                    </div>
                    
                    <button className="w-full mt-4 text-primary-600 py-2 border border-primary-600 rounded-lg">
                        Voir tout l'historique
                    </button>
                </div>
            </div>
            
            <DriverBottomNav />
        </div>
    );
};

export default DriverRevenuesPage;
