/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DepositStatus } from "@vegaprotocol/types";

// ====================================================
// GraphQL fragment: DepositFields
// ====================================================

export interface DepositFields_asset {
  __typename: "Asset";
  /**
   * The id of the asset
   */
  id: string;
  /**
   * The symbol of the asset (e.g: GBP)
   */
  symbol: string;
  /**
   * The precision of the asset
   */
  decimals: number;
}

export interface DepositFields {
  __typename: "Deposit";
  /**
   * The Vega internal id of the deposit
   */
  id: string;
  /**
   * The amount to be withdrawn
   */
  amount: string;
  /**
   * RFC3339Nano time at which the deposit was created
   */
  createdTimestamp: string;
  /**
   * RFC3339Nano time at which the deposit was finalized
   */
  creditedTimestamp: string | null;
  /**
   * The asset to be withdrawn
   */
  asset: DepositFields_asset;
  /**
   * The current status of the deposit
   */
  status: DepositStatus;
  /**
   * Hash of the transaction on the foreign chain
   */
  txHash: string | null;
}
