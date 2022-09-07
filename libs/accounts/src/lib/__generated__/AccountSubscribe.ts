/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AccountType } from "@vegaprotocol/types";

// ====================================================
// GraphQL subscription operation: AccountSubscribe
// ====================================================

export interface AccountSubscribe_accounts_market_tradableInstrument_instrument {
  __typename: "Instrument";
  /**
   * Full and fairly descriptive name for the instrument
   */
  name: string;
}

export interface AccountSubscribe_accounts_market_tradableInstrument {
  __typename: "TradableInstrument";
  /**
   * An instance of, or reference to, a fully specified instrument.
   */
  instrument: AccountSubscribe_accounts_market_tradableInstrument_instrument;
}

export interface AccountSubscribe_accounts_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
  /**
   * An instance of, or reference to, a tradable instrument.
   */
  tradableInstrument: AccountSubscribe_accounts_market_tradableInstrument;
}

export interface AccountSubscribe_accounts_asset {
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
