// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import dev from './i18n/translations/dev.json';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Set up i18n instance so that components have the correct default
// en translations
i18n.use(initReactI18next).init({
  // we init with resources
  resources: {
    en: {
      translations: {
        ...dev,
      },
    },
  },
  fallbackLng: 'en',
  ns: ['translations'],
  defaultNS: 'translations',
});
