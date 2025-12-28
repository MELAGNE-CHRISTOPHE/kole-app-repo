import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend'; // To load translations from /public/locales
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(HttpApi) // Load translations using http (default public/locales path)
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n down to react-i18next
  .init({
    supportedLngs: ['fr', 'en'], // Define supported languages
    fallbackLng: 'fr', // Default language if detection fails
    debug: process.env.NODE_ENV === 'development', // Enable debug in dev mode
    ns: ['translation'], // Default namespace
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json', // Path to translation files (relative to public folder)
    },
  });

export default i18n;
