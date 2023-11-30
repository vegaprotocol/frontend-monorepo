import invert from 'lodash/invert';
import { Interval } from '@vegaprotocol/types';
import {
  TradingViewContainer,
  ALLOWED_TRADINGVIEW_HOSTNAMES,
  TRADINGVIEW_INTERVAL_MAP,
} from '@vegaprotocol/trading-view';
import {
  CandlesChartContainer,
  PENNANT_INTERVAL_MAP,
} from '@vegaprotocol/candles-chart';
import { useEnvironment } from '@vegaprotocol/environment';
import { useChartSettings, STUDY_SIZE } from './use-chart-settings';

/**
 * Renders either the pennant chart or the tradingview chart
 */
export const ChartContainer = ({ marketId }: { marketId: string }) => {
  const { CHARTING_LIBRARY_PATH, CHARTING_LIBRARY_HASH } = useEnvironment();

  const {
    chartlib,
    interval,
    chartType,
    overlays,
    studies,
    studySizes,
    setInterval,
    setStudies,
    setStudySizes,
    setOverlays,
  } = useChartSettings();

  const pennantChart = (
    <CandlesChartContainer
      marketId={marketId}
      interval={toPennantInterval(interval)}
      chartType={chartType}
      overlays={overlays}
      studies={studies}
      studySizes={studySizes}
      setStudySizes={setStudySizes}
      setStudies={setStudies}
      setOverlays={setOverlays}
      defaultStudySize={STUDY_SIZE}
    />
  );

  if (!ALLOWED_TRADINGVIEW_HOSTNAMES.includes(window.location.hostname)) {
    return pennantChart;
  }

  if (!CHARTING_LIBRARY_PATH || !CHARTING_LIBRARY_HASH) {
    return pennantChart;
  }

  switch (chartlib) {
    case 'tradingview': {
      return (
        <TradingViewContainer
          libraryPath={CHARTING_LIBRARY_PATH}
          libraryHash={CHARTING_LIBRARY_HASH}
          marketId={marketId}
          interval={toTradingViewResolution(interval)}
          onIntervalChange={(newInterval) => {
            setInterval(fromTradingViewResolution(newInterval));
          }}
        />
      );
    }
    case 'pennant': {
      return pennantChart;
    }
    default: {
      throw new Error('invalid chart lib');
    }
  }
};

const toTradingViewResolution = (interval: Interval) => {
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

const toPennantInterval = (interval: Interval) => {
  const pennantInterval = PENNANT_INTERVAL_MAP[interval];

  if (!pennantInterval) {
    throw new Error(
      `failed to convert interval: ${interval} to valid pennant interval`
    );
  }

  return pennantInterval;
};
