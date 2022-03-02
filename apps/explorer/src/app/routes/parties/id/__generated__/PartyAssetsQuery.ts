/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AccountType } from '../../../../../__generated__/globalTypes';

// ====================================================
// GraphQL query operation: PartyAssetsQuery
// ====================================================

export interface PartyAssetsQuery_party_delegations_node {
  __typename: 'Node';
  /**
   * The node url eg n01.vega.xyz
   */
  id: string;
  name: string;
}

export interface PartyAssetsQuery_party_delegations {
  __typename: 'Delegation';
  /**
   * Amount delegated
   */
  amount: string;
  /**
   * URL of node you are delegating to
   */
  node: PartyAssetsQuery_party_delegations_node;
  /**
   * Epoch of delegation
   */
  epoch: number;
}

export interface PartyAssetsQuery_party_stake {
  __typename: 'PartyStake';
  /**
   * The stake currently available for the party
   */
  currentStakeAvailable: string;
}

export interface PartyAssetsQuery_party_accounts_asset_source_BuiltinAsset {
  __typename: 'BuiltinAsset';
}

export interface PartyAssetsQuery_party_accounts_asset_source_ERC20 {
  __typename: 'ERC20';
  /**
   * The address of the erc20 contract
   */
  contractAddress: string;
}

export type PartyAssetsQuery_party_accounts_asset_source =
  | PartyAssetsQuery_party_accounts_asset_source_BuiltinAsset
  | PartyAssetsQuery_party_accounts_asset_source_ERC20;

export interface PartyAssetsQuery_party_accounts_asset {
  __typename: 'Asset';
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
  source: PartyAssetsQuery_party_accounts_asset_source;
}

export interface PartyAssetsQuery_party_accounts {
  __typename: 'Account';
  /**
   * Asset, the 'currency'
   */
  asset: PartyAssetsQuery_party_accounts_asset;
  /**
   * Account type (General, Margin, etc)
   */
  type: AccountType;
  /**
   * Balance as string - current account balance (approx. as balances can be updated several times per second)
   */
  balance: string;
}

export interface PartyAssetsQuery_party {
  __typename: 'Party';
  /**
   * Party identifier
   */
  id: string;
  delegations: PartyAssetsQuery_party_delegations[] | null;
  /**
   * The staking informations for this Party
   */
  stake: PartyAssetsQuery_party_stake;
  /**
   * Collateral accounts relating to a party
   */
  accounts: PartyAssetsQuery_party_accounts[] | null;
}

export interface PartyAssetsQuery {
  /**
   * An entity that is trading on the VEGA network
   */
  party: PartyAssetsQuery_party | null;
}

export interface PartyAssetsQueryVariables {
  partyId: string | undefined;
}
