import { Intent } from '@vegaprotocol/ui-toolkit';
import { MarketState } from '@vegaprotocol/types';

export const MARKET_STATUS: Record<MarketState | '', Intent> = {
  [MarketState.Active]: Intent.Success,
  [MarketState.Cancelled]: Intent.None,
  [MarketState.Closed]: Intent.None,
  [MarketState.Pending]: Intent.Warning,
  [MarketState.Proposed]: Intent.Primary,
  [MarketState.Rejected]: Intent.Danger,
  [MarketState.Settled]: Intent.None,
  [MarketState.Suspended]: Intent.Warning,
  [MarketState.TradingTerminated]: Intent.Danger,
  '': Intent.None,
};
