/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL subscription operation: TradesSub
// ====================================================

export interface TradesSub_trades {
  __typename: "TradeUpdate";
  /**
   * The hash of the trade data
   */
  id: string;
  /**
   * The price of the trade (probably initially the passive order price, other determination algorithms are possible though) (uint64)
   */
  price: string;
  /**
   * The number of units traded, will always be <= the remaining size of both orders immediately before the trade (uint64)
   */
  size: string;
  /**
   * RFC3339Nano time for when the trade occurred
   */
  createdAt: string;
  /**
   * The market the trade occurred on
   */
  marketId: string;
}

export interface TradesSub {
  /**
   * Subscribe to the trades updates
   */
  trades: TradesSub_trades[] | null;
}

export interface TradesSubVariables {
  marketId: string;
}
