import '@testing-library/jest-dom';
import 'jest-canvas-mock';
import ResizeObserver from 'resize-observer-polyfill';
import { defaultFallbackInView } from 'react-intersection-observer';
import { locales } from '@vegaprotocol/i18n';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Set up i18n instance so that components have the correct default
// en translations
i18n.use(initReactI18next).init({
  // we init with resources
  resources: locales,
  fallbackLng: 'en',
  ns: ['trading'],
  defaultNS: 'trading',
});

defaultFallbackInView(true);
global.ResizeObserver = ResizeObserver;

// Required by radix-ui/react-tooltip
global.DOMRect = class DOMRect {
  bottom = 0;
  left = 0;
  right = 0;
  top = 0;

  constructor(
    public x = 0,
    public y = 0,
    public width = 0,
    public height = 0
  ) {}
  static fromRect(other?: DOMRectInit): DOMRect {
    return new DOMRect(other?.x, other?.y, other?.width, other?.height);
  }
  toJSON() {
    return JSON.stringify(this);
  }
};

// Based on the official jest docs
// https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
