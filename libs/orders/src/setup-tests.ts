import '@testing-library/jest-dom';
import ResizeObserver from 'resize-observer-polyfill';
import { TextEncoder, TextDecoder } from 'util';

Object.assign(global, { TextDecoder, TextEncoder });
global.ResizeObserver = ResizeObserver;
