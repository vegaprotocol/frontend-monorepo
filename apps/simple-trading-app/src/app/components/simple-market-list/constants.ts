import { TailwindIntents } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/react-helpers';
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

export const STATES_FILTER = [
  { value: 'all', text: t('All') },
  { value: 'Active', text: t('Active') },
  { value: 'Cancelled', text: t('Cancelled') },
  { value: 'Closed', text: t('Closed') },
  { value: 'Pending', text: t('Pending') },
  { value: 'Proposed', text: t('Proposed') },
  { value: 'Rejected', text: t('Rejected') },
  { value: 'Settled', text: t('Settled') },
  { value: 'Suspended', text: t('Suspended') },
  { value: 'TradingTerminated', text: t('TradingTerminated') },
];
