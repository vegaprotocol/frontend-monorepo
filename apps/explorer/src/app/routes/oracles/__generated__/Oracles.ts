/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { OracleSpecStatus, PropertyKeyType, ConditionOperator } from "@vegaprotocol/types";

// ====================================================
// GraphQL query operation: Oracles
// ====================================================

export interface Oracles_oracleSpecs_filters_key {
  __typename: "PropertyKey";
  /**
   * name is the name of the property.
   */
  name: string | null;
  /**
   * type is the type of the property.
   */
  type: PropertyKeyType;
}

export interface Oracles_oracleSpecs_filters_conditions {
  __typename: "Condition";
  /**
   * value is used by the comparator.
   */
  value: string | null;
  /**
   * comparator is the type of comparison to make on the value.
   */
  operator: ConditionOperator;
}

export interface Oracles_oracleSpecs_filters {
  __typename: "Filter";
  /**
   * key is the oracle data property key targeted by the filter.
   */
  key: Oracles_oracleSpecs_filters_key;
  /**
   * conditions are the conditions that should be matched by the data to be
   * considered of interest.
   */
  conditions: Oracles_oracleSpecs_filters_conditions[] | null;
}

export interface Oracles_oracleSpecs_data {
  __typename: "OracleData";
  /**
   * pubKeys is the list of public keys that signed the data
   */
  pubKeys: string[] | null;
}

export interface Oracles_oracleSpecs {
  __typename: "OracleSpec";
  /**
   * status describes the status of the oracle spec
   */
  status: OracleSpecStatus;
  /**
   * id is a hash generated from the OracleSpec data.
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
   * pubKeys is the list of authorized public keys that signed the data for this
   * oracle. All the public keys in the oracle data should be contained in these
   * public keys.
   */
  pubKeys: string[] | null;
  /**
   * filters describes which oracle data are considered of interest or not for
   * the product (or the risk model).
   */
  filters: Oracles_oracleSpecs_filters[] | null;
  /**
   * data list all the oracle data broadcast to this spec
   */
  data: Oracles_oracleSpecs_data[];
}

export interface Oracles {
  /**
   * All registered oracle specs
   */
  oracleSpecs: Oracles_oracleSpecs[] | null;
}
