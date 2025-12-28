// src/pages/client/ClientTopUpPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import ClientBottomNavBar from "../../components/ClientBottomNavBar";
import * as paymentService from "../../services/paymentService";
import { useTranslation } from 'react-i18next';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { cn } from "@/lib/utils"; // For conditional classNames

// Placeholder for payment operator logos
const FimeLogo = () => <div className="w-10 h-6 bg-gray-300 rounded-sm flex items-center justify-center text-gray-600 text-xs font-bold">F</div>;
const WaveLogo = () => <div className="w-10 h-6 bg-sky-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">W</div>;
const OrangeMoneyLogo = () => <div className="w-10 h-6 bg-orange-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">OM</div>;
const MtnMoneyLogo = () => <div className="w-10 h-6 bg-yellow-400 rounded-sm flex items-center justify-center text-black text-xs font-bold">MTN</div>;
const MoovMoneyLogo = () => <div className="w-10 h-6 bg-blue-600 rounded-sm flex items-center justify-center text-white text-xs font-bold">Moov</div>;


const predefinedAmounts = [500, 1000, 2000, 5000];
const MIN_AMOUNT = 100; // Example minimum amount

// Zod Schema
const topUpSchema = (t: (key: string, params?: any) => string) => z.object({
  amount: z.number()
    .positive({ message: t("clientTopUpPage.validation.amountRequired") })
    .min(MIN_AMOUNT, { message: t("clientTopUpPage.validation.amountTooLow", {minAmount: MIN_AMOUNT}) }),
  operator: z.string({ required_error: t("clientTopUpPage.validation.operatorRequired") })
    .min(1, { message: t("clientTopUpPage.validation.operatorRequired") }),
});

type TopUpFormValues = z.infer<ReturnType<typeof topUpSchema>>;

const ClientTopUpPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showCustomAmountInput, setShowCustomAmountInput] = useState(false);
  const [finalAmountForModal, setFinalAmountForModal] = useState(0);

  const { register, handleSubmit, formState: { errors, isValid }, control, setValue, watch } = useForm<TopUpFormValues>({
    resolver: zodResolver(topUpSchema(t)), // Pass t to schema if messages are dynamic
    mode: 'onChange',
    defaultValues: {
      amount: 0,
      operator: '',
    }
  });

  const currentAmount = watch('amount');
  const currentOperator = watch('operator');

  const handleAmountButtonClick = (amount: number) => {
    setValue('amount', amount, { shouldValidate: true, shouldDirty: true });
    setShowCustomAmountInput(false);
  };

  const handleShowCustomAmountInput = () => {
    setShowCustomAmountInput(true);
    setValue('amount', 0, { shouldValidate: true }); // Reset or set to a value that needs input
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = parseFloat(value);
    setValue('amount', isNaN(numericValue) ? 0 : numericValue, { shouldValidate: true, shouldDirty: true });
  };

  const processTopUp: SubmitHandler<TopUpFormValues> = async (data) => {
    setIsProcessingPayment(true);
    setFinalAmountForModal(data.amount);

    const result = await paymentService.initiateMobileMoneyTopUp({
      amount: data.amount,
      operator: data.operator,
    });

    if (result.error) {
      toast.error(t(result.error.messageKey, { details: result.error.details, operator: data.operator }));
    } else if (result.data?.success && result.data.messageKey) {
      toast.success(t(result.data.messageKey, { amount: data.amount, transactionId: result.data.transactionId }));
      setShowSuccessModal(true);
      // No automatic redirect from modal, user will close it or be redirected by other means
    }
    setIsProcessingPayment(false);
  };

  const handleModalCloseAndRedirect = () => {
    setShowSuccessModal(false);
    navigate("/client/wallet");
  }

  const operatorOptions = [
    { code: 'ORANGE_MONEY', labelKey: 'clientTopUpPage.operatorOrangeMoney', logo: <OrangeMoneyLogo /> },
    { code: 'MTN_MONEY', labelKey: 'clientTopUpPage.operatorMtnMoney', logo: <MtnMoneyLogo /> },
    { code: 'MOOV_MONEY', labelKey: 'clientTopUpPage.operatorMoovMoney', logo: <MoovMoneyLogo /> },
    // { code: 'WAVE', labelKey: 'Wave', logo: <WaveLogo /> }, // Example
    // { code: 'FIMEE', labelKey: 'Fimée', logo: <FimeLogo /> } // Example
  ];


  return (
    <div className="h-screen flex flex-col bg-kole-cream-bg">
      <div className="bg-kole-cream-bg p-4 pt-6 flex items-center sticky top-0 z-20 border-b border-kole-border">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-2 hover:bg-kole-hover-bg rounded-full">
          <ArrowLeft size={24} className="text-kole-text-primary" />
        </Button>
        <h1 className="text-xl font-semibold text-kole-text-primary">{t('clientTopUpPage.pageTitle')}</h1>
      </div>

      <form onSubmit={handleSubmit(processTopUp)} className="flex-grow overflow-y-auto p-4 space-y-5">
        <div className="text-center mb-4">
          <img src="/assets/kole_logo_principal.png" alt={t('clientTopUpPage.koleLogoAlt')} className="h-10 mx-auto mb-1" />
        </div>
        
        <div>
          <label className="block text-base font-medium text-kole-text-primary mb-2.5">{t('clientTopUpPage.selectAmountLabel')}</label>
          <div className="grid grid-cols-2 gap-3 mb-3">
            {predefinedAmounts.map((amount) => (
              <Button 
                key={amount} 
                type="button"
                variant={currentAmount === amount && !showCustomAmountInput ? "default" : "outline"}
                onClick={() => handleAmountButtonClick(amount)}
                className={cn(`w-full py-3 text-sm rounded-lg-kole font-medium`,
                            currentAmount === amount && !showCustomAmountInput
                              ? "kole-btn-primary shadow-md"
                              : "border-kole-border text-kole-text-primary bg-white hover:bg-kole-hover-bg hover:border-kole-blue-primary")}
              >
                {amount.toLocaleString('fr-FR')} FCFA
              </Button>
            ))}
            <Button 
              type="button"
              variant={showCustomAmountInput ? "default" : "outline"}
              onClick={handleShowCustomAmountInput}
              className={cn(`w-full py-3 text-sm rounded-lg-kole font-medium`,
                          showCustomAmountInput
                            ? "kole-btn-primary shadow-md"
                            : "border-kole-border text-kole-text-primary bg-white hover:bg-kole-hover-bg hover:border-kole-blue-primary")}
            >
              {t('clientTopUpPage.otherAmountButton')}
            </Button>
          </div>
          {showCustomAmountInput && (
            <Input 
              type="number" 
              placeholder={t('clientTopUpPage.enterAmountPlaceholder')}
              className="w-full py-3 border-kole-border rounded-lg-kole focus:ring-kole-blue-primary focus:border-kole-blue-primary text-center bg-white text-kole-text-primary placeholder:text-kole-text-secondary kole-input"
              {...register('amount', { valueAsNumber: true, onChange: handleCustomAmountChange })}
              autoFocus
            />
          )}
          {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
        </div>

        <div>
          <label className="block text-base font-medium text-kole-text-primary mb-2.5">{t('clientTopUpPage.paymentMethodLabel')}</label>
          <Controller
            name="operator"
            control={control}
            render={({ field }) => (
              <div className="space-y-2.5">
                {operatorOptions.map(op => (
                  <div
                    key={op.code}
                    onClick={() => setValue('operator', op.code, {shouldValidate: true, shouldDirty: true})}
                    className={cn(`p-4 border rounded-lg-kole cursor-pointer transition-all duration-200 bg-white flex items-center justify-between`,
                                field.value === op.code
                                  ? "border-kole-blue-primary ring-2 ring-kole-blue-primary shadow-lg"
                                  : "border-kole-border hover:border-kole-blue-primary/50")}
                  >
                    <div className="flex items-center">
                        {op.logo}
                        <span className="ml-3 text-base font-medium text-kole-text-primary">{t(op.labelKey)}</span>
                    </div>
                    {field.value === op.code && <CheckCircle size={20} className="text-kole-blue-primary" />}
                  </div>
                ))}
              </div>
            )}
          />
          {errors.operator && <p className="text-xs text-red-500 mt-1">{errors.operator.message}</p>}
        </div>
          
        <Button 
          type="submit"
          className="w-full kole-btn-primary py-3.5 text-base font-semibold mt-6 shadow-md"
          disabled={isProcessingPayment || !isValid || currentAmount < MIN_AMOUNT}
        >
          {isProcessingPayment ? (
            <span className="flex items-center justify-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('clientTopUpPage.buttons.confirmButtonLoading')}
            </span>
          ) : (
            t('clientTopUpPage.confirmButtonText', { amount: currentAmount > 0 ? currentAmount.toLocaleString('fr-FR') : "..." })
          )}
        </Button>
      </form>
      
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="kole-card bg-white p-6 rounded-xl-kole shadow-2xl w-full max-w-xs text-center flex flex-col items-center">
            <CardContent className="p-0"> {/* Remove CardContent default padding if structure below handles it */}
              <div className="bg-kole-green-light p-3 rounded-full mb-5 inline-block">
                  <CheckCircle size={40} className="text-kole-green-dark" />
              </div>
              <h3 className="text-xl font-semibold text-kole-text-primary mb-2">{t('clientTopUpPage.successModalTitle')}</h3>
              <p className="text-sm text-kole-text-secondary mb-1">
                {t('clientTopUpPage.successModalMessagePrefix')}
              </p>
              <p className="text-2xl font-bold text-kole-blue-primary mb-6">
                  {finalAmountForModal.toLocaleString('fr-FR')} FCFA
              </p>
              <Button onClick={handleModalCloseAndRedirect} className="w-full kole-btn-primary py-2.5">
                {t('clientTopUpPage.buttons.modalClose')}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      <ClientBottomNavBar />
    </div>
  );
};

export default ClientTopUpPage;
