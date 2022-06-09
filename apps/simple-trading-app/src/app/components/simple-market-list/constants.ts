import { Intent } from '@vegaprotocol/ui-toolkit';
import { MarketState } from '@vegaprotocol/types';

export const MARKET_STATUS: Record<MarketState | '', Intent> = {
  [MarketState.Active]: Intent.Success,
  [MarketState.Cancelled]: Intent.Primary,
  [MarketState.Closed]: Intent.None,
  [MarketState.Pending]: Intent.Warning,
  [MarketState.Proposed]: Intent.Warning,
  [MarketState.Rejected]: Intent.Danger,
  [MarketState.Settled]: Intent.Primary,
  [MarketState.Suspended]: Intent.Warning,
  [MarketState.TradingTerminated]: Intent.Danger,
  '': Intent.Primary,
};
