// src/components/Auth/LoginForm.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../firebase/config';
import { signInWithEmailAndPassword } from "firebase/auth";
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next'; // Import useTranslation

// Zod Schema for validation using translation keys
const loginSchema = (t: (key: string) => string) => z.object({
  email: z.string().email({ message: t("loginForm.validation.emailInvalid") }),
  password: z.string().min(1, { message: t("loginForm.validation.passwordRequired") }),
});
// Type inference will need to be handled carefully if t is passed like this,
// or schema messages are just keys. For simplicity, schema messages will be keys.
const staticLoginSchema = z.object({
  email: z.string().email({ message: "loginForm.validation.emailInvalid" }),
  password: z.string().min(1, { message: "loginForm.validation.passwordRequired" }),
});
type LoginFormInputs = z.infer<typeof staticLoginSchema>;

const LoginForm: React.FC = () => {
  const { t } = useTranslation(); // Initialize useTranslation
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null); // For Firebase errors
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>({
    // Resolver needs the t function if schema is dynamic, or use static keys.
    // Using static keys for messages in schema for simplicity here.
    resolver: zodResolver(staticLoginSchema),
    mode: 'onChange',
  });

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setError(null); // Clear previous Firebase errors
    setLoading(true);

    try {
      // Use data.email and data.password from the form
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      console.log("Connexion réussie pour l'utilisateur:", userCredential.user.uid);
      navigate('/client');
      
    } catch (firebaseError: any) {
      console.error("Erreur Firebase lors de la connexion:", firebaseError);
      switch(firebaseError.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError(t('loginForm.firebaseErrors.invalidCredentials'));
          break;
        case 'auth/invalid-email': // This case might be covered by Zod, but good to have a fallback
          setError(t('loginForm.firebaseErrors.invalidEmailFormat'));
          break;
        case 'auth/too-many-requests':
          setError(t('loginForm.firebaseErrors.tooManyRequests'));
          break;
        case 'auth/network-request-failed':
          setError(t('loginForm.firebaseErrors.networkError'));
          break;
        default:
          setError(t('loginForm.firebaseErrors.genericError'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // Assuming 'kole-card' provides base styling like bg-white, rounded-xl-kole, shadow-lg, border-kole-border
    // If kole-card is just an alias for these, then className can be more explicit:
    // className="bg-white rounded-xl-kole shadow-lg border border-kole-border"
    <Card className="kole-card">
      <CardHeader className="p-8 pb-4 md:pb-6">
        <CardTitle className="text-2xl font-bold text-kole-brown-dark text-center">
          {t('loginForm.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 pt-0">
        {error && ( // This error is for Firebase errors, already a string from t()
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md border border-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Champ Email */}
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-kole-text-dark mb-2">
              {t('loginForm.emailLabel')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-kole-text-secondary" />
              <Input
                type="email"
                id="login-email"
                placeholder={t('loginForm.emailPlaceholder')}
                className="pl-10 kole-input"
                disabled={loading}
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby="emailError"
                {...register("email")}
              />
            </div>
            {errors.email && <p id="emailError" className="text-xs text-red-500 mt-1">{errors.email.message ? t(errors.email.message) : null}</p>}
          </div>

          {/* Champ Mot de passe */}
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-kole-text-dark mb-2">
              {t('loginForm.passwordLabel')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-kole-text-secondary" />
              <Input
                type={showPassword ? 'text' : 'password'}
                id="login-password"
                placeholder={t('loginForm.passwordPlaceholder')}
                className="pl-10 pr-10 kole-input"
                disabled={loading}
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                aria-describedby="passwordError"
                {...register("password")}
              />
              <Button
                type="button"
                variant="ghost" // Use ghost variant for minimal styling
                size="icon" // Use icon size
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-kole-text-secondary hover:text-kole-text-dark h-auto px-0 py-0" // Adjusted classes, h-auto and px/py to allow icon to define size
                aria-label={showPassword ? t('loginForm.hidePassword') : t('loginForm.showPassword')}
                disabled={loading}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </Button>
            </div>
            {errors.password && <p id="passwordError" className="text-xs text-red-500 mt-1">{errors.password.message ? t(errors.password.message) : null}</p>}
          </div>

          {/* Lien mot de passe oublié */}
          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-kole-blue-primary hover:underline"
            >
              {t('loginForm.forgotPasswordLink')}
            </Link>
          </div>

          {/* Bouton de connexion principal */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full kole-btn-primary py-3 text-lg font-semibold"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('loginForm.submitButtonLoading')}
              </span>
            ) : (
              <>
                <User className="h-5 w-5 mr-2" />
                {t('loginForm.submitButton')}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;

