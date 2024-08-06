import { renderHook } from '@testing-library/react';

import { usePreventWindowResize } from '.';

describe('usePreventWindowResize', () => {
  let originalWindowResizeTo: any;
  let originalWindowAddEventListener: any;
  let originalWindowRemoveEventListener: any;

  beforeAll(() => {
    originalWindowResizeTo = global.window.resizeTo;
    originalWindowAddEventListener = global.window.addEventListener;
    originalWindowRemoveEventListener = global.window.removeEventListener;
  });

  afterEach(() => {
    global.window.resizeTo = originalWindowResizeTo;
    global.window.addEventListener = originalWindowAddEventListener;
    global.window.removeEventListener = originalWindowRemoveEventListener;
  });

  it('should add resize event listener and call resetSize on mount', () => {
    const resizeToMock = jest.fn();
    const addEventListenerMock = jest.fn();

    global.window.resizeTo = resizeToMock;
    global.window.addEventListener = addEventListenerMock;

    renderHook(() => usePreventWindowResize());

    expect(addEventListenerMock).toHaveBeenCalledWith(
      'resize',
      expect.any(Function)
    );
    expect(resizeToMock).toHaveBeenCalledTimes(1);
    expect(resizeToMock).toHaveBeenCalledWith(360, expect.any(Number));
  });

  it('should remove resize event listener on unmount', () => {
    const removeEventListenerMock = jest.fn();
    global.window.resizeTo = jest.fn();
    global.window.addEventListener = jest.fn();

    global.window.removeEventListener = removeEventListenerMock;

    const { unmount } = renderHook(() => usePreventWindowResize());

    unmount();

    expect(removeEventListenerMock).toHaveBeenCalledWith(
      'resize',
      expect.any(Function)
    );
  });
});
