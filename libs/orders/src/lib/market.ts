/* eslint-disable @typescript-eslint/no-explicit-any */
import type { MarketState, MarketTradingMode } from '@vegaprotocol/types';

export interface Market {
  __typename?: string;
  id: string;
  positionDecimalPlaces: number;
  state: MarketState;
  decimalPlaces: number;
  tradingMode: MarketTradingMode;
  tradableInstrument?: any;
  depth?: any;
}
