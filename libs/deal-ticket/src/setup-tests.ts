import '@testing-library/jest-dom';
import 'jest-canvas-mock';
import ResizeObserver from 'resize-observer-polyfill';
import { defaultFallbackInView } from 'react-intersection-observer';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
defaultFallbackInView(true);
global.ResizeObserver = ResizeObserver;
