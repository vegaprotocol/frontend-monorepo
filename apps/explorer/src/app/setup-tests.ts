// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { locales } from '@vegaprotocol/i18n';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

Object.defineProperty(window, 'ResizeObserver', {
  writable: false,
  value: jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
  })),
});

// Set up i18n instance so that components have the correct default
// en translations
i18n.use(initReactI18next).init({
  // we init with resources
  resources: locales,
  fallbackLng: 'en',
  nsSeparator: false,
  ns: ['explorer'],
  defaultNS: 'explorer',
});
