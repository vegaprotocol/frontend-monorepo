import { CandlesChartContainer } from '@vegaprotocol/candles-chart';
import {
  useCandlesChartSettings,
  STUDY_SIZE,
} from './use-candles-chart-settings';
import {
  TradingViewContainer,
  ALLOWED_TRADINGVIEW_HOSTNAMES,
} from '@vegaprotocol/trading-view';
import { useEnvironment } from '@vegaprotocol/environment';

/**
 * Renders either the pennant chart or the tradingview chart
 */
export const ChartContainer = ({ marketId }: { marketId: string }) => {
  const { CHARTING_LIBRARY_PATH } = useEnvironment();

  const {
    chartlib,
    interval,
    chartType,
    overlays,
    studies,
    studySizes,
    setStudies,
    setStudySizes,
    setOverlays,
  } = useCandlesChartSettings();

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

  if (!CHARTING_LIBRARY_PATH) {
    return pennantChart;
  }

  switch (chartlib) {
    case 'tradingview': {
      return (
        <TradingViewContainer
          marketId={marketId}
          libraryPath={CHARTING_LIBRARY_PATH}
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
