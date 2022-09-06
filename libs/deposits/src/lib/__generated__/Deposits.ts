/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DepositStatus } from "@vegaprotocol/types";

// ====================================================
// GraphQL query operation: Deposits
// ====================================================

export interface Deposits_party_depositsConnection_edges_node_asset {
  __typename: "Asset";
  /**
   * The ID of the asset
   */
  id: string;
  /**
   * The symbol of the asset (e.g: GBP)
   */
  symbol: string;
  /**
   * The precision of the asset. Should match the decimal precision of the asset on its native chain, e.g: for ERC20 assets, it is often 18
   */
  decimals: number;
}

export interface Deposits_party_depositsConnection_edges_node {
  __typename: "Deposit";
  /**
   * The Vega internal ID of the deposit
   */
  id: string;
  /**
   * The current status of the deposit
   */
  status: DepositStatus;
  /**
   * The amount to be withdrawn
   */
  amount: string;
  /**
   * The asset to be withdrawn
   */
  asset: Deposits_party_depositsConnection_edges_node_asset;
  /**
   * RFC3339Nano time at which the deposit was created
   */
  createdTimestamp: string;
  /**
   * RFC3339Nano time at which the deposit was finalised
   */
  creditedTimestamp: string | null;
  /**
   * Hash of the transaction on the foreign chain
   */
  txHash: string | null;
}

export interface Deposits_party_depositsConnection_edges {
  __typename: "DepositEdge";
  node: Deposits_party_depositsConnection_edges_node;
}

export interface Deposits_party_depositsConnection {
  __typename: "DepositsConnection";
  /**
   * The deposits
   */
  edges: (Deposits_party_depositsConnection_edges | null)[] | null;
}

export interface Deposits_party {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
  /**
   * The list of all deposits for a party by the party
   */
  depositsConnection: Deposits_party_depositsConnection;
}

export interface Deposits {
  /**
   * An entity that is trading on the Vega network
   */
  party: Deposits_party | null;
}

export interface DepositsVariables {
  partyId: string;
}
