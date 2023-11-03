import type { Module } from 'i18next';
import i18n from 'i18next';
import HttpBackend from 'i18next-http-backend';
import LocizeBackend from 'i18next-locize-backend';
import type { HttpBackendOptions, RequestCallback } from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

const isInDev = process.env.NODE_ENV === 'development';

const backend = isInDev
  ? {
      projectId: '96ac1231-4bdd-455a-b9d7-f5322a2e7430',
      apiKey: process.env.NX_LOCIZE_API_KEY,
      referenceLng: 'en',
    }
  : {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      request: (
        options: HttpBackendOptions,
        url: string,
        payload: string,
        callback: RequestCallback
      ) => {
        if (typeof window === 'undefined') {
          callback(false, { status: 200, data: {} });
          return;
        }
        fetch(url).then((response) => {
          if (!response.ok) {
            return callback(response.statusText || 'Error', {
              status: response.status,
              data: {},
            });
          }
          response
            .text()
            .then((data) => {
              callback(null, { status: response.status, data });
            })
            .catch((error) => callback(error, { status: 200, data: {} }));
        });
      },
    };

const Backend: Module = isInDev ? LocizeBackend : HttpBackend;

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    load: 'languageOnly',
    lng: undefined,
    fallbackLng: 'en',
    // have a common namespace used around the full app
    ns: [
      'accounts',
      'assets',
      'candles-chart',
      'datagrid',
      'deal-ticket',
      'deposits',
      'environment',
      'fills',
      'funding-payments',
      'trading',
    ],
    defaultNS: 'trading',
    keySeparator: false, // we use content as keys
    backend,
    debug: isInDev,
    saveMissing: isInDev && !!process.env.NX_LOCIZE_API_KEY,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
