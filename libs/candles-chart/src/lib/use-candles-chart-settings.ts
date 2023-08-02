import { getValidItem, getValidSubset } from '@vegaprotocol/react-helpers';
import { ChartType, Interval, Study } from 'pennant';
import { Overlay } from 'pennant';
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

export const useCandlesChartSettingsStore = create<
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

export const useCandlesChartSettings = () => {
  const settings = useCandlesChartSettingsStore();

  const interval: Interval = getValidItem(
    settings.interval,
    Object.values(Interval),
    Interval.I15M
  );

  const chartType: ChartType = getValidItem(
    settings.type,
    Object.values(ChartType),
    ChartType.CANDLE
  );

  const overlays: Overlay[] = getValidSubset(
    settings.overlays,
    Object.values(Overlay),
    []
  );

  const studies: Study[] = getValidSubset(
    settings.studies,
    Object.values(Study),
    [Study.VOLUME]
  );

  return {
    interval,
    chartType,
    overlays,
    studies,
    setInterval: settings.setInterval,
    setType: settings.setType,
    setStudies: settings.setStudies,
    setOverlays: settings.setOverlays,
    merge: settings.merge,
  };
};
