// src/components/Auth/PhoneSignInForm.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase/config';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { createOrUpdateUser } from '../../services/firestore';
import { Phone, KeyRound, Loader2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next'; // Import useTranslation

// Constants
const CONFIRMATION_CODE_LENGTH = 6;
// GENERIC_PHONE_ERROR will be replaced by a translation key

// Zod Schema with translation keys
const phoneSignInSchema = z.object({
  phoneNumber: z.string()
    .min(10, { message: "phoneSignInForm.validation.phoneNumberTooShort" })
    .regex(/^\+[1-9]\d{7,14}$/, { message: "phoneSignInForm.validation.phoneNumberFormat" }),
  otp: z.string()
    .optional()
    .refine(val => val === undefined || val.length === 0 || val.length === CONFIRMATION_CODE_LENGTH, {
      message: "phoneSignInForm.validation.otpLength", // This key will need {length: CONFIRMATION_CODE_LENGTH} passed to t()
    }),
});
type PhoneSignInInputs = z.infer<typeof phoneSignInSchema>;

interface PhoneSignInFormProps {}

const PhoneSignInForm: React.FC<PhoneSignInFormProps> = () => {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'enterPhone' | 'enterOtp'>('enterPhone');
  const [confirmationResultState, setConfirmationResultState] = useState<ConfirmationResult | null>(null);
  const navigate = useNavigate();

  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  const { register, handleSubmit, formState: { errors }, trigger, getValues, setValue } = useForm<PhoneSignInInputs>({
    resolver: zodResolver(phoneSignInSchema),
    mode: 'onChange',
    defaultValues: { phoneNumber: '', otp: '' }
  });

  useEffect(() => {
    if (recaptchaContainerRef.current && !recaptchaVerifierRef.current && auth) {
      try {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
          'size': 'invisible',
          'callback': () => console.log("reCAPTCHA resolved"),
          'expired-callback': () => {
            console.warn("reCAPTCHA expired");
            setError(t('phoneSignInForm.errors.recaptchaExpired'));
            if (recaptchaVerifierRef.current) {
                recaptchaVerifierRef.current.render().then(widgetId => {
                    // @ts-ignore
                    window.grecaptcha?.reset(widgetId);
                }).catch(err => console.error("Error resetting reCAPTCHA", err));
            }
          }
        });
        recaptchaVerifierRef.current.render().catch(err => {
            console.error("Error rendering reCAPTCHA initially:", err);
            setError(t('phoneSignInForm.errors.recaptchaInitFailed'));
        });
      } catch (error) {
        console.error("Error initializing reCAPTCHA:", error);
        setError(t('phoneSignInForm.errors.recaptchaInitFailed'));
      }
    }
    return () => { /* Cleanup */ };
  }, [auth, t]);

  const handleSendOtpAttempt = async () => {
    setError(null);
    const isValidPhoneNumber = await trigger("phoneNumber");

    if (!isValidPhoneNumber) return;

    if (!recaptchaVerifierRef.current) {
      setError(t('phoneSignInForm.errors.recaptchaNotReady'));
      return;
    }
    setLoading(true);
    const currentPhoneNumberValue = getValues("phoneNumber");

    try {
      const result = await signInWithPhoneNumber(auth, currentPhoneNumberValue, recaptchaVerifierRef.current);
      setConfirmationResultState(result);
      setStep('enterOtp');
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      if (error.code === 'auth/invalid-phone-number') {
        setError(t('phoneSignInForm.errors.invalidPhoneNumberFormatFb'));
      } else if (error.code === 'auth/too-many-requests') {
        setError(t('phoneSignInForm.errors.tooManyRequestsFb'));
      } else {
        setError(t('phoneSignInForm.errors.sendOtpFailed'));
      }
      if (recaptchaVerifierRef.current) {
        // @ts-ignore
        recaptchaVerifierRef.current.render().then(widgetId => window.grecaptcha?.reset(widgetId));
      }
    } finally {
      setLoading(false);
    }
  };

  const onSubmitOtp: SubmitHandler<PhoneSignInInputs> = async (data) => {
    setError(null);
    const isValidOtp = await trigger("otp");
    if (!isValidOtp || !data.otp || data.otp.length !== CONFIRMATION_CODE_LENGTH) {
        if (!errors.otp) {
             setError(t('phoneSignInForm.errors.enterOtpCode', { length: CONFIRMATION_CODE_LENGTH }));
        } // else RHF error will be displayed via t(errors.otp.message)
        return;
    }

    if (!confirmationResultState) {
      setError(t('phoneSignInForm.errors.noVerificationSession'));
      return;
    }
    setLoading(true);

    try {
      const userCredential = await confirmationResultState.confirm(data.otp);
      await createOrUpdateUser(userCredential.user, { phoneNumber: userCredential.user.phoneNumber, accountType: 'client' });
      navigate('/client');
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      if (error.code === 'auth/invalid-verification-code' || error.code === 'auth/session-expired') {
        setError(t('phoneSignInForm.errors.invalidOtpCodeFb'));
      } else if (error.code === 'auth/code-expired') {
        setError(t('phoneSignInForm.errors.otpCodeExpiredFb'));
      } else {
        setError(t('phoneSignInForm.errors.verifyOtpFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  const cardTitleText = step === 'enterPhone' ? t('phoneSignInForm.stepEnterPhone.title') : t('phoneSignInForm.stepEnterOtp.title');

  return (
    <Card className="kole-card bg-white rounded-xl-kole shadow-lg border-kole-border w-full">
      <CardHeader className="p-8 pb-6 text-center">
        <CardTitle className="text-2xl font-bold text-kole-brown-dark">
          {cardTitleText}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 pt-0">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md border border-red-300">
            {error /* Already translated string from setError(t(...)) */}
          </div>
        )}

        {step === 'enterPhone' && (
          <div className="space-y-6">
            <div>
              <label htmlFor="phone-number" className="block text-sm font-medium text-kole-text-dark mb-2">
                {t('phoneSignInForm.labels.phoneNumber')}
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-kole-text-secondary" />
                <Input
                  type="tel"
                  id="phone-number"
                  placeholder={t('phoneSignInForm.placeholders.phoneNumber')}
                  disabled={loading}
                  className="pl-10 kole-input"
                  autoComplete="tel"
                  aria-invalid={!!errors.phoneNumber}
                  aria-describedby="phoneNumberError"
                  {...register("phoneNumber")}
                />
              </div>
              {errors.phoneNumber && <p id="phoneNumberError" className="text-xs text-red-500 mt-1">{errors.phoneNumber.message ? t(errors.phoneNumber.message) : null}</p>}
            </div>
            <Button
              type="button"
              onClick={handleSendOtpAttempt}
              disabled={loading}
              className="w-full kole-btn-primary py-3 text-lg font-semibold"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  {t('phoneSignInForm.buttons.sendingOtp')}
                </span>
              ) : t('phoneSignInForm.buttons.sendOtp')}
            </Button>
          </div>
        )}

        {step === 'enterOtp' && (
          <form onSubmit={handleSubmit(onSubmitOtp)} className="space-y-6">
            <div>
              <label htmlFor="otp-code" className="block text-sm font-medium text-kole-text-dark mb-2">
                {t('phoneSignInForm.labels.otpCode')}
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-kole-text-secondary" />
                <Input
                  type="number"
                  id="otp-code"
                  placeholder={t('phoneSignInForm.placeholders.otpCode', { length: CONFIRMATION_CODE_LENGTH })}
                  onInput={(e) => {
                      const target = e.target as HTMLInputElement;
                      if (target.value.length > CONFIRMATION_CODE_LENGTH) {
                          target.value = target.value.slice(0, CONFIRMATION_CODE_LENGTH);
                      }
                  }}
                  disabled={loading}
                  className="pl-10 kole-input appearance-none m-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  autoComplete="one-time-code"
                  aria-invalid={!!errors.otp}
                  aria-describedby="otpError"
                  {...register("otp")}
                />
              </div>
              {errors.otp && <p id="otpError" className="text-xs text-red-500 mt-1">{errors.otp.message ? t(errors.otp.message, { length: CONFIRMATION_CODE_LENGTH }) : null}</p>}
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full kole-btn-primary py-3 text-lg font-semibold"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  {t('phoneSignInForm.buttons.verifyingOtp')}
                </span>
              ) : t('phoneSignInForm.buttons.verifyAndSignIn')}
            </Button>
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => { setStep('enterPhone'); setError(null); setValue('otp', ''); }}
                disabled={loading}
                className="text-sm text-kole-blue-primary hover:underline h-auto py-0"
              >
                {t('phoneSignInForm.buttons.changeNumberOrResend')}
              </Button>
            </div>
          </form>
        )}
        <div id="recaptcha-container" ref={recaptchaContainerRef} className="my-2"></div>
      </CardContent>
    </Card>
  );
};

export default PhoneSignInForm;
