// src/pages/ForgotPasswordPage.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Send, CheckCircle, Phone } from "lucide-react";
import AuthLayout from '../../components/Layout/AuthLayout';
import { Input } from "@/components/ui/input"; // Import Input
import { Button } from "@/components/ui/button"; // Import Button
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next'; // Import useTranslation

// Zod Schema with translation keys
const forgotPasswordSchema = z.object({
  phoneNumber: z.string()
    .min(10, { message: "forgotPasswordPage.validation.phoneNumberInvalidMin" })
    .regex(/^\+[1-9]\d{7,14}$/, { message: "forgotPasswordPage.validation.phoneNumberFormat" }),
});
type ForgotPasswordInputs = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation(); // Initialize useTranslation
  const [submitted, setSubmitted] = useState(false);
  const [submittedPhoneNumber, setSubmittedPhoneNumber] = useState(""); // To display in success message
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordInputs>({
    resolver: zodResolver(forgotPasswordSchema), // Schema messages are now keys
    mode: 'onChange',
    defaultValues: { phoneNumber: '' },
  });

  const onSubmitRHF: SubmitHandler<ForgotPasswordInputs> = async (data) => {
    setLoading(true);
    // TODO: Implémenter la logique d'envoi du lien/code de réinitialisation avec Firebase
    console.log("Demande de réinitialisation pour:", data.phoneNumber);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSubmittedPhoneNumber(data.phoneNumber);
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <AuthLayout>
      <div className="bg-white p-8 rounded-xl-kole shadow-lg w-full">
        {!submitted ? (
          <>
            <h2 className="text-xl font-bold text-center text-kole-text-primary mb-2">{t('forgotPasswordPage.formTitle')}</h2>
            <p className="text-center text-sm text-kole-text-secondary mb-6">
              {t('forgotPasswordPage.formDescription')}
            </p>

            <form onSubmit={handleSubmit(onSubmitRHF)} className="space-y-6">
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-kole-text-dark mb-2">
                  {t('forgotPasswordPage.labels.phoneNumber')}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-kole-text-secondary" />
                  <Input
                    type="tel"
                    id="phoneNumber"
                    placeholder={t('forgotPasswordPage.placeholders.phoneNumber')}
                    className="pl-10 kole-input"
                    {...register("phoneNumber")}
                    disabled={loading}
                    aria-invalid={!!errors.phoneNumber}
                    aria-describedby="phoneNumberErrorFGP"
                  />
                </div>
                {errors.phoneNumber && <p id="phoneNumberErrorFGP" className="text-xs text-red-500 mt-1">{errors.phoneNumber.message ? t(errors.phoneNumber.message) : null}</p>}
              </div>

              <Button
                type="submit"
                className="w-full kole-btn-primary py-3 text-lg font-semibold flex items-center justify-center"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('forgotPasswordPage.buttons.sendingCode')}
                  </span>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" /> {t('forgotPasswordPage.buttons.sendCode')}
                  </>
                )}
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-xl font-bold text-kole-text-primary mb-2">{t('forgotPasswordPage.confirmation.title')}</h2>
            <p className="text-sm text-kole-text-secondary mb-6">
              {t('forgotPasswordPage.confirmation.description', { phoneNumber: submittedPhoneNumber })}
            </p>
          </div>
        )}

        <p className="mt-8 text-center text-sm text-kole-text-secondary">
          <Link to="/login" className="font-medium text-kole-blue-primary hover:underline flex items-center justify-center">
            <ArrowLeft className="mr-1 h-4 w-4" /> {t('forgotPasswordPage.links.backToLogin')}
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
