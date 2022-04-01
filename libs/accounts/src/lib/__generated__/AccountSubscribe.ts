/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AccountType } from "./../../../../types/src/__generated__/globalTypes";

// ====================================================
// GraphQL subscription operation: AccountSubscribe
// ====================================================

export interface AccountSubscribe_accounts_market {
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

export interface AccountSubscribe_accounts_asset {
  __typename: "Asset";
  /**
   * The symbol of the asset (e.g: GBP)
   */
  symbol: string;
  /**
   * The precision of the asset
   */
  decimals: number;
}

export interface AccountSubscribe_accounts {
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
  market: AccountSubscribe_accounts_market | null;
  /**
   * Asset, the 'currency'
   */
  asset: AccountSubscribe_accounts_asset;
}

export interface AccountSubscribe {
  /**
   * Subscribe to the accounts updates
   */
  accounts: AccountSubscribe_accounts;
}

export interface AccountSubscribeVariables {
  partyId: string;
}
