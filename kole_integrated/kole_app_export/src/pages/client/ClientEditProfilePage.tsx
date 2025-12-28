// src/pages/client/ClientEditProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import * as userService from '../../services/userService';
import { UserProfileData } from '../../services/userService'; // Import type

// Zod Schema for edit profile form
const editProfileSchema = (t: (key: string) => string) => z.object({
  firstName: z.string().min(1, { message: t("clientEditProfilePage.validation.firstNameRequired") }),
  lastName: z.string().min(1, { message: t("clientEditProfilePage.validation.lastNameRequired") }),
  email: z.string().email({ message: t("clientEditProfilePage.validation.emailInvalid") }),
  phoneNumber: z.string()
    .regex(/^\+[1-9]\d{7,14}$/, { message: t("clientEditProfilePage.validation.phoneNumberInvalid")})
    .optional().or(z.literal('')),
});

type EditProfileFormValues = z.infer<ReturnType<typeof editProfileSchema>>;

const ClientEditProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, formState: { errors, isDirty, isValid }, reset } = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema(t)),
    mode: 'onChange',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoadingData(true);
      const result = await userService.getUserProfile();
      if (result.data) {
        reset(result.data); // Populate form with fetched data
      } else if (result.error) {
        toast.error(t(result.error.messageKey, { details: result.error.details }));
        // Consider navigating back or showing a more permanent error if profile load fails
      }
      setIsLoadingData(false);
    };
    fetchProfile();
  }, [reset, t]);

  const onSubmitRHF: SubmitHandler<EditProfileFormValues> = async (formData) => {
    setIsSaving(true);
    const result = await userService.updateUserProfile(formData);
    if (result.data) {
      toast.success(t('userService.success.profileUpdated'));
      // Optionally update auth context or global state with result.data
      navigate('/client/profile');
    } else if (result.error) {
      toast.error(t(result.error.messageKey, { details: result.error.details }));
    }
    setIsSaving(false);
  };

  if (isLoadingData) {
    return (
      <div className="h-screen flex flex-col bg-kole-cream-bg items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-kole-blue-primary mb-4" />
        <p className="text-kole-text-secondary">{t('clientEditProfilePage.loadingProfile')}</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-kole-cream-bg">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex items-center border-b border-kole-border sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-2 hover:bg-kole-hover-bg rounded-full">
          <ArrowLeft className="h-5 w-5 text-kole-text-primary" />
        </Button>
        <h1 className="text-lg font-semibold text-kole-text-primary">{t('clientEditProfilePage.pageTitle')}</h1>
      </div>

      {/* Form Content */}
      <div className="flex-grow overflow-y-auto p-4">
        <Card className="kole-card bg-white rounded-xl-kole shadow-lg border-kole-border w-full max-w-lg mx-auto">
          <form onSubmit={handleSubmit(onSubmitRHF)}>
            <CardContent className="p-6 space-y-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-kole-text-dark mb-1">{t('clientEditProfilePage.labels.firstName')}</label>
                <Input id="firstName" {...register("firstName")} className="kole-input" aria-invalid={!!errors.firstName} aria-describedby="firstNameError" />
                {errors.firstName && <p id="firstNameError" className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-kole-text-dark mb-1">{t('clientEditProfilePage.labels.lastName')}</label>
                <Input id="lastName" {...register("lastName")} className="kole-input" aria-invalid={!!errors.lastName} aria-describedby="lastNameError" />
                {errors.lastName && <p id="lastNameError" className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-kole-text-dark mb-1">{t('clientEditProfilePage.labels.email')}</label>
                <Input id="email" type="email" {...register("email")} className="kole-input" aria-invalid={!!errors.email} aria-describedby="emailError" />
                {errors.email && <p id="emailError" className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-kole-text-dark mb-1">{t('clientEditProfilePage.labels.phoneNumber')}</label>
                <Input id="phoneNumber" type="tel" {...register("phoneNumber")} className="kole-input" aria-invalid={!!errors.phoneNumber} aria-describedby="phoneNumberError" />
                {errors.phoneNumber && <p id="phoneNumberError" className="text-xs text-red-500 mt-1">{errors.phoneNumber.message}</p>}
              </div>
            </CardContent>
            <CardFooter className="p-6 flex justify-end gap-3">
              <Button type="button" variant="outline" className="kole-btn-outline" onClick={() => navigate('/client/profile')} disabled={isSaving}>
                {t('clientEditProfilePage.buttons.cancel')}
              </Button>
              <Button type="submit" className="kole-btn-primary" disabled={isSaving || !isDirty || !isValid}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('clientEditProfilePage.buttons.savingChanges')}
                  </>
                ) : (
                  t('clientEditProfilePage.buttons.saveChanges')
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ClientEditProfilePage;
