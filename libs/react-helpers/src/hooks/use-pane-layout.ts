import { useCallback } from 'react';
import debounce from 'lodash/debounce';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

const STORAGE_KEY = 'vega_pane_store';
const PANELS_SET_DEBOUNCE_TIME = 300;

export const usePaneLayoutStore = create<{
  sizes: Record<string, string[]>;
  valueSetter: (id: string, value: string[]) => void;
}>()(
  persist(
    immer((set) => ({
      sizes: {},
      valueSetter: (id, value) =>
        set((state) => {
          state.sizes[id] = value;
          return state;
        }),
    })),
    { name: STORAGE_KEY }
  )
);

interface UsePaneLayoutProps {
  id: string;
}
export const usePaneLayout = ({
  id,
}: UsePaneLayoutProps): [string[], (sizes: number[]) => void] => {
  const sizes = usePaneLayoutStore((store) => store.sizes[id]) || [];
  const valueSetter = usePaneLayoutStore((store) => store.valueSetter);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleOnChange = useCallback(
    debounce((args) => {
      if (args.length) {
        const all = args.reduce((agg: number, item: number) => agg + item, 0);
        const sizesArr = args.map((arg: number) => `${(arg / all) * 100}%`);
        valueSetter(id, sizesArr);
      }
    }, PANELS_SET_DEBOUNCE_TIME),
    [valueSetter, id]
  );
  return [sizes, handleOnChange];
};
