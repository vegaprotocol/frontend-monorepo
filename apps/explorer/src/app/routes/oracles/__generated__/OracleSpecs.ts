/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DataSourceSpecStatus, ConditionOperator, PropertyKeyType } from "@vegaprotocol/types";

// ====================================================
// GraphQL query operation: OracleSpecs
// ====================================================

export interface OracleSpecs_oracleSpecs_dataSourceSpec_spec_data_sourceType_DataSourceDefinitionInternal_sourceType_conditions {
  __typename: "Condition";
  /**
   * The value to compare against.
   */
  value: string | null;
  /**
   * The type of comparison to make on the value.
   */
  operator: ConditionOperator;
}

export interface OracleSpecs_oracleSpecs_dataSourceSpec_spec_data_sourceType_DataSourceDefinitionInternal_sourceType {
  __typename: "DataSourceSpecConfigurationTime";
  conditions: (OracleSpecs_oracleSpecs_dataSourceSpec_spec_data_sourceType_DataSourceDefinitionInternal_sourceType_conditions | null)[];
}

export interface OracleSpecs_oracleSpecs_dataSourceSpec_spec_data_sourceType_DataSourceDefinitionInternal {
  __typename: "DataSourceDefinitionInternal";
  sourceType: OracleSpecs_oracleSpecs_dataSourceSpec_spec_data_sourceType_DataSourceDefinitionInternal_sourceType;
}

export interface OracleSpecs_oracleSpecs_dataSourceSpec_spec_data_sourceType_DataSourceDefinitionExternal_sourceType_signers_signer_ETHAddress {
  __typename: "ETHAddress";
  address: string | null;
}

export interface OracleSpecs_oracleSpecs_dataSourceSpec_spec_data_sourceType_DataSourceDefinitionExternal_sourceType_signers_signer_PubKey {
  __typename: "PubKey";
  key: string | null;
}

export type OracleSpecs_oracleSpecs_dataSourceSpec_spec_data_sourceType_DataSourceDefinitionExternal_sourceType_signers_signer = OracleSpecs_oracleSpecs_dataSourceSpec_spec_data_sourceType_DataSourceDefinitionExternal_sourceType_signers_signer_ETHAddress | OracleSpecs_oracleSpecs_dataSourceSpec_spec_data_sourceType_DataSourceDefinitionExternal_sourceType_signers_signer_PubKey;

export interface OracleSpecs_oracleSpecs_dataSourceSpec_spec_data_sourceType_DataSourceDefinitionExternal_sourceType_signers {
  __typename: "Signer";
  signer: OracleSpecs_oracleSpecs_dataSourceSpec_spec_data_sourceType_DataSourceDefinitionExternal_sourceType_signers_signer;
}

export interface OracleSpecs_oracleSpecs_dataSourceSpec_spec_data_sourceType_DataSourceDefinitionExternal_sourceType_filters_key {
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

export interface OracleSpecs_oracleSpecs_dataSourceSpec_spec_data_sourceType_DataSourceDefinitionExternal_sourceType_filters_conditions {
  __typename: "Condition";
  /**
   * The value to compare against.
   */
  value: string | null;
  /**
   * The type of comparison to make on the value.
   */
  operator: ConditionOperator;
}

export interface OracleSpecs_oracleSpecs_dataSourceSpec_spec_data_sourceType_DataSourceDefinitionExternal_sourceType_filters {
  __typename: "Filter";
  /**
   * key is the data source data property key targeted by the filter.
   */
  key: OracleSpecs_oracleSpecs_dataSourceSpec_spec_data_sourceType_DataSourceDefinitionExternal_sourceType_filters_key;
  /**
   * The conditions that should be matched by the data to be
   * considered of interest.
   */
  conditions: OracleSpecs_oracleSpecs_dataSourceSpec_spec_data_sourceType_DataSourceDefinitionExternal_sourceType_filters_conditions[] | null;
}

export interface OracleSpecs_oracleSpecs_dataSourceSpec_spec_data_sourceType_DataSourceDefinitionExternal_sourceType {
  __typename: "DataSourceSpecConfiguration";
  /**
   * signers is the list of authorized signatures that signed the data for this
   * data source. All the public keys in the data should be contained in this
   * list.
   */
  signers: OracleSpecs_oracleSpecs_dataSourceSpec_spec_data_sourceType_DataSourceDefinitionExternal_sourceType_signers[] | null;
  /**
   * filters describes which source data are considered of interest or not for
   * the product (or the risk model).
   */
  filters: OracleSpecs_oracleSpecs_dataSourceSpec_spec_data_sourceType_DataSourceDefinitionExternal_sourceType_filters[] | null;
}

export interface OracleSpecs_oracleSpecs_dataSourceSpec_spec_data_sourceType_DataSourceDefinitionExternal {
  __typename: "DataSourceDefinitionExternal";
  sourceType: OracleSpecs_oracleSpecs_dataSourceSpec_spec_data_sourceType_DataSourceDefinitionExternal_sourceType;
}

export type OracleSpecs_oracleSpecs_dataSourceSpec_spec_data_sourceType = OracleSpecs_oracleSpecs_dataSourceSpec_spec_data_sourceType_DataSourceDefinitionInternal | OracleSpecs_oracleSpecs_dataSourceSpec_spec_data_sourceType_DataSourceDefinitionExternal;

export interface OracleSpecs_oracleSpecs_dataSourceSpec_spec_data {
  __typename: "DataSourceDefinition";
  sourceType: OracleSpecs_oracleSpecs_dataSourceSpec_spec_data_sourceType;
}

export interface OracleSpecs_oracleSpecs_dataSourceSpec_spec {
  __typename: "DataSourceSpec";
  /**
   * ID is a hash generated from the DataSourceSpec data.
   */
  id: string;
  /**
   * RFC3339Nano creation date time
   */
  createdAt: string;
  /**
   * RFC3339Nano last updated timestamp
   */
  updatedAt: string | null;
  /**
   * Status describes the status of the data source spec
   */
  status: DataSourceSpecStatus;
  data: OracleSpecs_oracleSpecs_dataSourceSpec_spec_data;
}

export interface OracleSpecs_oracleSpecs_dataSourceSpec {
  __typename: "ExternalDataSourceSpec";
  spec: OracleSpecs_oracleSpecs_dataSourceSpec_spec;
}

export interface OracleSpecs_oracleSpecs_dataConnection_edges_node_externalData_data_signers_signer_ETHAddress {
  __typename: "ETHAddress";
  address: string | null;
}

export interface OracleSpecs_oracleSpecs_dataConnection_edges_node_externalData_data_signers_signer_PubKey {
  __typename: "PubKey";
  key: string | null;
}

export type OracleSpecs_oracleSpecs_dataConnection_edges_node_externalData_data_signers_signer = OracleSpecs_oracleSpecs_dataConnection_edges_node_externalData_data_signers_signer_ETHAddress | OracleSpecs_oracleSpecs_dataConnection_edges_node_externalData_data_signers_signer_PubKey;

export interface OracleSpecs_oracleSpecs_dataConnection_edges_node_externalData_data_signers {
  __typename: "Signer";
  signer: OracleSpecs_oracleSpecs_dataConnection_edges_node_externalData_data_signers_signer;
}

export interface OracleSpecs_oracleSpecs_dataConnection_edges_node_externalData_data_data {
  __typename: "Property";
  /**
   * Name of the property
   */
  name: string;
  /**
   * Value of the property
   */
  value: string;
}

export interface OracleSpecs_oracleSpecs_dataConnection_edges_node_externalData_data {
  __typename: "Data";
  /**
   * signers is the list of public keys/ETH addresses that signed the data
   */
  signers: OracleSpecs_oracleSpecs_dataConnection_edges_node_externalData_data_signers[] | null;
  /**
   * properties contains all the properties sent by a data source
   */
  data: OracleSpecs_oracleSpecs_dataConnection_edges_node_externalData_data_data[] | null;
  /**
   * List of all the data specs that matched this source data.
   * When the array is empty, it means no data spec matched this source data.
   */
  matchedSpecIds: string[] | null;
  /**
   * RFC3339Nano formatted date and time for when the data was broadcast to the markets
   * with a matching data spec.
   * It has no value when the source data does not match any data spec.
   */
  broadcastAt: string;
}

export interface OracleSpecs_oracleSpecs_dataConnection_edges_node_externalData {
  __typename: "ExternalData";
  data: OracleSpecs_oracleSpecs_dataConnection_edges_node_externalData_data;
}

export interface OracleSpecs_oracleSpecs_dataConnection_edges_node {
  __typename: "OracleData";
  externalData: OracleSpecs_oracleSpecs_dataConnection_edges_node_externalData;
}

export interface OracleSpecs_oracleSpecs_dataConnection_edges {
  __typename: "OracleDataEdge";
  /**
   * The oracle data source
   */
  node: OracleSpecs_oracleSpecs_dataConnection_edges_node;
}

export interface OracleSpecs_oracleSpecs_dataConnection {
  __typename: "OracleDataConnection";
  /**
   * The oracle data spec
   */
  edges: (OracleSpecs_oracleSpecs_dataConnection_edges | null)[] | null;
}

export interface OracleSpecs_oracleSpecs {
  __typename: "OracleSpec";
  dataSourceSpec: OracleSpecs_oracleSpecs_dataSourceSpec;
  /**
   * Data list all the oracle data broadcast to this spec
   */
  dataConnection: OracleSpecs_oracleSpecs_dataConnection;
}

export interface OracleSpecs {
  /**
   * All registered oracle specs
   */
  oracleSpecs: OracleSpecs_oracleSpecs[] | null;
}
