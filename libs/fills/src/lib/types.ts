import { Schema } from '@vegaprotocol/types';
import { FillFieldsFragment } from './__generated__/Fills';

export type FillsTradeEdge = Pick<Schema.TradeEdge, '__typename' | 'cursor'> & {
  node: FillFieldsFragment,
};
