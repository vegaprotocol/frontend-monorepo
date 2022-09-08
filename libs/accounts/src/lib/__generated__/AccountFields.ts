/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AccountType } from "./../../../../types/src/__generated__/globalTypes";

// ====================================================
// GraphQL fragment: AccountFields
// ====================================================

export interface AccountFields_market_tradableInstrument_instrument {
  __typename: "Instrument";
  /**
   * Full and fairly descriptive name for the instrument
   */
  name: string;
}

export interface AccountFields_market_tradableInstrument {
  __typename: "TradableInstrument";
  /**
   * An instance of or reference to a fully specified instrument.
   */
  instrument: AccountFields_market_tradableInstrument_instrument;
}

export interface AccountFields_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
  /**
   * An instance of or reference to a tradable instrument.
   */
  tradableInstrument: AccountFields_market_tradableInstrument;
}

export interface AccountFields_asset {
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

export interface AccountFields {
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
  market: AccountFields_market | null;
  /**
   * Asset, the 'currency'
   */
  asset: AccountFields_asset;
}
