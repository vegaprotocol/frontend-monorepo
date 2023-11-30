import invert from 'lodash/invert';
import { Interval } from 'pennant';
import { CandlesChartContainer } from '@vegaprotocol/candles-chart';
import { useChartSettings, STUDY_SIZE } from './use-chart-settings';
import {
  TradingViewContainer,
  ALLOWED_TRADINGVIEW_HOSTNAMES,
} from '@vegaprotocol/trading-view';
import { useEnvironment } from '@vegaprotocol/environment';

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
      interval={interval}
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

const TRADINGVIEW_RESOLUTION_MAP: Record<Interval, string> = {
  [Interval.I1M]: '1',
  [Interval.I5M]: '5',
  [Interval.I15M]: '15',
  [Interval.I1H]: '60',
  [Interval.I6H]: '360',
  [Interval.I1D]: '1D',
};

const toTradingViewResolution = (interval: Interval) => {
  return TRADINGVIEW_RESOLUTION_MAP[interval];
};

const fromTradingViewResolution = (resolution: string) => {
  const obj = invert(TRADINGVIEW_RESOLUTION_MAP);
  const interval = obj[resolution];

  if (!interval) {
    throw new Error(
      `failed to convert resolution: ${resolution} to valid interval`
    );
  }

  return interval as Interval;
};
