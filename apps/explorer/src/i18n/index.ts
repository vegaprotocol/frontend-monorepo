import type { Module } from 'i18next';
import i18n from 'i18next';
import HttpBackend from 'i18next-http-backend';
import LocizeBackend from 'i18next-locize-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

const isInDev = process.env.NODE_ENV === 'development';
const useLocize = isInDev && !!process.env.NX_USE_LOCIZE;

const backend = useLocize
  ? {
      projectId: '96ac1231-4bdd-455a-b9d7-f5322a2e7430',
      apiKey: process.env.NX_LOCIZE_API_KEY,
      referenceLng: 'en',
    }
  : {
      loadPath: '/assets/locales/{{lng}}/{{ns}}.json',
    };

const Backend: Module = useLocize ? LocizeBackend : HttpBackend;

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    supportedLngs: ['en'],
    load: 'languageOnly',
    debug: isInDev,
    // have a common namespace used around the full app
    ns: ['explorer'],
    defaultNS: 'explorer',
    keySeparator: false, // we use content as keys
    nsSeparator: false,
    backend,
    saveMissing: useLocize && !!process.env.NX_LOCIZE_API_KEY,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
