import '@testing-library/jest-dom';
import 'jest-canvas-mock';
import { defaultFallbackInView } from 'react-intersection-observer';
import ResizeObserver from 'resize-observer-polyfill';

defaultFallbackInView(true);
global.ResizeObserver = ResizeObserver;

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

jest.setTimeout(15000);
