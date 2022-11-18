import create from 'zustand';
import type { Toast } from './toast';

type ToastsStore = {
  /**
   * A list of active toasts
   */
  toasts: Toast[];
  /**
   * Adds/displays a new toast
   */
  add: (toast: Toast) => void;
  /**
   * Updates a toast
   */
  update: (id: string, toastData: Partial<Toast>) => void;
  /**
   * Closes a toast
   */
  close: (id: string) => void;
  /**
   * Closes all toasts
   */
  closeAll: () => void;
  /**
   * Arbitrary removes a toast
   */
  remove: (id: string) => void;
  /**
   * Arbitrary removes all toasts
   */
  removeAll: () => void;
};

const update =
  (id: string, toastData: Partial<Toast>) =>
  (store: ToastsStore): Partial<ToastsStore> => {
    const toasts = [...store.toasts];
    const toastIdx = toasts.findIndex((t) => t.id === id);
    if (toastIdx > -1) toasts[toastIdx] = { ...toasts[toastIdx], ...toastData };
    return { toasts };
  };

export const useToasts = create<ToastsStore>((set) => ({
  toasts: [],
  add: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, toast],
    })),
  update: (id, toastData) => set(update(id, toastData)),
  close: (id) => set(update(id, { signal: 'close' })),
  closeAll: () =>
    set((state) => ({
      toasts: [...state.toasts].map((t) => ({ ...t, signal: 'close' })),
    })),
  remove: (id) =>
    set((state) => ({
      toasts: [...state.toasts].filter((t) => t.id !== id),
    })),
  removeAll: () =>
    set(() => ({
      toasts: [],
    })),
}));
