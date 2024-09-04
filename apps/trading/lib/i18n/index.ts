import i18n from 'i18next';
import HttpBackend from 'i18next-http-backend';
import type { HttpBackendOptions, RequestCallback } from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

export const supportedLngs = ['en'];

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs,
    load: 'languageOnly',
    // load all these namespaces immediately on start up. If the name space is not here,
    // it will only be loaded once used by useTranslation
    ns: [
      'accounts',
      'assets',
      'candles-chart',
      'datagrid',
      'environment',
      'fills',
      'funding-payments',
      'ledger',
      'liquidity',
      'market-depth',
      'markets',
      'orders',
      'positions',
      'react-helpers',
      'trades',
      'trading-view',
      'trading',
      'ui-toolkit',
      'utils',
      'wallet-react',
      'wallet',
      'web3',
      'withdraws',
    ],
    defaultNS: 'trading',
    nsSeparator: false,
    keySeparator: false, // we use content as keys
    backend: {
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
    },
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
