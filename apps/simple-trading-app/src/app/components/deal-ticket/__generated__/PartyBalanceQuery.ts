/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: PartyBalanceQuery
// ====================================================

export interface PartyBalanceQuery_party_accounts_asset {
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
   * The full name of the asset (e.g: Great British Pound)
   */
  name: string;
  /**
   * The precision of the asset
   */
  decimals: number;
}

export interface PartyBalanceQuery_party_accounts {
  __typename: "Account";
  /**
   * Balance as string - current account balance (approx. as balances can be updated several times per second)
   */
  balance: string;
  /**
   * Asset, the 'currency'
   */
  asset: PartyBalanceQuery_party_accounts_asset;
}

export interface PartyBalanceQuery_party {
  __typename: "Party";
  /**
   * Collateral accounts relating to a party
   */
  accounts: PartyBalanceQuery_party_accounts[] | null;
}

export interface PartyBalanceQuery {
  /**
   * An entity that is trading on the VEGA network
   */
  party: PartyBalanceQuery_party | null;
}

export interface PartyBalanceQueryVariables {
  partyId: string;
}
