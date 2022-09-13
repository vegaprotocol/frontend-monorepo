/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AccountType, LiquidityProvisionStatus } from "@vegaprotocol/types";

// ====================================================
// GraphQL query operation: MarketLiquidity
// ====================================================

export interface MarketLiquidity_market_liquidityProvisionsConnection_edges_node_party_accountsConnection_edges_node {
  __typename: "Account";
  /**
   * Account type (General, Margin, etc)
   */
  type: AccountType;
  /**
   * Balance as string - current account balance (approx. as balances can be updated several times per second)
   */
  balance: string;
}

export interface MarketLiquidity_market_liquidityProvisionsConnection_edges_node_party_accountsConnection_edges {
  __typename: "AccountEdge";
  /**
   * The account
   */
  node: MarketLiquidity_market_liquidityProvisionsConnection_edges_node_party_accountsConnection_edges_node;
}

export interface MarketLiquidity_market_liquidityProvisionsConnection_edges_node_party_accountsConnection {
  __typename: "AccountsConnection";
  /**
   * List of accounts available for the connection
   */
  edges: (MarketLiquidity_market_liquidityProvisionsConnection_edges_node_party_accountsConnection_edges | null)[] | null;
}

export interface MarketLiquidity_market_liquidityProvisionsConnection_edges_node_party {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
  /**
   * Collateral accounts relating to a party
   */
  accountsConnection: MarketLiquidity_market_liquidityProvisionsConnection_edges_node_party_accountsConnection;
}

export interface MarketLiquidity_market_liquidityProvisionsConnection_edges_node {
  __typename: "LiquidityProvision";
  /**
   * Unique identifier for the order (set by the system after consensus)
   */
  id: string | null;
  /**
   * The Id of the party making this commitment
   */
  party: MarketLiquidity_market_liquidityProvisionsConnection_edges_node_party;
  /**
   * When the liquidity provision was initially created (formatted RFC3339)
   */
  createdAt: string;
  /**
   * RFC3339Nano time of when the liquidity provision was updated
   */
  updatedAt: string | null;
  /**
   * Specified as a unit-less number that represents the amount of settlement asset of the market.
   */
  commitmentAmount: string;
  /**
   * Nominated liquidity fee factor, which is an input to the calculation of maker fees on the market, as per setting fees and rewarding liquidity providers.
   */
  fee: string;
  /**
   * The current status of this liquidity provision
   */
  status: LiquidityProvisionStatus;
}

export interface MarketLiquidity_market_liquidityProvisionsConnection_edges {
  __typename: "LiquidityProvisionsEdge";
  node: MarketLiquidity_market_liquidityProvisionsConnection_edges_node;
}

export interface MarketLiquidity_market_liquidityProvisionsConnection {
  __typename: "LiquidityProvisionsConnection";
  edges: (MarketLiquidity_market_liquidityProvisionsConnection_edges | null)[] | null;
}

export interface MarketLiquidity_market_tradableInstrument_instrument_product_settlementAsset {
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

export interface MarketLiquidity_market_tradableInstrument_instrument_product {
  __typename: "Future";
  /**
   * The name of the asset (string)
   */
  settlementAsset: MarketLiquidity_market_tradableInstrument_instrument_product_settlementAsset;
}

export interface MarketLiquidity_market_tradableInstrument_instrument {
  __typename: "Instrument";
  /**
   * A short non necessarily unique code used to easily describe the instrument (e.g: FX:BTCUSD/DEC18) (string)
   */
  code: string;
  /**
   * Full and fairly descriptive name for the instrument
   */
  name: string;
  /**
   * A reference to or instance of a fully specified product, including all required product parameters for that product (Product union)
   */
  product: MarketLiquidity_market_tradableInstrument_instrument_product;
}

export interface MarketLiquidity_market_tradableInstrument {
  __typename: "TradableInstrument";
  /**
   * An instance of, or reference to, a fully specified instrument.
   */
  instrument: MarketLiquidity_market_tradableInstrument_instrument;
}

export interface MarketLiquidity_market_data_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
}

export interface MarketLiquidity_market_data_liquidityProviderFeeShare_party {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
}

export interface MarketLiquidity_market_data_liquidityProviderFeeShare {
  __typename: "LiquidityProviderFeeShare";
  /**
   * The liquidity provider party ID
   */
  party: MarketLiquidity_market_data_liquidityProviderFeeShare_party;
  /**
   * The share owned by this liquidity provider (float)
   */
  equityLikeShare: string;
  /**
   * The average entry valuation of the liquidity provider for the market
   */
  averageEntryValuation: string;
}

export interface MarketLiquidity_market_data {
  __typename: "MarketData";
  /**
   * market ID of the associated mark price
   */
  market: MarketLiquidity_market_data_market;
  /**
   * the supplied stake for the market
   */
  suppliedStake: string | null;
  /**
   * the sum of the size of all positions greater than 0.
   */
  openInterest: string;
  /**
   * the amount of stake targeted for this market
   */
  targetStake: string | null;
  /**
   * the market value proxy
   */
  marketValueProxy: string;
  /**
   * the equity like share of liquidity fee for each liquidity provider
   */
  liquidityProviderFeeShare: MarketLiquidity_market_data_liquidityProviderFeeShare[] | null;
}

export interface MarketLiquidity_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
  /**
   * decimalPlaces indicates the number of decimal places that an integer must be shifted by in order to get a correct
   * number denominated in the currency of the market. (uint64)
   *
   * Examples:
   * Currency     Balance  decimalPlaces  Real Balance
   * GBP              100              0       GBP 100
   * GBP              100              2       GBP   1.00
   * GBP              100              4       GBP   0.01
   * GBP                1              4       GBP   0.0001   (  0.01p  )
   *
   * GBX (pence)      100              0       GBP   1.00     (100p     )
   * GBX (pence)      100              2       GBP   0.01     (  1p     )
   * GBX (pence)      100              4       GBP   0.0001   (  0.01p  )
   * GBX (pence)        1              4       GBP   0.000001 (  0.0001p)
   */
  decimalPlaces: number;
  /**
   * positionDecimalPlaces indicates the number of decimal places that an integer must be shifted in order to get a correct size (uint64).
   * i.e. 0 means there are no fractional orders for the market, and order sizes are always whole sizes.
   * 2 means sizes given as 10^2 * desired size, e.g. a desired size of 1.23 is represented as 123 in this market.
   * This sets how big the smallest order / position on the market can be.
   */
  positionDecimalPlaces: number;
  /**
   * The list of the liquidity provision commitments for this market
   */
  liquidityProvisionsConnection: MarketLiquidity_market_liquidityProvisionsConnection;
  /**
   * An instance of, or reference to, a tradable instrument.
   */
  tradableInstrument: MarketLiquidity_market_tradableInstrument;
  /**
   * marketData for the given market
   */
  data: MarketLiquidity_market_data | null;
}

export interface MarketLiquidity {
  /**
   * An instrument that is trading on the Vega network
   */
  market: MarketLiquidity_market | null;
}

export interface MarketLiquidityVariables {
  marketId: string;
  partyId?: string | null;
}
