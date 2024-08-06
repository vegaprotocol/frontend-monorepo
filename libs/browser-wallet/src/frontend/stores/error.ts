import { create } from 'zustand';

export type ErrorStore = {
  error: Error | null;
  setError: (error: Error) => void;
};

export const useErrorStore = create<ErrorStore>()((set) => ({
  error: null,
  setError(error: Error | null) {
    set({ error: error });
  },
}));
