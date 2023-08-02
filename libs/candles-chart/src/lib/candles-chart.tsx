import 'pennant/dist/style.css';
import { CandlestickChart, ChartType, Interval, Overlay, Study } from 'pennant';
import { VegaDataSource } from './data-source';
import { useApolloClient } from '@apollo/client';
import { useMemo } from 'react';
import { useVegaWallet } from '@vegaprotocol/wallet';
import {
  useThemeSwitcher,
  getValidItem,
  getValidSubset,
} from '@vegaprotocol/react-helpers';
import { t } from '@vegaprotocol/i18n';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface StoredSettings {
  interval?: Interval;
  type?: ChartType;
  overlays?: Overlay[];
  studies?: Study[];
}

export const useCandlesChartSettings = create<
  StoredSettings & {
    merge: (settings: StoredSettings) => void;
    setType: (type: ChartType) => void;
    setInterval: (interval: Interval) => void;
    setOverlays: (overlays: Overlay[]) => void;
    setStudies: (studies: Study[]) => void;
  }
>()(
  persist(
    immer((set) => ({
      merge: (settings: StoredSettings) =>
        set((state) => {
          Object.assign(state, settings);
        }),
      setType: (type: ChartType) =>
        set((state) => {
          state.type = type;
        }),
      setInterval: (interval: Interval) =>
        set((state) => {
          state.interval = interval;
        }),
      setOverlays: (overlays: Overlay[]) =>
        set((state) => {
          state.overlays = overlays;
        }),
      setStudies: (studies: Study[]) =>
        set((state) => {
          state.studies = studies;
        }),
    })),
    {
      name: 'console-candles',
    }
  )
);

export type CandlesChartContainerProps = {
  marketId: string;
};

export const CandlesChartContainer = ({
  marketId,
}: CandlesChartContainerProps) => {
  const client = useApolloClient();
  const { pubKey } = useVegaWallet();
  const { theme } = useThemeSwitcher();

  const settings = useCandlesChartSettings();

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

  const dataSource = useMemo(() => {
    return new VegaDataSource(client, marketId, pubKey);
  }, [client, marketId, pubKey]);

  return (
    <CandlestickChart
      dataSource={dataSource}
      options={{
        chartType: chartType,
        overlays: overlays,
        studies: studies,
        notEnoughDataText: (
          <span className="text-xs text-center">{t('No data')}</span>
        ),
      }}
      interval={interval}
      theme={theme}
      onOptionsChanged={(options) => {
        settings.merge({
          overlays: options.overlays,
          studies: options.studies,
        });
      }}
    />
  );
};
