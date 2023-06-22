import '@testing-library/jest-dom';
import ResizeObserver from 'resize-observer-polyfill';
import { defaultFallbackInView } from 'react-intersection-observer';

defaultFallbackInView(true);
global.ResizeObserver = ResizeObserver;
