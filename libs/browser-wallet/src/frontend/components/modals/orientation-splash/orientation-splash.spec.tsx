import { act, render, screen, waitFor } from '@testing-library/react';

import { useGlobalsStore } from '@/stores/globals';
import { mockStore } from '@/test-helpers/mock-store';

import { locators, OrientationSplash } from '.';

jest.mock('@/stores/globals');

const mockGlobals = (isMobile = true) => {
  mockStore(useGlobalsStore, {
    isMobile,
  });
};

const navigator = window.navigator;

describe('OrientationSplash', () => {
  afterEach(() => {
    Object.defineProperty(window, 'navigator', {
      writable: true,
      value: navigator,
    });
  });

  it('renders null when in portrait mode', () => {
    mockGlobals();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: true,
        media: query,
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
    render(<OrientationSplash />);
    expect(screen.queryByTestId(locators.orientationSplash)).toBeNull();
  });

  it('renders splash when in landscape mode', () => {
    // 1132-ANDR-001 - If I rotate the device, I see a warning telling me to rotate it back to portrait mode
    mockGlobals();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
    render(<OrientationSplash />);
    expect(screen.getByTestId(locators.orientationSplash)).toBeInTheDocument();
  });

  it('does not render splash when if not in mobile mode', () => {
    mockGlobals(false);
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
    render(<OrientationSplash />);
    expect(
      screen.queryByTestId(locators.orientationSplash)
    ).not.toBeInTheDocument();
  });

  it('does not render splash when in mobile mode but on iOS', () => {
    mockGlobals(false);
    // 1133-IOS-001 If I rotate the device, I do not see a warning telling me to rotate it back to portrait mode
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
    Object.defineProperty(window, 'navigator', {
      writable: true,
      value: {
        userAgent: 'iPhone',
      },
    });
    render(<OrientationSplash />);
    expect(
      screen.queryByTestId(locators.orientationSplash)
    ).not.toBeInTheDocument();
  });

  it('sets mode to portrait on event handler being called', async () => {
    mockGlobals();
    let handler: null | ((event: MediaQueryListEvent) => void) = null;
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: true,
        media: query,
        onchange: null,
        addEventListener: jest.fn(
          (
            eventName: string,
            function_: (event: MediaQueryListEvent) => void
          ) => {
            handler = function_;
          }
        ),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
    render(<OrientationSplash />);
    // @ts-ignore
    act(() => handler?.({ matches: false }));
    await screen.findByTestId(locators.orientationSplash);
    expect(screen.getByTestId(locators.orientationSplash)).toBeInTheDocument();
  });

  it('sets mode to landscape on event handler being called', async () => {
    mockGlobals();
    let handler: null | ((event: MediaQueryListEvent) => void) = null;
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: jest.fn(
          (
            eventName: string,
            function_: (event: MediaQueryListEvent) => void
          ) => {
            handler = function_;
          }
        ),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
    render(<OrientationSplash />);
    expect(screen.getByTestId(locators.orientationSplash)).toBeInTheDocument();
    // @ts-ignore
    act(() => handler?.({ matches: true }));
    await waitFor(() =>
      expect(
        screen.queryByTestId(locators.orientationSplash)
      ).not.toBeInTheDocument()
    );
  });
});
