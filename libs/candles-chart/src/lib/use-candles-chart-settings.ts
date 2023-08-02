import { ChartType, Interval, Study } from 'pennant';
import type { Overlay } from 'pennant';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface StoredSettings {
  interval: Interval;
  type: ChartType;
  overlays: Overlay[];
  studies: Study[];
}

const DEFAULT_CHART_SETTINGS = {
  interval: Interval.I15M,
  type: ChartType.CANDLE,
  overlays: [],
  studies: [Study.VOLUME],
};

export const useCandlesChartSettings = create<
  StoredSettings & {
    merge: (settings: Partial<StoredSettings>) => void;
    setType: (type: ChartType) => void;
    setInterval: (interval: Interval) => void;
    setOverlays: (overlays: Overlay[]) => void;
    setStudies: (studies: Study[]) => void;
  }
>()(
  persist(
    immer((set) => ({
      ...DEFAULT_CHART_SETTINGS,
      merge: (settings: Partial<StoredSettings>) =>
        set((state) => {
          Object.assign(state, settings);
        }),
      setType: (type) =>
        set((state) => {
          state.type = type;
        }),
      setInterval: (interval) =>
        set((state) => {
          state.interval = interval;
        }),
      setOverlays: (overlays) =>
        set((state) => {
          state.overlays = overlays;
        }),
      setStudies: (studies) =>
        set((state) => {
          state.studies = studies;
        }),
    })),
    {
      name: 'vega_candles_chart_store',
    }
  )
);
