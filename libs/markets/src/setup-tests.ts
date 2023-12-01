import '@testing-library/jest-dom';
import { locales } from '@vegaprotocol/i18n';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ResizeObserver from 'resize-observer-polyfill';

// Set up i18n instance so that components have the correct default
// en translations
i18n.use(initReactI18next).init({
  // we init with resources
  resources: locales,
  fallbackLng: 'en',
  ns: ['markets'],
  defaultNS: 'markets',
});

global.ResizeObserver = ResizeObserver;
