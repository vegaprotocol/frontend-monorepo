/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Side, OrderTimeInForce, OrderType } from "@vegaprotocol/types";

// ====================================================
// GraphQL query operation: EstimateOrder
// ====================================================

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
   * The total estimated amount of fee if the order was to trade
   */
  totalFeeAmount: string;
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
