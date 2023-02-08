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
    const { result } = renderHook(() =>
      useToasts((state) => ({ add: state.add, toasts: state.toasts }))
    );
    const add = result.current.add;
    act(() => {
      add({
        id: 'toast-a',
        intent: Intent.None,
        content: <p>A</p>,
      });
      add({
        id: 'toast-b',
        intent: Intent.None,
        content: <p>B</p>,
      });
      add({
        id: 'toast-c',
        intent: Intent.None,
        content: <p>C</p>,
      });
    });
    const { baseElement } = render(
      <ToastsContainer order="asc" toasts={result.current.toasts} />
    );
    const toasts = [...screen.queryAllByTestId('toast-content')].map((t) =>
      t.textContent?.trim()
    );
    expect(toasts).toEqual(['A', 'B', 'C']);
    expect(baseElement.classList).not.toContain('flex-col-reverse');
  });
  it('displays a list of toasts in descending order', () => {
    const { result } = renderHook(() =>
      useToasts((state) => ({ add: state.add, toasts: state.toasts }))
    );
    const add = result.current.add;
    act(() => {
      add({
        id: 'toast-a',
        intent: Intent.None,
        content: <p>A</p>,
      });
      add({
        id: 'toast-b',
        intent: Intent.None,
        content: <p>B</p>,
      });
      add({
        id: 'toast-c',
        intent: Intent.None,
        content: <p>C</p>,
      });
    });
    const { baseElement } = render(
      <ToastsContainer order="desc" toasts={result.current.toasts} />
    );
    const toasts = [...screen.queryAllByTestId('toast-content')].map((t) =>
      t.textContent?.trim()
    );
    expect(toasts).toEqual(['A', 'B', 'C']);
    expect(baseElement.classList).not.toContain('flex-col-reverse');
  });
  it('closes a toast after clicking on "Close" button', () => {
    const { result } = renderHook(() =>
      useToasts((state) => ({
        add: state.add,
        remove: state.remove,
        toasts: state.toasts,
      }))
    );
    const add = result.current.add;
    const remove = result.current.remove;
    act(() => {
      add({
        id: 'toast-a',
        intent: Intent.None,
        content: <p>A</p>,
        onClose: () => remove('toast-a'),
      });
      add({
        id: 'toast-b',
        intent: Intent.None,
        content: <p>B</p>,
        onClose: () => remove('toast-b'),
      });
    });
    const { baseElement, rerender } = render(
      <ToastsContainer order="asc" toasts={result.current.toasts} />
    );
    const closeBtn = baseElement.querySelector(
      '[data-testid="toast-close"]'
    ) as HTMLButtonElement;
    act(() => {
      closeBtn.click();
      jest.advanceTimersByTime(CLOSE_DELAY);
    });
    rerender(<ToastsContainer order="asc" toasts={result.current.toasts} />);
    const toasts = [...screen.queryAllByTestId('toast-content')].map((t) =>
      t.textContent?.trim()
    );
    expect(toasts).toEqual(['B']);
  });
});
