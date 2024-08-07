import { isIos } from './is-ios';

const navigator = window.navigator;

const mockNavigator = (
  userAgent?: string,
  platform?: string,
  maxTouchPoints?: number
) => {
  Object.defineProperty(window, 'navigator', {
    writable: true,
    value: {
      userAgent,
      platform,
      maxTouchPoints,
    },
  });
};

describe('isIos', () => {
  afterEach(() => {
    Object.defineProperty(window, 'navigator', {
      writable: true,
      value: navigator,
    });
  });

  it('returns true when userAgent contains iPad', () => {
    mockNavigator('iPad');
    const result = isIos();

    expect(result).toBe(true);
  });

  it('returns true when userAgent contains iPhone', () => {
    mockNavigator('iPhone');
    const result = isIos();

    expect(result).toBe(true);
  });

  it('returns true when userAgent contains iPod', () => {
    mockNavigator('iPod');
    const result = isIos();

    expect(result).toBe(true);
  });

  it('returns true when platform is MacIntel and maxTouchPoints > 1', () => {
    mockNavigator(undefined, 'MacIntel', 2);

    const result = isIos();

    expect(result).toBe(true);
  });

  it('returns false when userAgent and platform conditions are not met', () => {
    mockNavigator('Android', 'Android');
    const result = isIos();

    expect(result).toBe(false);
  });
});
