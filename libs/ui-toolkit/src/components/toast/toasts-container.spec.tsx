import { act, render, renderHook, screen } from '@testing-library/react';
import { CLOSE_DELAY, ToastsContainer, useToasts } from '..';
import { Intent } from '../../utils/intent';

describe('ToastsContainer', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });
  afterAll(() => {
    jest.useRealTimers();
  });
  beforeEach(() => {
    const { result } = renderHook(() => useToasts((state) => state.removeAll));
    act(() => result.current());
    jest.clearAllTimers();
  });
  it('displays a list of toasts in ascending order', () => {
    const { baseElement } = render(<ToastsContainer order="asc" />);
    const { result } = renderHook(() => useToasts((state) => state.add));
    const add = result.current;
    act(() => {
      add({
        id: 'toast-a',
        intent: Intent.None,
        render: () => <p>A</p>,
      });
      add({
        id: 'toast-b',
        intent: Intent.None,
        render: () => <p>B</p>,
      });
      add({
        id: 'toast-c',
        intent: Intent.None,
        render: () => <p>C</p>,
      });
    });
    const toasts = [...screen.queryAllByTestId('toast-content')].map((t) =>
      t.textContent?.trim()
    );
    expect(toasts).toEqual(['A', 'B', 'C']);
    expect(baseElement.classList).not.toContain('flex-col-reverse');
  });
  it('displays a list of toasts in descending order', () => {
    const { baseElement } = render(<ToastsContainer order="desc" />);
    const { result } = renderHook(() => useToasts((state) => state.add));
    const add = result.current;
    act(() => {
      add({
        id: 'toast-a',
        intent: Intent.None,
        render: () => <p>A</p>,
      });
      add({
        id: 'toast-b',
        intent: Intent.None,
        render: () => <p>B</p>,
      });
      add({
        id: 'toast-c',
        intent: Intent.None,
        render: () => <p>C</p>,
      });
    });
    const toasts = [...screen.queryAllByTestId('toast-content')].map((t) =>
      t.textContent?.trim()
    );
    expect(toasts).toEqual(['A', 'B', 'C']);
    expect(baseElement.classList).not.toContain('flex-col-reverse');
  });
  it('closes a toast after clicking on "Close" button', () => {
    const { baseElement } = render(<ToastsContainer order="asc" />);
    const { result } = renderHook(() => useToasts((state) => state.add));
    const add = result.current;
    act(() => {
      add({
        id: 'toast-a',
        intent: Intent.None,
        render: () => <p>A</p>,
      });
      add({
        id: 'toast-b',
        intent: Intent.None,
        render: () => <p>B</p>,
      });
    });
    const closeBtn = baseElement.querySelector(
      '[data-testid="toast-close"]'
    ) as HTMLButtonElement;
    act(() => {
      closeBtn.click();
      jest.runAllTimers();
    });
    const toasts = [...screen.queryAllByTestId('toast-content')].map((t) =>
      t.textContent?.trim()
    );
    expect(toasts).toEqual(['B']);
  });
  it('auto-closes a toast after given time', () => {
    render(<ToastsContainer order="asc" />);
    const { result } = renderHook(() => useToasts((state) => state.add));
    const add = result.current;
    act(() => {
      add({
        id: 'toast-a',
        intent: Intent.None,
        render: () => <p>A</p>,
        closeAfter: 1000,
      });
      add({
        id: 'toast-b',
        intent: Intent.None,
        render: () => <p>B</p>,
        closeAfter: 2000,
      });
    });

    act(() => {
      jest.advanceTimersByTime(1000 + CLOSE_DELAY);
    });
    expect(
      [...screen.queryAllByTestId('toast-content')].map((t) =>
        t.textContent?.trim()
      )
    ).toEqual(['B']);

    act(() => {
      jest.advanceTimersByTime(1000 + CLOSE_DELAY);
    });
    expect(
      [...screen.queryAllByTestId('toast-content')].map((t) =>
        t.textContent?.trim()
      )
    ).toEqual([]);
  });
});
