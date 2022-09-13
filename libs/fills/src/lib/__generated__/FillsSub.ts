/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Side } from "@vegaprotocol/types";

// ====================================================
// GraphQL subscription operation: FillsSub
// ====================================================

export interface FillsSub_trades_buyerFee {
  __typename: "TradeFee";
  /**
   * The maker fee, paid by the aggressive party to the other party (the one who had an order in the book)
   */
  makerFee: string;
  /**
   * The infrastructure fee, a fee paid to the validators to maintain the Vega network
   */
  infrastructureFee: string;
  /**
   * The fee paid to the liquidity providers that committed liquidity to the market
   */
  liquidityFee: string;
}

export interface FillsSub_trades_sellerFee {
  __typename: "TradeFee";
  /**
   * The maker fee, paid by the aggressive party to the other party (the one who had an order in the book)
   */
  makerFee: string;
  /**
   * The infrastructure fee, a fee paid to the validators to maintain the Vega network
   */
  infrastructureFee: string;
  /**
   * The fee paid to the liquidity providers that committed liquidity to the market
   */
  liquidityFee: string;
}

export interface FillsSub_trades {
  __typename: "TradeUpdate";
  /**
   * The hash of the trade data
   */
  id: string;
  /**
   * RFC3339Nano time for when the trade occurred
   */
  createdAt: string;
  /**
   * The price of the trade (probably initially the passive order price, other determination algorithms are possible though) (uint64)
   */
  price: string;
  /**
   * The number of units traded, will always be <= the remaining size of both orders immediately before the trade (uint64)
   */
  size: string;
  /**
   * The order that bought
   */
  buyOrder: string;
  /**
   * The order that sold
   */
  sellOrder: string;
  /**
   * The aggressor indicates whether this trade was related to a BUY or SELL
   */
  aggressor: Side;
  /**
   * The party that bought
   */
  buyerId: string;
  /**
   * The party that sold
   */
  sellerId: string;
  /**
   * The market the trade occurred on
   */
  marketId: string;
  /**
   * The fee paid by the buyer side of the trade
   */
  buyerFee: FillsSub_trades_buyerFee;
  /**
   * The fee paid by the seller side of the trade
   */
  sellerFee: FillsSub_trades_sellerFee;
}

export interface FillsSub {
  /**
   * Subscribe to the trades updates
   */
  trades: FillsSub_trades[] | null;
}

export interface FillsSubVariables {
  partyId: string;
}
