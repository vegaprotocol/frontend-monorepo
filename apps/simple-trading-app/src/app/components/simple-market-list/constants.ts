import { TailwindIntents } from '@vegaprotocol/ui-toolkit';
import { MarketState } from '@vegaprotocol/types';

export const MARKET_STATUS: Record<MarketState | '', TailwindIntents> = {
  [MarketState.Active]: TailwindIntents.Success,
  [MarketState.Cancelled]: TailwindIntents.Highlight,
  [MarketState.Closed]: TailwindIntents.Help,
  [MarketState.Pending]: TailwindIntents.Warning,
  [MarketState.Proposed]: TailwindIntents.Prompt,
  [MarketState.Rejected]: TailwindIntents.Danger,
  [MarketState.Settled]: TailwindIntents.Highlight,
  [MarketState.Suspended]: TailwindIntents.Warning,
  [MarketState.TradingTerminated]: TailwindIntents.Danger,
  '': TailwindIntents.Highlight,
};

export const DATE_FORMAT = 'dd MMMM yyyy HH:mm';
