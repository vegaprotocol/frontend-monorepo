// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { locales } from '@vegaprotocol/i18n';
import { type Key } from '@vegaprotocol/wallet';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ResizeObserver from 'resize-observer-polyfill';

export const mockPubkey: Key = {
  publicKey: '0x123',
  name: 'test key 1',
};

// Set up i18n instance so that components have the correct default
// en translations
i18n.use(initReactI18next).init({
  // we init with resources
  resources: locales,
  fallbackLng: 'en',
  ns: ['governance'],
  defaultNS: 'governance',
});

global.ResizeObserver = ResizeObserver;
