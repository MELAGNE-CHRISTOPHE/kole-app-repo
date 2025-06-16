import { useState, useCallback } from 'react';

declare global {
  interface Window {
    grecaptcha: {
      enterprise: {
        ready: (callback: () => void) => void;
        execute: (siteKey: string, options: { action: string }) => Promise<string>;
      };
    };
  }
}

const RECAPTCHA_KEY = '6LclTFkrAAAAAAVnmsyoRrFRAVCE4k9bgsU2927a';

export const useRecaptcha = () => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const executeRecaptcha = useCallback(async (action: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await new Promise<void>((resolve) => {
        if (window.grecaptcha && window.grecaptcha.enterprise) {
          window.grecaptcha.enterprise.ready(() => resolve());
        } else {
          // Fallback si grecaptcha n'est pas chargé
          console.error('reCAPTCHA n\'est pas chargé correctement');
          setTimeout(resolve, 1000); // Attendre un peu au cas où
        }
      });
      
      if (!window.grecaptcha || !window.grecaptcha.enterprise) {
        throw new Error('reCAPTCHA n\'est pas disponible');
      }
      
      const token = await window.grecaptcha.enterprise.execute(RECAPTCHA_KEY, { action });
      setToken(token);
      return token;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur reCAPTCHA inconnue');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { executeRecaptcha, token, loading, error };
};

export default useRecaptcha;
