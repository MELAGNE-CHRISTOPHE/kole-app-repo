// src/components/Auth/SignUpForm.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, Briefcase, FileText, ShieldQuestion, Bike, Loader2 } from "lucide-react";
import { auth } from '../../firebase/config';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { createOrUpdateUser } from '../../services/firestore';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next'; // Import useTranslation

// Zod Schema Definition with static keys for i18n
const staticSignUpSchema = z.object({
  fullName: z.string().min(1, { message: "signUpForm.validation.fullNameRequired" }),
  phoneNumber: z.string().min(1, { message: "signUpForm.validation.phoneNumberRequired" })
    // .regex(/^\+?[1-9]\d{1,14}$/, { message: "signUpForm.validation.phoneNumberInvalid" })
  ,
  email: z.string().email({ message: "signUpForm.validation.emailInvalid" }).optional().or(z.literal('')),
  password: z.string().min(6, { message: "signUpForm.validation.passwordMinLength" }),
  confirmPassword: z.string(),
  accountType: z.enum(['client', 'driver'], { required_error: "signUpForm.validation.accountTypeRequired" }),
  agreedToTerms: z.literal(true, {
    errorMap: () => ({ message: "signUpForm.validation.agreedToTermsRequired" }),
  }),
  vehicleType: z.string().optional(),
  licenseNumber: z.string().optional(),
  licensePlate: z.string().optional(),
  profilePhotoUpload: z.any().optional(),
  idCardUpload: z.any().optional(),
  driverLicenseUpload: z.any().optional(),
  vehicleRegUpload: z.any().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "signUpForm.validation.passwordsNoMatch",
  path: ["confirmPassword"],
}).superRefine((data, ctx) => {
  if (data.accountType === 'driver') {
    if (!data.licenseNumber || data.licenseNumber.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "signUpForm.validation.licenseNumberRequired", path: ["licenseNumber"] });
    }
    if (!data.licensePlate || data.licensePlate.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "signUpForm.validation.licensePlateRequired", path: ["licensePlate"] });
    }
  }
});

type SignUpFormInputs = z.infer<typeof staticSignUpSchema>;

// getFirebaseErrorMessage will now return keys for t() function
const getFirebaseErrorMessageKey = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/email-already-in-use': return "signUpForm.firebaseErrors.emailInUse";
    case 'auth/invalid-email': return "signUpForm.firebaseErrors.invalidEmail"; // Should be caught by Zod ideally
    case 'auth/weak-password': return "signUpForm.firebaseErrors.weakPassword"; // Should be caught by Zod ideally
    default: return "signUpForm.firebaseErrors.generic";
  }
};

const SignUpForm: React.FC = () => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, control, setValue, trigger, watch } = useForm<SignUpFormInputs>({
    resolver: zodResolver(staticSignUpSchema), // Use static schema here
    mode: 'onChange',
    defaultValues: {
      fullName: '', phoneNumber: '', email: '', password: '', confirmPassword: '',
      accountType: undefined, agreedToTerms: false, vehicleType: 'Moto',
      licenseNumber: '', licensePlate: '',
    }
  });

  const currentAccountType = watch("accountType");
  const agreedToTermsValue = watch("agreedToTerms");

  useEffect(() => { setError(null); }, [step, currentAccountType]);

  const onSubmitRHF: SubmitHandler<SignUpFormInputs> = async (data) => {
    setLoading(true);
    setError(null);
    try {
      let userId = '';
      const userEmail = data.email || null;
      if (userEmail && data.password) {
        const userCredential = await createUserWithEmailAndPassword(auth, userEmail, data.password);
        userId = userCredential.user.uid;
      }
      // ... (rest of Firebase logic remains same, using `data` object)
      const userData: any = { /* ... construct with data ... */
        fullName: data.fullName, phoneNumber: data.phoneNumber, email: userEmail,
        accountType: data.accountType, agreedToTerms: data.agreedToTerms, createdAt: new Date(),
      };
      if (data.accountType === "driver") {
        userData.driverProfile = {
          vehicleType: data.vehicleType, licenseNumber: data.licenseNumber,
          licensePlate: data.licensePlate, applicationStatus: 'pending',
        };
      }
      await createOrUpdateUser({ uid: userId, email: userEmail, displayName: data.fullName } as any, userData);
      navigate("/otp-verification", { state: { phoneNumber: data.phoneNumber }});
    } catch (firebaseError: any) {
      setError(t(getFirebaseErrorMessageKey(firebaseError.code))); // Use t() for Firebase error
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = async () => {
    const step1Fields: (keyof SignUpFormInputs)[] = ["fullName", "phoneNumber", "email", "password", "confirmPassword", "accountType", "agreedToTerms"];
    const isValid = await trigger(step1Fields);
    if (isValid) setStep(2);
  };

  const handleAccountTypeSelect = (type: 'client' | 'driver') => {
    setValue('accountType', type, { shouldValidate: true, shouldDirty: true });
  };

  const renderStep1 = () => (
    <>
      <div className="mb-2">
        <label htmlFor="fullName" className="block text-sm font-medium text-kole-text-primary mb-1">{t('signUpForm.labels.fullName')}</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-kole-text-secondary" />
          <Input type="text" id="fullName" placeholder={t('signUpForm.placeholders.fullName')} {...register("fullName")} className="w-full pl-10 pr-4 py-3 border-kole-border rounded-lg-kole focus:ring-kole-blue-primary kole-input" disabled={loading} aria-invalid={!!errors.fullName} aria-describedby="fullNameError" />
        </div>
        {errors.fullName && <p id="fullNameError" className="text-xs text-red-500 mt-1">{errors.fullName.message ? t(errors.fullName.message) : null}</p>}
      </div>

      <div className="mb-2">
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-kole-text-primary mb-1">{t('signUpForm.labels.phoneNumber')}</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-kole-text-secondary" />
          <Input type="tel" id="phoneNumber" placeholder={t('signUpForm.placeholders.phoneNumber')} {...register("phoneNumber")} className="w-full pl-10 pr-4 py-3 border-kole-border rounded-lg-kole focus:ring-kole-blue-primary kole-input" disabled={loading} aria-invalid={!!errors.phoneNumber} aria-describedby="phoneNumberError" />
        </div>
        {errors.phoneNumber && <p id="phoneNumberError" className="text-xs text-red-500 mt-1">{errors.phoneNumber.message ? t(errors.phoneNumber.message) : null}</p>}
      </div>

      <div className="mb-2">
        <label htmlFor="email" className="block text-sm font-medium text-kole-text-primary mb-1">{t('signUpForm.labels.email')}</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-kole-text-secondary" />
          <Input type="email" id="email" placeholder={t('signUpForm.placeholders.email')} {...register("email")} className="w-full pl-10 pr-4 py-3 border-kole-border rounded-lg-kole focus:ring-kole-blue-primary kole-input" disabled={loading} aria-invalid={!!errors.email} aria-describedby="emailError" />
        </div>
        {errors.email && <p id="emailError" className="text-xs text-red-500 mt-1">{errors.email.message ? t(errors.email.message) : null}</p>}
      </div>

      <div className="mb-2">
        <label htmlFor="password" className="block text-sm font-medium text-kole-text-primary mb-1">{t('signUpForm.labels.password')}</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-kole-text-secondary" />
          <Input type={showPassword ? "text" : "password"} id="password" placeholder={t('signUpForm.placeholders.password')} {...register("password")} className="w-full pl-10 pr-10 py-3 border-kole-border rounded-lg-kole focus:ring-kole-blue-primary kole-input" disabled={loading} aria-invalid={!!errors.password} aria-describedby="passwordError" />
          <Button type="button" variant="ghost" size="icon" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 h-auto px-0 py-0 text-kole-text-secondary hover:text-kole-blue-primary" disabled={loading} aria-label={showPassword ? t('signUpForm.buttons.hidePassword') : t('signUpForm.buttons.showPassword')}>
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </Button>
        </div>
        {errors.password && <p id="passwordError" className="text-xs text-red-500 mt-1">{errors.password.message ? t(errors.password.message) : null}</p>}
      </div>

      <div className="mb-2">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-kole-text-primary mb-1">{t('signUpForm.labels.confirmPassword')}</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-kole-text-secondary" />
          <Input type={showConfirmPassword ? "text" : "password"} id="confirmPassword" placeholder={t('signUpForm.placeholders.confirmPassword')} {...register("confirmPassword")} className="w-full pl-10 pr-10 py-3 border-kole-border rounded-lg-kole focus:ring-kole-blue-primary kole-input" disabled={loading} aria-invalid={!!errors.confirmPassword} aria-describedby="confirmPasswordError" />
          <Button type="button" variant="ghost" size="icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 h-auto px-0 py-0 text-kole-text-secondary hover:text-kole-blue-primary" disabled={loading} aria-label={showConfirmPassword ? t('signUpForm.buttons.hidePassword') : t('signUpForm.buttons.showPassword')}>
            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </Button>
        </div>
        {errors.confirmPassword && <p id="confirmPasswordError" className="text-xs text-red-500 mt-1">{errors.confirmPassword.message ? t(errors.confirmPassword.message) : null}</p>}
      </div>

      <div className="mb-4">
        <label id="accountTypeLabel" className="block text-sm font-medium text-kole-text-primary mb-2">{t('signUpForm.labels.accountType')}</label>
        <div role="group" aria-labelledby="accountTypeLabel" aria-describedby={errors.accountType ? "accountTypeError" : undefined} className="grid grid-cols-2 gap-3">
          <Button type="button" onClick={() => handleAccountTypeSelect("client")} disabled={loading}
            className={`flex flex-col items-center justify-center p-4 border rounded-lg-kole transition-all duration-200 ease-in-out h-auto text-sm font-medium ${currentAccountType === "client" ? "bg-kole-blue-primary text-white border-kole-blue-primary ring-2 ring-offset-1 ring-kole-blue-primary" : "bg-kole-cream hover:bg-kole-hover-bg border-kole-border text-kole-text-secondary"}`}>
            <User className={`mb-1 h-7 w-7 ${currentAccountType === "client" ? "text-white" : "text-kole-blue-primary"}`} /> {t('signUpForm.buttons.client')}
          </Button>
          <Button type="button" onClick={() => handleAccountTypeSelect("driver")} disabled={loading}
            className={`flex flex-col items-center justify-center p-4 border rounded-lg-kole transition-all duration-200 ease-in-out h-auto text-sm font-medium ${currentAccountType === "driver" ? "bg-kole-blue-primary text-white border-kole-blue-primary ring-2 ring-offset-1 ring-kole-blue-primary" : "bg-kole-cream hover:bg-kole-hover-bg border-kole-border text-kole-text-secondary"}`}>
            <Briefcase className={`mb-1 h-7 w-7 ${currentAccountType === "driver" ? "text-white" : "text-kole-blue-primary"}`} /> {t('signUpForm.buttons.driver')}
          </Button>
        </div>
        {errors.accountType && <p id="accountTypeError" className="text-xs text-red-500 mt-1">{errors.accountType.message ? t(errors.accountType.message) : null}</p>}
      </div>

      <div className="mb-2">
        <div className="flex items-center">
          <Controller
            name="agreedToTerms"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="termsAndConditions"
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={loading}
                className="h-4 w-4 text-kole-blue-primary border-kole-border rounded focus-visible:ring-1 focus-visible:ring-kole-blue-primary data-[state=checked]:bg-kole-blue-primary data-[state=checked]:text-white"
                aria-invalid={!!errors.agreedToTerms}
                aria-describedby="agreedToTermsError"
              />
            )}
          />
          <label htmlFor="termsAndConditions" className="ml-2 block text-xs text-kole-text-secondary">
            {t('signUpForm.terms.acceptPrefix')} <a href="/terms" target="_blank" rel="noopener noreferrer" className="font-medium text-kole-blue-primary hover:underline">{t('signUpForm.terms.termsLinkText')}</a> {t('signUpForm.terms.conjunction')} <a href="/privacy" target="_blank" rel="noopener noreferrer" className="font-medium text-kole-blue-primary hover:underline">{t('signUpForm.terms.privacyLinkText')}</a>.
          </label>
        </div>
        {errors.agreedToTerms && <p id="agreedToTermsError" className="text-xs text-red-500 mt-1">{errors.agreedToTerms.message ? t(errors.agreedToTerms.message) : null}</p>}
      </div>
    </>
  );

  const renderDriverStep2 = () => (
    <>
      <div className="mb-2">
        <label htmlFor="vehicleType" className="block text-sm font-medium text-kole-text-primary mb-1">{t('signUpForm.labels.vehicleType')}</label>
        <div className="relative">
            <Bike className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-kole-text-secondary" />
            <Input type="text" id="vehicleType" {...register("vehicleType")} readOnly className="w-full pl-10 pr-4 py-3 border-kole-border rounded-lg-kole bg-gray-100 cursor-not-allowed kole-input" />
        </div>
      </div>

      <div className="mb-2">
        <label htmlFor="licenseNumber" className="block text-sm font-medium text-kole-text-primary mb-1">{t('signUpForm.labels.licenseNumber')}</label>
        <div className="relative">
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-kole-text-secondary" />
            <Input type="text" id="licenseNumber" placeholder={t('signUpForm.placeholders.licenseNumber')} {...register("licenseNumber")} className="w-full pl-10 pr-4 py-3 border-kole-border rounded-lg-kole focus:ring-kole-blue-primary kole-input" disabled={loading} aria-invalid={!!errors.licenseNumber} aria-describedby="licenseNumberError" />
        </div>
        {errors.licenseNumber && <p id="licenseNumberError" className="text-xs text-red-500 mt-1">{errors.licenseNumber.message ? t(errors.licenseNumber.message) : null}</p>}
      </div>

      <div className="mb-2">
        <label htmlFor="licensePlate" className="block text-sm font-medium text-kole-text-primary mb-1">{t('signUpForm.labels.licensePlate')}</label>
        <div className="relative">
            <ShieldQuestion className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-kole-text-secondary" />
            <Input type="text" id="licensePlate" placeholder={t('signUpForm.placeholders.licensePlate')} {...register("licensePlate")} className="w-full pl-10 pr-4 py-3 border-kole-border rounded-lg-kole focus:ring-kole-blue-primary kole-input" disabled={loading} aria-invalid={!!errors.licensePlate} aria-describedby="licensePlateError" />
        </div>
        {errors.licensePlate && <p id="licensePlateError" className="text-xs text-red-500 mt-1">{errors.licensePlate.message ? t(errors.licensePlate.message) : null}</p>}
      </div>

      <p className="text-sm text-kole-text-secondary mb-2">{t('signUpForm.labels.documentsHeader')}</p>
      <div className="mb-2">
        <label htmlFor="profilePhotoUpload" className="block text-sm font-medium text-kole-text-primary mb-1">{t('signUpForm.labels.profilePhoto')}</label>
        <Input type="file" id="profilePhotoUpload" {...register("profilePhotoUpload")} disabled={loading} className="w-full text-sm text-kole-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-kole-blue-primary file:text-white hover:file:bg-kole-blue-dark kole-input" aria-invalid={!!errors.profilePhotoUpload} aria-describedby="profilePhotoUploadError" />
        {errors.profilePhotoUpload && <p id="profilePhotoUploadError" className="text-xs text-red-500 mt-1">{errors.profilePhotoUpload.message ? t(errors.profilePhotoUpload.message) : null}</p>}
      </div>
      <div className="mb-2">
        <label htmlFor="idCardUpload" className="block text-sm font-medium text-kole-text-primary mb-1">{t('signUpForm.labels.idCard')}</label>
        <Input type="file" id="idCardUpload" {...register("idCardUpload")} disabled={loading} className="w-full text-sm text-kole-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-kole-blue-primary file:text-white hover:file:bg-kole-blue-dark kole-input" aria-invalid={!!errors.idCardUpload} aria-describedby="idCardUploadError" />
        {errors.idCardUpload && <p id="idCardUploadError" className="text-xs text-red-500 mt-1">{errors.idCardUpload.message ? t(errors.idCardUpload.message) : null}</p>}
      </div>
      <div className="mb-2">
        <label htmlFor="driverLicenseUpload" className="block text-sm font-medium text-kole-text-primary mb-1">{t('signUpForm.labels.driverLicense')}</label>
        <Input type="file" id="driverLicenseUpload" {...register("driverLicenseUpload")} disabled={loading} className="w-full text-sm text-kole-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-kole-blue-primary file:text-white hover:file:bg-kole-blue-dark kole-input" aria-invalid={!!errors.driverLicenseUpload} aria-describedby="driverLicenseUploadError" />
        {errors.driverLicenseUpload && <p id="driverLicenseUploadError" className="text-xs text-red-500 mt-1">{errors.driverLicenseUpload.message ? t(errors.driverLicenseUpload.message) : null}</p>}
      </div>
      <div className="mb-2">
        <label htmlFor="vehicleRegUpload" className="block text-sm font-medium text-kole-text-primary mb-1">{t('signUpForm.labels.vehicleRegistration')}</label>
        <Input type="file" id="vehicleRegUpload" {...register("vehicleRegUpload")} disabled={loading} className="w-full text-sm text-kole-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-kole-blue-primary file:text-white hover:file:bg-kole-blue-dark kole-input" aria-invalid={!!errors.vehicleRegUpload} aria-describedby="vehicleRegUploadError" />
        {errors.vehicleRegUpload && <p id="vehicleRegUploadError" className="text-xs text-red-500 mt-1">{errors.vehicleRegUpload.message ? t(errors.vehicleRegUpload.message) : null}</p>}
      </div>

       <Button type="button" onClick={() => { if (!loading) setStep(1); }} disabled={loading}
        className="w-full bg-kole-cream text-kole-text-primary py-3 rounded-lg-kole hover:bg-kole-hover-bg border border-kole-border transition duration-300 font-semibold flex items-center justify-center mt-4 h-auto text-base">
        {t('signUpForm.buttons.previous')}
      </Button>
    </>
  );

  let cardTitleText = t('signUpForm.step1.title');
  let cardDescriptionText = t('signUpForm.step1.description');
  if (step === 2 && currentAccountType === "driver") {
    cardTitleText = t('signUpForm.driverStep2.title');
    cardDescriptionText = t('signUpForm.driverStep2.description');
  }

  const mainButtonIsSubmit = !(currentAccountType === "driver" && step === 1);

  return (
    <Card className="kole-card bg-white rounded-xl-kole shadow-lg border-kole-border w-full">
      <CardHeader className="p-6 md:p-8 pb-4 text-center">
        <CardTitle className="text-2xl font-bold text-kole-text-primary mb-1">{cardTitleText}</CardTitle>
        <CardDescription className="text-sm text-kole-text-secondary">{cardDescriptionText}</CardDescription>
      </CardHeader>
      <CardContent className="p-6 md:p-8 pt-0">
        {error && ( // Firebase error, already translated
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md border border-red-300">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmitRHF)}>
          {step === 1 && renderStep1()}
          {step === 2 && currentAccountType === "driver" && renderDriverStep2()}

          <Button
            type={mainButtonIsSubmit ? "submit" : "button"}
            onClick={!mainButtonIsSubmit ? handleNextStep : undefined}
            disabled={loading || (step === 1 && (!currentAccountType || !agreedToTermsValue))}
            className={`w-full kole-btn-primary py-3.5 text-lg font-semibold flex items-center justify-center mt-6 ${(loading || (step === 1 && (!currentAccountType || !agreedToTermsValue))) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                {currentAccountType === "driver" && step === 1 ? t('signUpForm.buttons.loadingNext') : t('signUpForm.buttons.loadingSigningUp')}
              </span>
            ) : (
              <>
                {currentAccountType === "driver" && step === 1 ? t('signUpForm.buttons.next') : t('signUpForm.buttons.signUp')} <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SignUpForm;
