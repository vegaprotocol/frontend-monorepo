/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AccountType } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: Delegations
// ====================================================

export interface Delegations_epoch {
  __typename: "Epoch";
  /**
   * Presumably this is an integer or something. If there's no such thing, disregard
   */
  id: string;
}

export interface Delegations_party_delegations_node {
  __typename: "Node";
  /**
   * The node url eg n01.vega.xyz
   */
  id: string;
  name: string;
}

export interface Delegations_party_delegations {
  __typename: "Delegation";
  amountFormatted: string;
  /**
   * Amount delegated
   */
  amount: string;
  /**
   * URL of node you are delegating to
   */
  node: Delegations_party_delegations_node;
  /**
   * Epoch of delegation
   */
  epoch: number;
}

export interface Delegations_party_stake {
  __typename: "PartyStake";
  /**
   * The stake currently available for the party
   */
  currentStakeAvailable: string;
  currentStakeAvailableFormatted: string;
}

export interface Delegations_party_accounts_asset_source_BuiltinAsset {
  __typename: "BuiltinAsset";
}

export interface Delegations_party_accounts_asset_source_ERC20 {
  __typename: "ERC20";
  /**
   * The address of the erc20 contract
   */
  contractAddress: string;
}

export type Delegations_party_accounts_asset_source = Delegations_party_accounts_asset_source_BuiltinAsset | Delegations_party_accounts_asset_source_ERC20;

export interface Delegations_party_accounts_asset {
  __typename: "Asset";
  /**
   * The full name of the asset (e.g: Great British Pound)
   */
  name: string;
  /**
   * The id of the asset
   */
  id: string;
  /**
   * The precision of the asset
   */
  decimals: number;
  /**
   * The symbol of the asset (e.g: GBP)
   */
  symbol: string;
  /**
   * The origin source of the asset (e.g: an erc20 asset)
   */
  source: Delegations_party_accounts_asset_source;
}

export interface Delegations_party_accounts {
  __typename: "Account";
  /**
   * Asset, the 'currency'
   */
  asset: Delegations_party_accounts_asset;
  /**
   * Account type (General, Margin, etc)
   */
  type: AccountType;
  /**
   * Balance as string - current account balance (approx. as balances can be updated several times per second)
   */
  balance: string;
}

export interface Delegations_party {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
  delegations: Delegations_party_delegations[] | null;
  /**
   * The staking information for this Party
   */
  stake: Delegations_party_stake;
  /**
   * Collateral accounts relating to a party
   */
  accounts: Delegations_party_accounts[] | null;
}

export interface Delegations {
  /**
   * get data for a specific epoch, if id omitted it gets the current epoch. If the string is 'next', fetch the next epoch
   */
  epoch: Delegations_epoch;
  /**
   * An entity that is trading on the VEGA network
   */
  party: Delegations_party | null;
}

export interface DelegationsVariables {
  partyId: string;
}
