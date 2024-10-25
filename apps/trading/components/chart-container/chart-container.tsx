import invert from 'lodash/invert';
import { type Interval } from '@vegaprotocol/types';
import {
  TradingViewContainer,
  ALLOWED_TRADINGVIEW_HOSTNAMES,
  TRADINGVIEW_INTERVAL_MAP,
} from '@vegaprotocol/trading-view';
import { useEnvironment } from '@vegaprotocol/environment';
import { useChartSettings } from './use-chart-settings';
import { SUPPORTED_INTERVALS, type SupportedInterval } from './constants';
import { useT } from '../../lib/use-t';

/**
 * Renders either the pennant chart or the tradingview chart
 */
export const ChartContainer = ({ marketId }: { marketId: string }) => {
  const t = useT();
  const { CHARTING_LIBRARY_PATH, CHARTING_LIBRARY_HASH } = useEnvironment();

  const { interval, setInterval } = useChartSettings();

  const fallback = <p>{t('Chart initialization failed')}</p>;

  if (!ALLOWED_TRADINGVIEW_HOSTNAMES.includes(window.location.hostname)) {
    return fallback;
  }

  if (!CHARTING_LIBRARY_PATH || !CHARTING_LIBRARY_HASH) {
    return fallback;
  }

  return (
    <TradingViewContainer
      libraryPath={CHARTING_LIBRARY_PATH}
      libraryHash={CHARTING_LIBRARY_HASH}
      marketId={marketId}
      interval={toTradingViewResolution(interval as SupportedInterval)}
      onIntervalChange={(newInterval) => {
        setInterval(fromTradingViewResolution(newInterval));
      }}
    />
  );
};

const toTradingViewResolution = (interval: SupportedInterval) => {
  if (!SUPPORTED_INTERVALS.includes(interval)) {
    throw new Error(`interval ${interval} is not supported`);
  }

  const resolution = TRADINGVIEW_INTERVAL_MAP[interval];

  if (!resolution) {
    throw new Error(
      `failed to convert interval: ${interval} to valid resolution`
    );
  }

  return resolution;
};

const fromTradingViewResolution = (resolution: string) => {
  const interval = invert(TRADINGVIEW_INTERVAL_MAP)[resolution];

  if (!interval) {
    throw new Error(
      `failed to convert resolution: ${resolution} to valid interval`
    );
  }

  return interval as Interval;
};
