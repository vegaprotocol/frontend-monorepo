import '@testing-library/jest-dom';
import ResizeObserver from 'resize-observer-polyfill';
import { defaultFallbackInView } from 'react-intersection-observer';
import '../../../setup-test';

defaultFallbackInView(true);
global.ResizeObserver = ResizeObserver;
