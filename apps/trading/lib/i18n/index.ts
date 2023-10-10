import i18n from 'i18next';
import Backend from 'i18next-locize-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

const locizeOptions = {
  projectId: '254663a5-971a-47f9-8408-99c25a75d8cc',
  apiKey: '998713c7-4d0d-43dd-8dd2-d94defef0cc7', // YOU should not expose your apps API key to production!!!
  referenceLng: 'en',
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // we init with resources
    lng: undefined,
    fallbackLng: 'en',
    debug: true,
    // have a common namespace used around the full app
    ns: ['funding-payments', 'fills', 'trading', 'accounts'],
    defaultNS: 'trading',
    keySeparator: false, // we use content as keys
    backend: locizeOptions,
    saveMissing: true,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
