import i18n from 'i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    supportedLngs: ['en'],
    load: 'languageOnly',
    debug: process.env.NODE_ENV === 'development',
    // have a common namespace used around the full app
    ns: ['governance', 'wallet', 'wallet-react', 'assets', 'utils'],
    defaultNS: 'governance',
    keySeparator: false, // we use content as keys
    nsSeparator: false,
    backend: {
      loadPath: '/assets/locales/{{lng}}/{{ns}}.json',
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
