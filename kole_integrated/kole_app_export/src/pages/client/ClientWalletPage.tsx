// src/pages/client/ClientWalletPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card"; // Removed CardHeader, CardTitle as they are not directly used for top-level card
import { ScrollArea } from "../../components/ui/scroll-area";
import { Loader2, AlertTriangle, PlusCircle } from "lucide-react"; // Added Loader2, AlertTriangle, PlusCircle
import ClientBottomNavBar from "../../components/ClientBottomNavBar";
import { getWalletDetails, getWalletTransactions, WalletTransaction, ServiceError } from "../../services/userService";
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns'; // For date formatting
import { fr } from 'date-fns/locale'; // For French date formatting

const ClientWalletPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [currentTransactionPage, setCurrentTransactionPage] = useState(1);
  const [totalTransactionPages, setTotalTransactionPages] = useState(0);

  useEffect(() => {
    const fetchBalance = async () => {
      setIsLoadingBalance(true);
      const result = await getWalletDetails();
      if (result.data) {
        setBalance(result.data.balance);
      } else if (result.error) {
        toast.error(t(result.error.messageKey, { details: result.error.details }));
      }
      setIsLoadingBalance(false);
    };
    fetchBalance();
  }, [t]);

  const fetchTransactions = async (page: number) => {
    setIsLoadingTransactions(true);
    const result = await getWalletTransactions(page, 6); // Fetch 6 items per page
    if (result.data) {
      setTransactions(result.data);
      setTotalTransactionPages(result.totalPages);
      setCurrentTransactionPage(result.currentPage);
    } else if (result.error) {
      toast.error(t(result.error.messageKey, { details: result.error.details }));
      setTransactions([]);
      setTotalTransactionPages(0);
    }
    setIsLoadingTransactions(false);
  };

  useEffect(() => {
    fetchTransactions(currentTransactionPage);
  }, [currentTransactionPage, t]);


  const handlePreviousPage = () => {
    setCurrentTransactionPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentTransactionPage((prev) => Math.min(totalTransactionPages, prev + 1));
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMMM yyyy 'à' HH:mm", { locale: fr });
    } catch (e) {
      return dateString; // Fallback if date is not valid ISO
    }
  };


  return (
    <div className="h-screen flex flex-col bg-kole-cream-bg">
      <div className="bg-kole-cream-bg p-4 pt-6 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-kole-text-primary ml-1">{t('clientWalletPage.title')}</h1>
        {/* Add filter button if needed later */}
      </div>
      
      <div className="px-4 mb-5">
        <Card className="bg-white text-kole-text-primary rounded-xl-kole shadow-sm border-kole-border overflow-hidden">
          <CardContent className="p-5 text-center">
            <p className="text-sm text-kole-text-secondary mb-1">{t('clientWalletPage.balanceLabel')}</p>
            {isLoadingBalance ? (
              <div className="flex items-center justify-center h-12">
                <Loader2 className="h-8 w-8 animate-spin text-kole-blue-primary" />
              </div>
            ) : balance !== null ? (
              <p className="text-4xl font-bold text-kole-blue-primary">
                {t('clientWalletPage.balanceFormat', { balance: balance.toLocaleString('fr-FR') })}
              </p>
            ) : (
              <p className="text-lg font-semibold text-kole-destructive">{t('userService.errors.fetchWalletDetailsFailed')}</p>
            )}
            <Button 
              className="w-full mt-4 kole-btn-primary py-3 text-base" // Using kole-btn-primary for consistency
              onClick={() => navigate("/client/topup")} 
            >
              <PlusCircle className="mr-2 h-5 w-5" /> {t('clientWalletPage.rechargeButton')}
            </Button>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-lg font-semibold text-kole-text-primary mb-2 px-4">{t('clientWalletPage.transactionsTitle')}</h2>
      {isLoadingTransactions && transactions.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
          <Loader2 className="h-12 w-12 animate-spin text-kole-blue-primary mb-4" />
          <p className="text-kole-text-secondary">{t('clientWalletPage.loadingTransactions')}</p>
        </div>
      ) : !isLoadingTransactions && transactions.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
          <AlertTriangle className="h-16 w-16 text-kole-text-tertiary mb-4" />
          <p className="text-lg text-kole-text-secondary">{t('clientWalletPage.emptyTransactions')}</p>
        </div>
      ) : (
        <ScrollArea className="flex-grow px-4 pb-1">
          <div className="space-y-2.5">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3.5 bg-white rounded-lg-kole shadow-sm border-kole-border">
                <div>
                  <p className="font-medium text-sm text-kole-text-primary">{transaction.description}</p>
                  <p className="text-xs text-kole-text-tertiary">{formatDate(transaction.date)}</p>
                </div>
                <p className={`font-semibold text-sm ${transaction.type === "credit" ? "text-kole-green-dark" : "text-kole-destructive"}`}>
                  {transaction.type === "credit" ? "+" : "-"}{Math.abs(transaction.amount).toLocaleString('fr-FR')} FCFA
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {totalPages > 0 && (
         <div className="p-4 border-t border-kole-border bg-white flex items-center justify-between sticky bottom-16 md:bottom-0"> {/* Adjusted sticky bottom */}
          <Button
            variant="outline"
            className="kole-btn-outline"
            onClick={handlePreviousPage}
            disabled={currentPage <= 1 || isLoadingTransactions}
          >
            {t('clientWalletPage.pagination.previous')}
          </Button>
          <span className="text-sm text-kole-text-secondary">
            {t('clientWalletPage.pagination.pageInfo', { currentPage, totalPages })}
          </span>
          <Button
            variant="outline"
            className="kole-btn-outline"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages || isLoadingTransactions}
          >
            {t('clientWalletPage.pagination.next')}
          </Button>
        </div>
      )}
      <ClientBottomNavBar />
    </div>
  );
};

export default ClientWalletPage;
