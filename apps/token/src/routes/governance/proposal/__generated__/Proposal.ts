/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ProposalState, ProposalRejectionReason, ConditionOperator, PropertyKeyType, VoteValue } from "@vegaprotocol/types";

// ====================================================
// GraphQL query operation: Proposal
// ====================================================

export interface Proposal_proposal_rationale {
  __typename: "ProposalRationale";
  /**
   * Title to be used to give a short description of the proposal in lists.
   * This is to be between 0 and 100 unicode characters.
   * This is mandatory for all proposals.
   */
  title: string;
  /**
   * Description to show a short title / something in case the link goes offline.
   * This is to be between 0 and 20k unicode characters.
   * This is mandatory for all proposals.
   */
  description: string;
}

export interface Proposal_proposal_party {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
}

export interface Proposal_proposal_terms_change_NewFreeform {
  __typename: "NewFreeform";
}

export interface Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_settlementAsset {
  __typename: "Asset";
  /**
   * The ID of the asset
   */
  id: string;
  /**
   * The full name of the asset (e.g: Great British Pound)
   */
  name: string;
  /**
   * The symbol of the asset (e.g: GBP)
   */
  symbol: string;
  /**
   * The precision of the asset. Should match the decimal precision of the asset on its native chain, e.g: for ERC20 assets, it is often 18
   */
  decimals: number;
  /**
   * The minimum economically meaningful amount in the asset
   */
  quantum: string;
}

export interface Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForSettlementData_sourceType_DataSourceDefinitionInternal_sourceType_conditions {
  __typename: "Condition";
  /**
   * The type of comparison to make on the value.
   */
  operator: ConditionOperator;
  /**
   * The value to compare against.
   */
  value: string | null;
}

export interface Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForSettlementData_sourceType_DataSourceDefinitionInternal_sourceType {
  __typename: "DataSourceSpecConfigurationTime";
  conditions: (Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForSettlementData_sourceType_DataSourceDefinitionInternal_sourceType_conditions | null)[];
}

export interface Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForSettlementData_sourceType_DataSourceDefinitionInternal {
  __typename: "DataSourceDefinitionInternal";
  sourceType: Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForSettlementData_sourceType_DataSourceDefinitionInternal_sourceType;
}

export interface Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForSettlementData_sourceType_DataSourceDefinitionExternal_sourceType_signers_signer_PubKey {
  __typename: "PubKey";
  key: string | null;
}

export interface Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForSettlementData_sourceType_DataSourceDefinitionExternal_sourceType_signers_signer_ETHAddress {
  __typename: "ETHAddress";
  address: string | null;
}

export type Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForSettlementData_sourceType_DataSourceDefinitionExternal_sourceType_signers_signer = Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForSettlementData_sourceType_DataSourceDefinitionExternal_sourceType_signers_signer_PubKey | Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForSettlementData_sourceType_DataSourceDefinitionExternal_sourceType_signers_signer_ETHAddress;

export interface Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForSettlementData_sourceType_DataSourceDefinitionExternal_sourceType_signers {
  __typename: "Signer";
  signer: Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForSettlementData_sourceType_DataSourceDefinitionExternal_sourceType_signers_signer;
}

export interface Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForSettlementData_sourceType_DataSourceDefinitionExternal_sourceType_filters_key {
  __typename: "PropertyKey";
  /**
   * The name of the property.
   */
  name: string | null;
  /**
   * The type of the property.
   */
  type: PropertyKeyType;
}

export interface Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForSettlementData_sourceType_DataSourceDefinitionExternal_sourceType_filters_conditions {
  __typename: "Condition";
  /**
   * The type of comparison to make on the value.
   */
  operator: ConditionOperator;
  /**
   * The value to compare against.
   */
  value: string | null;
}

export interface Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForSettlementData_sourceType_DataSourceDefinitionExternal_sourceType_filters {
  __typename: "Filter";
  /**
   * key is the data source data property key targeted by the filter.
   */
  key: Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForSettlementData_sourceType_DataSourceDefinitionExternal_sourceType_filters_key;
  /**
   * The conditions that should be matched by the data to be
   * considered of interest.
   */
  conditions: Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForSettlementData_sourceType_DataSourceDefinitionExternal_sourceType_filters_conditions[] | null;
}

export interface Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForSettlementData_sourceType_DataSourceDefinitionExternal_sourceType {
  __typename: "DataSourceSpecConfiguration";
  /**
   * signers is the list of authorized signatures that signed the data for this
   * data source. All the public keys in the data should be contained in this
   * list.
   */
  signers: Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForSettlementData_sourceType_DataSourceDefinitionExternal_sourceType_signers[] | null;
  /**
   * filters describes which source data are considered of interest or not for
   * the product (or the risk model).
   */
  filters: Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForSettlementData_sourceType_DataSourceDefinitionExternal_sourceType_filters[] | null;
}

export interface Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForSettlementData_sourceType_DataSourceDefinitionExternal {
  __typename: "DataSourceDefinitionExternal";
  sourceType: Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForSettlementData_sourceType_DataSourceDefinitionExternal_sourceType;
}

export type Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForSettlementData_sourceType = Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForSettlementData_sourceType_DataSourceDefinitionInternal | Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForSettlementData_sourceType_DataSourceDefinitionExternal;

export interface Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForSettlementData {
  __typename: "DataSourceDefinition";
  sourceType: Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForSettlementData_sourceType;
}

export interface Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForTradingTermination_sourceType_DataSourceDefinitionInternal_sourceType_conditions {
  __typename: "Condition";
  /**
   * The type of comparison to make on the value.
   */
  operator: ConditionOperator;
  /**
   * The value to compare against.
   */
  value: string | null;
}

export interface Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForTradingTermination_sourceType_DataSourceDefinitionInternal_sourceType {
  __typename: "DataSourceSpecConfigurationTime";
  conditions: (Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForTradingTermination_sourceType_DataSourceDefinitionInternal_sourceType_conditions | null)[];
}

export interface Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForTradingTermination_sourceType_DataSourceDefinitionInternal {
  __typename: "DataSourceDefinitionInternal";
  sourceType: Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForTradingTermination_sourceType_DataSourceDefinitionInternal_sourceType;
}

export interface Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForTradingTermination_sourceType_DataSourceDefinitionExternal_sourceType_signers_signer_PubKey {
  __typename: "PubKey";
  key: string | null;
}

export interface Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForTradingTermination_sourceType_DataSourceDefinitionExternal_sourceType_signers_signer_ETHAddress {
  __typename: "ETHAddress";
  address: string | null;
}

export type Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForTradingTermination_sourceType_DataSourceDefinitionExternal_sourceType_signers_signer = Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForTradingTermination_sourceType_DataSourceDefinitionExternal_sourceType_signers_signer_PubKey | Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForTradingTermination_sourceType_DataSourceDefinitionExternal_sourceType_signers_signer_ETHAddress;

export interface Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForTradingTermination_sourceType_DataSourceDefinitionExternal_sourceType_signers {
  __typename: "Signer";
  signer: Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForTradingTermination_sourceType_DataSourceDefinitionExternal_sourceType_signers_signer;
}

export interface Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForTradingTermination_sourceType_DataSourceDefinitionExternal_sourceType_filters_key {
  __typename: "PropertyKey";
  /**
   * The name of the property.
   */
  name: string | null;
  /**
   * The type of the property.
   */
  type: PropertyKeyType;
}

export interface Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForTradingTermination_sourceType_DataSourceDefinitionExternal_sourceType_filters_conditions {
  __typename: "Condition";
  /**
   * The type of comparison to make on the value.
   */
  operator: ConditionOperator;
  /**
   * The value to compare against.
   */
  value: string | null;
}

export interface Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForTradingTermination_sourceType_DataSourceDefinitionExternal_sourceType_filters {
  __typename: "Filter";
  /**
   * key is the data source data property key targeted by the filter.
   */
  key: Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForTradingTermination_sourceType_DataSourceDefinitionExternal_sourceType_filters_key;
  /**
   * The conditions that should be matched by the data to be
   * considered of interest.
   */
  conditions: Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForTradingTermination_sourceType_DataSourceDefinitionExternal_sourceType_filters_conditions[] | null;
}

export interface Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForTradingTermination_sourceType_DataSourceDefinitionExternal_sourceType {
  __typename: "DataSourceSpecConfiguration";
  /**
   * signers is the list of authorized signatures that signed the data for this
   * data source. All the public keys in the data should be contained in this
   * list.
   */
  signers: Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForTradingTermination_sourceType_DataSourceDefinitionExternal_sourceType_signers[] | null;
  /**
   * filters describes which source data are considered of interest or not for
   * the product (or the risk model).
   */
  filters: Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForTradingTermination_sourceType_DataSourceDefinitionExternal_sourceType_filters[] | null;
}

export interface Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForTradingTermination_sourceType_DataSourceDefinitionExternal {
  __typename: "DataSourceDefinitionExternal";
  sourceType: Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForTradingTermination_sourceType_DataSourceDefinitionExternal_sourceType;
}

export type Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForTradingTermination_sourceType = Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForTradingTermination_sourceType_DataSourceDefinitionInternal | Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForTradingTermination_sourceType_DataSourceDefinitionExternal;

export interface Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForTradingTermination {
  __typename: "DataSourceDefinition";
  sourceType: Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForTradingTermination_sourceType;
}

export interface Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecBinding {
  __typename: "DataSourceSpecToFutureBinding";
  settlementDataProperty: string;
  tradingTerminationProperty: string;
}

export interface Proposal_proposal_terms_change_NewMarket_instrument_futureProduct {
  __typename: "FutureProduct";
  /**
   * Product asset
   */
  settlementAsset: Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_settlementAsset;
  /**
   * String representing the quote (e.g. BTCUSD -> USD is quote)
   */
  quoteName: string;
  /**
   * The number of decimal places implied by the settlement data (such as price) emitted by the settlement oracle
   */
  settlementDataDecimals: number;
  /**
   * Describes the data source data that an instrument wants to get from the data source engine for settlement data.
   */
  dataSourceSpecForSettlementData: Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForSettlementData;
  /**
   * Describes the source data that an instrument wants to get from the data source engine for trading termination.
   */
  dataSourceSpecForTradingTermination: Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecForTradingTermination;
  /**
   * DataSourceSpecToFutureBinding tells on which property source data should be
   * used as settlement data.
   */
  dataSourceSpecBinding: Proposal_proposal_terms_change_NewMarket_instrument_futureProduct_dataSourceSpecBinding;
}

export interface Proposal_proposal_terms_change_NewMarket_instrument {
  __typename: "InstrumentConfiguration";
  /**
   * Full and fairly descriptive name for the instrument
   */
  name: string;
  /**
   * A short non necessarily unique code used to easily describe the instrument (e.g: FX:BTCUSD/DEC18)
   */
  code: string;
  /**
   * Future product specification
   */
  futureProduct: Proposal_proposal_terms_change_NewMarket_instrument_futureProduct | null;
}

export interface Proposal_proposal_terms_change_NewMarket {
  __typename: "NewMarket";
  /**
   * Decimal places used for the new market, sets the smallest price increment on the book
   */
  decimalPlaces: number;
  /**
   * Metadata for this instrument, tags
   */
  metadata: string[] | null;
  /**
   * New market instrument configuration
   */
  instrument: Proposal_proposal_terms_change_NewMarket_instrument;
}

export interface Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForSettlementData_sourceType_DataSourceDefinitionInternal_sourceType_conditions {
  __typename: "Condition";
  /**
   * The type of comparison to make on the value.
   */
  operator: ConditionOperator;
  /**
   * The value to compare against.
   */
  value: string | null;
}

export interface Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForSettlementData_sourceType_DataSourceDefinitionInternal_sourceType {
  __typename: "DataSourceSpecConfigurationTime";
  conditions: (Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForSettlementData_sourceType_DataSourceDefinitionInternal_sourceType_conditions | null)[];
}

export interface Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForSettlementData_sourceType_DataSourceDefinitionInternal {
  __typename: "DataSourceDefinitionInternal";
  sourceType: Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForSettlementData_sourceType_DataSourceDefinitionInternal_sourceType;
}

export interface Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForSettlementData_sourceType_DataSourceDefinitionExternal_sourceType_signers_signer_PubKey {
  __typename: "PubKey";
  key: string | null;
}

export interface Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForSettlementData_sourceType_DataSourceDefinitionExternal_sourceType_signers_signer_ETHAddress {
  __typename: "ETHAddress";
  address: string | null;
}

export type Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForSettlementData_sourceType_DataSourceDefinitionExternal_sourceType_signers_signer = Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForSettlementData_sourceType_DataSourceDefinitionExternal_sourceType_signers_signer_PubKey | Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForSettlementData_sourceType_DataSourceDefinitionExternal_sourceType_signers_signer_ETHAddress;

export interface Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForSettlementData_sourceType_DataSourceDefinitionExternal_sourceType_signers {
  __typename: "Signer";
  signer: Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForSettlementData_sourceType_DataSourceDefinitionExternal_sourceType_signers_signer;
}

export interface Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForSettlementData_sourceType_DataSourceDefinitionExternal_sourceType_filters_key {
  __typename: "PropertyKey";
  /**
   * The name of the property.
   */
  name: string | null;
  /**
   * The type of the property.
   */
  type: PropertyKeyType;
}

export interface Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForSettlementData_sourceType_DataSourceDefinitionExternal_sourceType_filters_conditions {
  __typename: "Condition";
  /**
   * The type of comparison to make on the value.
   */
  operator: ConditionOperator;
  /**
   * The value to compare against.
   */
  value: string | null;
}

export interface Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForSettlementData_sourceType_DataSourceDefinitionExternal_sourceType_filters {
  __typename: "Filter";
  /**
   * key is the data source data property key targeted by the filter.
   */
  key: Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForSettlementData_sourceType_DataSourceDefinitionExternal_sourceType_filters_key;
  /**
   * The conditions that should be matched by the data to be
   * considered of interest.
   */
  conditions: Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForSettlementData_sourceType_DataSourceDefinitionExternal_sourceType_filters_conditions[] | null;
}

export interface Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForSettlementData_sourceType_DataSourceDefinitionExternal_sourceType {
  __typename: "DataSourceSpecConfiguration";
  /**
   * signers is the list of authorized signatures that signed the data for this
   * data source. All the public keys in the data should be contained in this
   * list.
   */
  signers: Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForSettlementData_sourceType_DataSourceDefinitionExternal_sourceType_signers[] | null;
  /**
   * filters describes which source data are considered of interest or not for
   * the product (or the risk model).
   */
  filters: Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForSettlementData_sourceType_DataSourceDefinitionExternal_sourceType_filters[] | null;
}

export interface Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForSettlementData_sourceType_DataSourceDefinitionExternal {
  __typename: "DataSourceDefinitionExternal";
  sourceType: Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForSettlementData_sourceType_DataSourceDefinitionExternal_sourceType;
}

export type Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForSettlementData_sourceType = Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForSettlementData_sourceType_DataSourceDefinitionInternal | Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForSettlementData_sourceType_DataSourceDefinitionExternal;

export interface Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForSettlementData {
  __typename: "DataSourceDefinition";
  sourceType: Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForSettlementData_sourceType;
}

export interface Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForTradingTermination_sourceType_DataSourceDefinitionInternal_sourceType_conditions {
  __typename: "Condition";
  /**
   * The type of comparison to make on the value.
   */
  operator: ConditionOperator;
  /**
   * The value to compare against.
   */
  value: string | null;
}

export interface Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForTradingTermination_sourceType_DataSourceDefinitionInternal_sourceType {
  __typename: "DataSourceSpecConfigurationTime";
  conditions: (Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForTradingTermination_sourceType_DataSourceDefinitionInternal_sourceType_conditions | null)[];
}

export interface Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForTradingTermination_sourceType_DataSourceDefinitionInternal {
  __typename: "DataSourceDefinitionInternal";
  sourceType: Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForTradingTermination_sourceType_DataSourceDefinitionInternal_sourceType;
}

export interface Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForTradingTermination_sourceType_DataSourceDefinitionExternal_sourceType_signers_signer_PubKey {
  __typename: "PubKey";
  key: string | null;
}

export interface Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForTradingTermination_sourceType_DataSourceDefinitionExternal_sourceType_signers_signer_ETHAddress {
  __typename: "ETHAddress";
  address: string | null;
}

export type Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForTradingTermination_sourceType_DataSourceDefinitionExternal_sourceType_signers_signer = Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForTradingTermination_sourceType_DataSourceDefinitionExternal_sourceType_signers_signer_PubKey | Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForTradingTermination_sourceType_DataSourceDefinitionExternal_sourceType_signers_signer_ETHAddress;

export interface Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForTradingTermination_sourceType_DataSourceDefinitionExternal_sourceType_signers {
  __typename: "Signer";
  signer: Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForTradingTermination_sourceType_DataSourceDefinitionExternal_sourceType_signers_signer;
}

export interface Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForTradingTermination_sourceType_DataSourceDefinitionExternal_sourceType_filters_key {
  __typename: "PropertyKey";
  /**
   * The name of the property.
   */
  name: string | null;
  /**
   * The type of the property.
   */
  type: PropertyKeyType;
}

export interface Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForTradingTermination_sourceType_DataSourceDefinitionExternal_sourceType_filters_conditions {
  __typename: "Condition";
  /**
   * The type of comparison to make on the value.
   */
  operator: ConditionOperator;
  /**
   * The value to compare against.
   */
  value: string | null;
}

export interface Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForTradingTermination_sourceType_DataSourceDefinitionExternal_sourceType_filters {
  __typename: "Filter";
  /**
   * key is the data source data property key targeted by the filter.
   */
  key: Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForTradingTermination_sourceType_DataSourceDefinitionExternal_sourceType_filters_key;
  /**
   * The conditions that should be matched by the data to be
   * considered of interest.
   */
  conditions: Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForTradingTermination_sourceType_DataSourceDefinitionExternal_sourceType_filters_conditions[] | null;
}

export interface Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForTradingTermination_sourceType_DataSourceDefinitionExternal_sourceType {
  __typename: "DataSourceSpecConfiguration";
  /**
   * signers is the list of authorized signatures that signed the data for this
   * data source. All the public keys in the data should be contained in this
   * list.
   */
  signers: Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForTradingTermination_sourceType_DataSourceDefinitionExternal_sourceType_signers[] | null;
  /**
   * filters describes which source data are considered of interest or not for
   * the product (or the risk model).
   */
  filters: Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForTradingTermination_sourceType_DataSourceDefinitionExternal_sourceType_filters[] | null;
}

export interface Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForTradingTermination_sourceType_DataSourceDefinitionExternal {
  __typename: "DataSourceDefinitionExternal";
  sourceType: Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForTradingTermination_sourceType_DataSourceDefinitionExternal_sourceType;
}

export type Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForTradingTermination_sourceType = Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForTradingTermination_sourceType_DataSourceDefinitionInternal | Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForTradingTermination_sourceType_DataSourceDefinitionExternal;

export interface Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForTradingTermination {
  __typename: "DataSourceDefinition";
  sourceType: Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForTradingTermination_sourceType;
}

export interface Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecBinding {
  __typename: "DataSourceSpecToFutureBinding";
  settlementDataProperty: string;
  tradingTerminationProperty: string;
}

export interface Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product {
  __typename: "UpdateFutureProduct";
  quoteName: string;
  dataSourceSpecForSettlementData: Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForSettlementData;
  dataSourceSpecForTradingTermination: Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecForTradingTermination;
  dataSourceSpecBinding: Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product_dataSourceSpecBinding;
}

export interface Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument {
  __typename: "UpdateInstrumentConfiguration";
  code: string;
  product: Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument_product;
}

export interface Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_priceMonitoringParameters_triggers {
  __typename: "PriceMonitoringTrigger";
  /**
   * Price monitoring projection horizon τ in seconds (> 0).
   */
  horizonSecs: number;
  /**
   * Price monitoring probability level p. (>0 and < 1)
   */
  probability: number;
  /**
   * Price monitoring auction extension duration in seconds should the price
   * breach its theoretical level over the specified horizon at the specified
   * probability level (> 0)
   */
  auctionExtensionSecs: number;
}

export interface Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_priceMonitoringParameters {
  __typename: "PriceMonitoringParameters";
  /**
   * The list of triggers for this price monitoring
   */
  triggers: Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_priceMonitoringParameters_triggers[] | null;
}

export interface Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_liquidityMonitoringParameters_targetStakeParameters {
  __typename: "TargetStakeParameters";
  /**
   * Specifies length of time window expressed in seconds for target stake calculation
   */
  timeWindow: number;
  /**
   * Specifies scaling factors used in target stake calculation
   */
  scalingFactor: number;
}

export interface Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_liquidityMonitoringParameters {
  __typename: "LiquidityMonitoringParameters";
  /**
   * Specifies the triggering ratio for entering liquidity auction
   */
  triggeringRatio: number;
  /**
   * Specifies parameters related to target stake calculation
   */
  targetStakeParameters: Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_liquidityMonitoringParameters_targetStakeParameters;
}

export interface Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_riskParameters_UpdateMarketSimpleRiskModel_simple {
  __typename: "SimpleRiskModelParams";
  /**
   * Risk factor for long
   */
  factorLong: number;
  /**
   * Risk factor for short
   */
  factorShort: number;
}

export interface Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_riskParameters_UpdateMarketSimpleRiskModel {
  __typename: "UpdateMarketSimpleRiskModel";
  simple: Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_riskParameters_UpdateMarketSimpleRiskModel_simple | null;
}

export interface Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_riskParameters_UpdateMarketLogNormalRiskModel_logNormal_params {
  __typename: "LogNormalModelParams";
  /**
   * R parameter
   */
  r: number;
  /**
   * Sigma parameter, annualised volatility of the underlying asset, must be a strictly non-negative real number
   */
  sigma: number;
  /**
   * Mu parameter, annualised growth rate of the underlying asset
   */
  mu: number;
}

export interface Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_riskParameters_UpdateMarketLogNormalRiskModel_logNormal {
  __typename: "LogNormalRiskModel";
  /**
   * Lambda parameter of the risk model, probability confidence level used in expected shortfall calculation when obtaining the maintenance margin level, must be strictly greater than 0 and strictly smaller than 1
   */
  riskAversionParameter: number;
  /**
   * Tau parameter of the risk model, projection horizon measured as a year fraction used in the expected shortfall calculation to obtain the maintenance margin, must be a strictly non-negative real number
   */
  tau: number;
  /**
   * Parameters for the log normal risk model
   */
  params: Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_riskParameters_UpdateMarketLogNormalRiskModel_logNormal_params;
}

export interface Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_riskParameters_UpdateMarketLogNormalRiskModel {
  __typename: "UpdateMarketLogNormalRiskModel";
  logNormal: Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_riskParameters_UpdateMarketLogNormalRiskModel_logNormal | null;
}

export type Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_riskParameters = Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_riskParameters_UpdateMarketSimpleRiskModel | Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_riskParameters_UpdateMarketLogNormalRiskModel;

export interface Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration {
  __typename: "UpdateMarketConfiguration";
  instrument: Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_instrument;
  metadata: (string | null)[] | null;
  priceMonitoringParameters: Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_priceMonitoringParameters;
  liquidityMonitoringParameters: Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_liquidityMonitoringParameters;
  riskParameters: Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration_riskParameters;
}

export interface Proposal_proposal_terms_change_UpdateMarket {
  __typename: "UpdateMarket";
  marketId: string;
  updateMarketConfiguration: Proposal_proposal_terms_change_UpdateMarket_updateMarketConfiguration;
}

export interface Proposal_proposal_terms_change_NewAsset_source_BuiltinAsset {
  __typename: "BuiltinAsset";
  /**
   * Maximum amount that can be requested by a party through the built-in asset faucet at a time
   */
  maxFaucetAmountMint: string;
}

export interface Proposal_proposal_terms_change_NewAsset_source_ERC20 {
  __typename: "ERC20";
  /**
   * The address of the ERC20 contract
   */
  contractAddress: string;
  /**
   * The lifetime limits deposit per address
   * Note: this is a temporary measure that can be changed by governance
   */
  lifetimeLimit: string;
  /**
   * The maximum you can withdraw instantly. All withdrawals over the threshold will be delayed by the withdrawal delay.
   * There’s no limit on the size of a withdrawal
   * Note: this is a temporary measure that can be changed by governance
   */
  withdrawThreshold: string;
}

export type Proposal_proposal_terms_change_NewAsset_source = Proposal_proposal_terms_change_NewAsset_source_BuiltinAsset | Proposal_proposal_terms_change_NewAsset_source_ERC20;

export interface Proposal_proposal_terms_change_NewAsset {
  __typename: "NewAsset";
  /**
   * The full name of the asset (e.g: Great British Pound)
   */
  name: string;
  /**
   * The symbol of the asset (e.g: GBP)
   */
  symbol: string;
  /**
   * The precision of the asset
   */
  decimals: number;
  /**
   * The minimum economically meaningful amount of this specific asset
   */
  quantum: string;
  /**
   * The source of the new asset
   */
  source: Proposal_proposal_terms_change_NewAsset_source;
}

export interface Proposal_proposal_terms_change_UpdateNetworkParameter_networkParameter {
  __typename: "NetworkParameter";
  /**
   * The name of the network parameter
   */
  key: string;
  /**
   * The value of the network parameter
   */
  value: string;
}

export interface Proposal_proposal_terms_change_UpdateNetworkParameter {
  __typename: "UpdateNetworkParameter";
  networkParameter: Proposal_proposal_terms_change_UpdateNetworkParameter_networkParameter;
}

export interface Proposal_proposal_terms_change_UpdateAsset_source {
  __typename: "UpdateERC20";
  /**
   * The lifetime limits deposit per address
   * Note: this is a temporary measure that can be changed by governance
   */
  lifetimeLimit: string;
  /**
   * The maximum you can withdraw instantly. All withdrawals over the threshold will be delayed by the withdrawal delay.
   * There’s no limit on the size of a withdrawal
   * Note: this is a temporary measure that can be changed by governance
   */
  withdrawThreshold: string;
}

export interface Proposal_proposal_terms_change_UpdateAsset {
  __typename: "UpdateAsset";
  /**
   * The minimum economically meaningful amount of this specific asset
   */
  quantum: string;
  /**
   * The asset to update
   */
  assetId: string;
  /**
   * The source of the updated asset
   */
  source: Proposal_proposal_terms_change_UpdateAsset_source;
}

export type Proposal_proposal_terms_change = Proposal_proposal_terms_change_NewFreeform | Proposal_proposal_terms_change_NewMarket | Proposal_proposal_terms_change_UpdateMarket | Proposal_proposal_terms_change_NewAsset | Proposal_proposal_terms_change_UpdateNetworkParameter | Proposal_proposal_terms_change_UpdateAsset;

export interface Proposal_proposal_terms {
  __typename: "ProposalTerms";
  /**
   * RFC3339Nano time and date when voting closes for this proposal.
   * Constrained by "minClose" and "maxClose" network parameters.
   */
  closingDatetime: string;
  /**
   * RFC3339Nano time and date when this proposal is executed (if passed). Note that it has to be after closing date time.
   * Constrained by "minEnactInSeconds" and "maxEnactInSeconds" network parameters.
   * Note: Optional as free form proposals do not require it.
   */
  enactmentDatetime: string | null;
  /**
   * Actual change being introduced by the proposal - action the proposal triggers if passed and enacted.
   */
  change: Proposal_proposal_terms_change;
}

export interface Proposal_proposal_votes_yes_votes_party_stakingSummary {
  __typename: "StakingSummary";
  /**
   * The stake currently available for the party
   */
  currentStakeAvailable: string;
}

export interface Proposal_proposal_votes_yes_votes_party {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
  /**
   * The staking information for this Party
   */
  stakingSummary: Proposal_proposal_votes_yes_votes_party_stakingSummary;
}

export interface Proposal_proposal_votes_yes_votes {
  __typename: "Vote";
  /**
   * The vote value cast
   */
  value: VoteValue;
  /**
   * The party casting the vote
   */
  party: Proposal_proposal_votes_yes_votes_party;
  /**
   * RFC3339Nano time and date when the vote reached Vega network
   */
  datetime: string;
}

export interface Proposal_proposal_votes_yes {
  __typename: "ProposalVoteSide";
  /**
   * Total number of governance tokens from the votes cast for this side
   */
  totalTokens: string;
  /**
   * Total number of votes cast for this side
   */
  totalNumber: string;
  /**
   * Total equity like share weight for this side (only for UpdateMarket Proposals)
   */
  totalEquityLikeShareWeight: string;
  /**
   * All votes cast for this side
   */
  votes: Proposal_proposal_votes_yes_votes[] | null;
}

export interface Proposal_proposal_votes_no_votes_party_stakingSummary {
  __typename: "StakingSummary";
  /**
   * The stake currently available for the party
   */
  currentStakeAvailable: string;
}

export interface Proposal_proposal_votes_no_votes_party {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
  /**
   * The staking information for this Party
   */
  stakingSummary: Proposal_proposal_votes_no_votes_party_stakingSummary;
}

export interface Proposal_proposal_votes_no_votes {
  __typename: "Vote";
  /**
   * The vote value cast
   */
  value: VoteValue;
  /**
   * The party casting the vote
   */
  party: Proposal_proposal_votes_no_votes_party;
  /**
   * RFC3339Nano time and date when the vote reached Vega network
   */
  datetime: string;
}

export interface Proposal_proposal_votes_no {
  __typename: "ProposalVoteSide";
  /**
   * Total number of governance tokens from the votes cast for this side
   */
  totalTokens: string;
  /**
   * Total number of votes cast for this side
   */
  totalNumber: string;
  /**
   * Total equity like share weight for this side (only for UpdateMarket Proposals)
   */
  totalEquityLikeShareWeight: string;
  /**
   * All votes cast for this side
   */
  votes: Proposal_proposal_votes_no_votes[] | null;
}

export interface Proposal_proposal_votes {
  __typename: "ProposalVotes";
  /**
   * Yes votes cast for this proposal
   */
  yes: Proposal_proposal_votes_yes;
  /**
   * No votes cast for this proposal
   */
  no: Proposal_proposal_votes_no;
}

export interface Proposal_proposal {
  __typename: "Proposal";
  /**
   * Proposal ID that is filled by Vega once proposal reaches the network
   */
  id: string | null;
  /**
   * Rationale behind the proposal
   */
  rationale: Proposal_proposal_rationale;
  /**
   * A UUID reference to aid tracking proposals on Vega
   */
  reference: string;
  /**
   * State of the proposal
   */
  state: ProposalState;
  /**
   * RFC3339Nano time and date when the proposal reached Vega network
   */
  datetime: string;
  /**
   * Why the proposal was rejected by the core
   */
  rejectionReason: ProposalRejectionReason | null;
  /**
   * Party that prepared the proposal
   */
  party: Proposal_proposal_party;
  /**
   * Error details of the rejectionReason
   */
  errorDetails: string | null;
  /**
   * Terms of the proposal
   */
  terms: Proposal_proposal_terms;
  /**
   * Votes cast for this proposal
   */
  votes: Proposal_proposal_votes;
}

export interface Proposal {
  /**
   * A governance proposal located by either its ID or reference. If both are set, ID is used.
   */
  proposal: Proposal_proposal | null;
}

export interface ProposalVariables {
  proposalId: string;
}
