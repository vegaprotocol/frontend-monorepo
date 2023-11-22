import { TradingView } from '@vegaprotocol/trading-view';

export const TradingViewContainer = ({ marketId }: { marketId: string }) => {
  return <TradingView marketId={marketId} />;
};
