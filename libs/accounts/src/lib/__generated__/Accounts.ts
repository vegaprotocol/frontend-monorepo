/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AccountType } from "@vegaprotocol/types";

// ====================================================
// GraphQL query operation: Accounts
// ====================================================

export interface Accounts_party_accounts_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
  /**
   * Market full name
   */
  name: string;
}

export interface Accounts_party_accounts_asset {
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

export interface Accounts_party_accounts {
  __typename: "Account";
  /**
   * Account type (General, Margin, etc)
   */
  type: AccountType;
  /**
   * Balance as string - current account balance (approx. as balances can be updated several times per second)
   */
  balance: string;
  /**
   * Market (only relevant to margin accounts)
   */
  market: Accounts_party_accounts_market | null;
  /**
   * Asset, the 'currency'
   */
  asset: Accounts_party_accounts_asset;
}

export interface Accounts_party {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
  /**
   * Collateral accounts relating to a party
   */
  accounts: Accounts_party_accounts[] | null;
}

export interface Accounts {
  /**
   * An entity that is trading on the VEGA network
   */
  party: Accounts_party | null;
}

export interface AccountsVariables {
  partyId: string;
}
