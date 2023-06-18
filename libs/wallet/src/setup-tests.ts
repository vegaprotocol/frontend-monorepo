import '@testing-library/jest-dom';
import ResizeObserver from 'resize-observer-polyfill';
import '../../../setup-test';

global.ResizeObserver = ResizeObserver;
