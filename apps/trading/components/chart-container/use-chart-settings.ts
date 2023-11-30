import { ChartType, Overlay, Study } from 'pennant';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Interval } from '@vegaprotocol/types';
import { getValidItem, getValidSubset } from '@vegaprotocol/react-helpers';
import { ENV } from '@vegaprotocol/environment';

type StudySizes = { [S in Study]?: number };
export type Chartlib = 'pennant' | 'tradingview';

interface StoredSettings {
  chartlib: Chartlib;
  // For interval we use the enum from @vegaprotocol/types, this is to make mapping between different
  // chart types easier and more consistent
  interval: Interval;
  type: ChartType;
  overlays: Overlay[];
  studies: Study[];
  studySizes: StudySizes;
}

export const STUDY_SIZE = 90;
const STUDY_ORDER: Study[] = [
  Study.FORCE_INDEX,
  Study.RELATIVE_STRENGTH_INDEX,
  Study.ELDAR_RAY,
  Study.MACD,
  Study.VOLUME,
];

export const DEFAULT_CHART_SETTINGS = {
  chartlib: ENV.CHARTING_LIBRARY_PATH
    ? ('tradingview' as const)
    : ('pennant' as const),
  interval: Interval.INTERVAL_I15M,
  type: ChartType.CANDLE,
  overlays: [Overlay.MOVING_AVERAGE],
  studies: [Study.MACD, Study.VOLUME],
  studySizes: {},
};

export const useChartSettingsStore = create<
  StoredSettings & {
    setType: (type: ChartType) => void;
    setInterval: (interval: Interval) => void;
    setOverlays: (overlays?: Overlay[]) => void;
    setStudies: (studies?: Study[]) => void;
    setStudySizes: (sizes: number[]) => void;
    setChartlib: (lib: Chartlib) => void;
  }
>()(
  persist(
    immer((set) => ({
      ...DEFAULT_CHART_SETTINGS,
      setType: (type) =>
        set((state) => {
          state.type = type;
        }),
      setInterval: (interval) =>
        set((state) => {
          state.interval = interval;
        }),
      setOverlays: (overlays) => {
        if (!overlays) return;

        set((state) => {
          state.overlays = overlays;
        });
      },
      setStudies: (studies) => {
        if (!studies) return;

        // Make sure studies are always returned in the same order
        studies.sort((a, b) => {
          return STUDY_ORDER.indexOf(a) - STUDY_ORDER.indexOf(b);
        });

        set((state) => {
          state.studies = studies;
        });
      },
      setStudySizes: (sizes) => {
        set((state) => {
          // for every study find the corresonding size and update
          // the size record for that study
          state.studies.forEach((s, i) => {
            const size = sizes[i];
            state.studySizes[s] = size;
          });
        });
      },
      setChartlib: (lib) => {
        set((state) => {
          state.chartlib = lib;
        });
      },
    })),
    {
      name: 'vega_candles_chart_store',
    }
  )
);

export const useChartSettings = () => {
  const settings = useChartSettingsStore();

  const interval: Interval = getValidItem(
    settings.interval,
    Object.values(Interval),
    Interval.INTERVAL_I15M
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

  // find the study size
  const studySizes = studies.map((s) => {
    const size = settings.studySizes[s] || STUDY_SIZE;
    return size;
  });

  return {
    chartlib: settings.chartlib,
    interval,
    chartType,
    overlays,
    studies,
    studySizes,
    setInterval: settings.setInterval,
    setType: settings.setType,
    setStudies: settings.setStudies,
    setOverlays: settings.setOverlays,
    setStudySizes: settings.setStudySizes,
    setChartlib: settings.setChartlib,
  };
};
