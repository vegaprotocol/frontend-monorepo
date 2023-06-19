import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { Toast } from './toast';
import omit from 'lodash/omit';
import isEqual from 'lodash/isEqual';

const STORAGE_KEY = 'vega_toast_store';

export type Toasts = Record<string, Toast>;

const isUpdateable = (a: Toast, b: Toast) =>
  isEqual(omit(a, 'onClose'), omit(b, 'onClose'));

type State = {
  toasts: Toasts;
  count: number;
};

type Actions = {
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
  /**
   * Checks if a given toasts exists in the collection
   */
  hasToast: (id: string) => boolean;
};

type ToastsStore = State & Actions;

export const useToasts = create<ToastsStore>()(
  immer((set, get) => ({
    toasts: {},
    count: 0,
    add: (toast) =>
      set((state) => {
        state.toasts[toast.id] = toast;
        ++state.count;
      }),
    update: (id, toastData) =>
      set((state) => {
        const found = state.toasts[id];
        if (found) {
          Object.assign(found, toastData);
        }
      }),
    setToast: (toast: Toast) =>
      set((state) => {
        const found = state.toasts[toast.id];
        if (found) {
          if (!isUpdateable(found, toast)) {
            Object.assign(found, toast);
          }
        } else {
          state.toasts[toast.id] = toast;
          ++state.count;
        }
      }),
    close: (id) =>
      set((state) => {
        const found = state.toasts[id];
        if (found) {
          found.signal = 'close';
        }
      }),
    closeAll: () =>
      set((state) => {
        Object.values(state.toasts).forEach((t) => (t.signal = 'close'));
      }),
    remove: (id) =>
      set((state) => {
        if (state.toasts[id]) {
          delete state.toasts[id];
          --state.count;
        }
      }),
    removeAll: () => set({ toasts: {}, count: 0 }),
    hasToast: (id) => get().toasts[id] != null,
  }))
);

export enum ToastPosition {
  BottomRight,
  BottomLeft,
  TopLeft,
  TopRight,
  TopCenter,
  BottomCenter,
}

type ToastsConfiguration = {
  position: ToastPosition;
  setPosition: (position: ToastPosition) => void;
};

export const useToastsConfiguration = create<ToastsConfiguration>()(
  persist(
    immer((set) => ({
      position: ToastPosition.BottomRight,
      setPosition: (position: ToastPosition) => set({ position }),
    })),
    { name: STORAGE_KEY }
  )
);
