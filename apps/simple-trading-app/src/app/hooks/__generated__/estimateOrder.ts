/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Side, OrderTimeInForce, OrderType } from "@vegaprotocol/types";

// ====================================================
// GraphQL query operation: EstimateOrder
// ====================================================

export interface EstimateOrder_estimateOrder_fee {
  __typename: "TradeFee";
  /**
   * The maker fee, aggressive party to the other party (the one who had an order in the book)
   */
  makerFee: string;
  /**
   * The infrastructure fee, a fee paid to the node runner to maintain the vega network
   */
  infrastructureFee: string;
  /**
   * The fee paid to the market makers to provide liquidity in the market
   */
  liquidityFee: string;
}

export interface EstimateOrder_estimateOrder_marginLevels {
  __typename: "MarginLevels";
  /**
   * this is the minimal margin required for a party to place a new order on the network (unsigned int actually)
   */
  initialLevel: string;
}

export interface EstimateOrder_estimateOrder {
  __typename: "OrderEstimate";
  /**
   * The estimated fee if the order was to trade
   */
  fee: EstimateOrder_estimateOrder_fee;
  /**
   * The margin requirement for this order
   */
  marginLevels: EstimateOrder_estimateOrder_marginLevels;
}

export interface EstimateOrder {
  /**
   * return an estimation of the potential cost for a new order
   */
  estimateOrder: EstimateOrder_estimateOrder;
}

export interface EstimateOrderVariables {
  marketId: string;
  partyId: string;
  price?: string | null;
  size: string;
  side: Side;
  timeInForce: OrderTimeInForce;
  expiration?: string | null;
  type: OrderType;
}
