import '@testing-library/jest-dom';
import ResizeObserver from 'resize-observer-polyfill';
global.ResizeObserver = ResizeObserver;

declare global {
  // eslint-disable-next-line no-var
  var __LOGGER_SILENT_MODE__: boolean;
}

global.__LOGGER_SILENT_MODE__ = true;
