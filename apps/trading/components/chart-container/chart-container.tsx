import { CandlesChartContainer } from '@vegaprotocol/candles-chart';
import {
  useCandlesChartSettings,
  STUDY_SIZE,
} from './use-candles-chart-settings';
import { TradingViewContainer } from '../../components/trading-view-container';

/**
 * Renders either the pennant chart or the tradingview chart
 */
export const ChartContainer = ({ marketId }: { marketId: string }) => {
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

  switch (chartlib) {
    case 'tradingview': {
      return <TradingViewContainer marketId={marketId} />;
    }
    case 'pennant': {
      return (
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
    }
    default: {
      throw new Error('invalid chart lib');
    }
  }
};
