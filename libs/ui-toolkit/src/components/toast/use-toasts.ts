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
   * Adds a new toast or updates if id already exists.
   */
  setToast: (toast: Toast) => void;
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

const add =
  (toast: Toast) =>
  (store: ToastsStore): Partial<ToastsStore> => ({
    toasts: [...store.toasts, toast],
  });

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
  add: (toast) => set(add(toast)),
  update: (id, toastData) => set(update(id, toastData)),
  setToast: (toast: Toast) =>
    set((store) => {
      if (store.toasts.find((t) => t.id === toast.id)) {
        return update(toast.id, toast)(store);
      } else {
        return add(toast)(store);
      }
    }),
  close: (id) => set(update(id, { signal: 'close' })),
  closeAll: () =>
    set((store) => ({
      toasts: [...store.toasts].map((t) => ({ ...t, signal: 'close' })),
    })),
  remove: (id) =>
    set((store) => ({
      toasts: [...store.toasts].filter((t) => t.id !== id),
    })),
  removeAll: () =>
    set(() => ({
      toasts: [],
    })),
}));
