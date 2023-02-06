import { renderHook } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { Intent } from '../../utils/intent';
import type { Toast } from './toast';
import { useToasts } from './use-toasts';

const T1: Toast = {
  id: 'TEST-1',
  intent: Intent.None,
  content: undefined,
};

const T2: Toast = {
  id: 'TEST-2',
  intent: Intent.None,
  content: undefined,
};

const T3: Toast = {
  id: 'TEST-3',
  intent: Intent.None,
  content: undefined,
};

const INITIAL = useToasts.getState();

describe('useToasts', () => {
  beforeEach(() => {
    useToasts.setState(INITIAL, true);
  });
  afterAll(() => {
    useToasts.setState(INITIAL, true);
  });

  it('adds toast', () => {
    const { result } = renderHook(() => useToasts());
    act(() => {
      result.current.add(T1);
    });
    expect(result.current.toasts[T1.id]).toEqual(T1);
    expect(result.current.count).toEqual(1);
  });

  it('removes toast', () => {
    const { result } = renderHook(() => useToasts());
    act(() => {
      result.current.add(T1);
      result.current.add(T2);
      result.current.add(T3);
      result.current.remove(T1.id);
      result.current.remove(T1.id);
      result.current.remove(T1.id);
    });
    expect(result.current.toasts[T1.id]).toBeUndefined();
    expect(result.current.count).toEqual(2);
  });

  it('updates toast', () => {
    const { result } = renderHook(() => useToasts());
    const data = { content: <p>Burning hot toast</p> };
    act(() => {
      result.current.add(T1);
      result.current.add(T2);
      result.current.add(T3);
      result.current.update(T2.id, data);
    });
    expect(result.current.toasts[T2.id]).toHaveProperty(
      'content',
      data.content
    );
    expect(result.current.count).toEqual(3);
  });

  it('removes all toasts', () => {
    const { result } = renderHook(() => useToasts());
    act(() => {
      result.current.add(T1);
      result.current.add(T2);
      result.current.add(T3);
      result.current.removeAll();
    });
    expect(result.current.toasts).toEqual({});
    expect(result.current.count).toEqual(0);
  });

  it('sends close signal to toast', () => {
    const { result } = renderHook(() => useToasts());
    act(() => {
      result.current.add(T1);
      result.current.add(T2);
      result.current.add(T3);
      result.current.close(T2.id);
    });
    expect(result.current.toasts[T2.id]).toHaveProperty('signal', 'close');
  });

  it('sends close signal to all toasts', () => {
    const { result } = renderHook(() => useToasts());
    act(() => {
      result.current.add(T1);
      result.current.add(T2);
      result.current.add(T3);
      result.current.closeAll();
    });
    Object.values(result.current.toasts).forEach((t) => {
      expect(t).toHaveProperty('signal', 'close');
    });
  });

  it('sets toast (adds or update if exists)', () => {
    const { result } = renderHook(() => useToasts());
    const data = { content: <p>Burning hot toast</p> };
    act(() => {
      result.current.setToast(T1);
      result.current.setToast(T1);
      result.current.setToast(T2);
      result.current.setToast(T3);
      result.current.setToast(T3);
      result.current.setToast({ ...T3, ...data });
    });
    expect(result.current.toasts[T3.id]).toHaveProperty(
      'content',
      data.content
    );
    expect(result.current.count).toEqual(3);
  });
});
