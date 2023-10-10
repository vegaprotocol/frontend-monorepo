import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import { i18n_en as enFills } from '@vegaprotocol/fills';
import { i18n_en as enFundingPayments } from '@vegaprotocol/funding-payments';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // we init with resources
    resources: {
      en: {
        fills: enFills,
        'funding-payments': enFundingPayments,
      },
    },
    lng: undefined,
    fallbackLng: 'en',
    debug: true,
    // have a common namespace used around the full app
    ns: ['funding-payments', 'fills', 'trading', 'accounts'],
    defaultNS: 'trading',
    keySeparator: false, // we use content as keys

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
