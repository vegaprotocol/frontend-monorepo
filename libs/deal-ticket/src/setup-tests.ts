import '@testing-library/jest-dom';
import 'jest-canvas-mock';
import ResizeObserver from 'resize-observer-polyfill';
import { defaultFallbackInView } from 'react-intersection-observer';

defaultFallbackInView(true);
global.ResizeObserver = ResizeObserver;
