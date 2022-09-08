/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DepositStatus } from "./../../../../types/src/__generated__/globalTypes";

// ====================================================
// GraphQL query operation: DepositsQuery
// ====================================================

export interface DepositsQuery_party_depositsConnection_edges_node_asset {
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

export interface DepositsQuery_party_depositsConnection_edges_node {
  __typename: "Deposit";
  /**
   * The Vega internal id of the deposit
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
  asset: DepositsQuery_party_depositsConnection_edges_node_asset;
  /**
   * RFC3339Nano time at which the deposit was created
   */
  createdTimestamp: string;
  /**
   * RFC3339Nano time at which the deposit was finalized
   */
  creditedTimestamp: string | null;
  /**
   * Hash of the transaction on the foreign chain
   */
  txHash: string | null;
}

export interface DepositsQuery_party_depositsConnection_edges {
  __typename: "DepositEdge";
  node: DepositsQuery_party_depositsConnection_edges_node;
}

export interface DepositsQuery_party_depositsConnection {
  __typename: "DepositsConnection";
  /**
   * The deposits
   */
  edges: (DepositsQuery_party_depositsConnection_edges | null)[] | null;
}

export interface DepositsQuery_party {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
  /**
   * The list of all deposits for a party by the party
   */
  depositsConnection: DepositsQuery_party_depositsConnection;
}

export interface DepositsQuery {
  /**
   * An entity that is trading on the VEGA network
   */
  party: DepositsQuery_party | null;
}

export interface DepositsQueryVariables {
  partyId: string;
}
