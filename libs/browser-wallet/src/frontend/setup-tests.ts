// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import 'jest-canvas-mock';

import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import ResizeObserver from 'resize-observer-polyfill';
import { TextEncoder, TextDecoder } from 'util';

Object.assign(global, { TextDecoder, TextEncoder });

TimeAgo.addDefaultLocale(en);

// Required by radix-ui/react-tooltip
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

// Mock for broken JSDOM which makes testing radix dropdowns harder than it should be.
// https://github.com/radix-ui/primitives/issues/1207
class PointerEvent extends Event {
  button: number;
  ctrlKey: boolean;

  constructor(type: string, properties: EventInit | undefined) {
    super(type, properties);
    // @ts-ignore
    this.button = properties?.button;
    // @ts-ignore
    this.ctrlKey = properties?.ctrlKey;
  }
}

// @ts-ignore
window.PointerEvent = PointerEvent;

class LocalStorageMock {
  store: Record<string, string>;
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key: string) {
    return this.store[key] || null;
  }

  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }

  removeItem(key: string) {
    delete this.store[key];
  }
}

//@ts-ignore
global.localStorage = new LocalStorageMock();
