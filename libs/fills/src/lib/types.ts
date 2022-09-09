import type { Schema } from '@vegaprotocol/types';
import type { FillFieldsFragment } from './__generated__/Fills';

export type FillsTradeEdge = Pick<Schema.TradeEdge, '__typename' | 'cursor'> & {
  node: FillFieldsFragment;
};
