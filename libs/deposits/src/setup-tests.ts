import '@testing-library/jest-dom';
import '../../../setup-test';
import ResizeObserver from 'resize-observer-polyfill';

global.ResizeObserver = ResizeObserver;
