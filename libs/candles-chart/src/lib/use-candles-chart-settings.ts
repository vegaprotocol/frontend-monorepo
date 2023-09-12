import { getValidItem, getValidSubset } from '@vegaprotocol/react-helpers';
import { ChartType, Interval, Study } from 'pennant';
import { Overlay } from 'pennant';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

type StudySizes = { [S in Study]?: number };

interface StoredSettings {
  interval: Interval;
  type: ChartType;
  overlays: Overlay[];
  studies: Study[];
  studySizes: StudySizes;
}

export const STUDY_SIZE = 100;
const STUDY_ORDER: Study[] = [
  Study.FORCE_INDEX,
  Study.RELATIVE_STRENGTH_INDEX,
  Study.ELDAR_RAY,
  Study.MACD,
  Study.VOLUME,
];

const DEFAULT_CHART_SETTINGS = {
  interval: Interval.I15M,
  type: ChartType.CANDLE,
  overlays: [Overlay.MOVING_AVERAGE],
  studies: [Study.MACD, Study.VOLUME],
  studySizes: {},
};

export const useCandlesChartSettingsStore = create<
  StoredSettings & {
    setType: (type: ChartType) => void;
    setInterval: (interval: Interval) => void;
    setOverlays: (overlays?: Overlay[]) => void;
    setStudies: (studies?: Study[]) => void;
    setStudySizes: (sizes: number[]) => void;
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

  // find the study size
  const studySizes = studies.map((s) => {
    const size = settings.studySizes[s] || STUDY_SIZE;
    return size;
  });

  return {
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
  };
};
