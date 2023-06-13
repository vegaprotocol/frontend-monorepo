/* eslint-disable */

export const protobufPackage = "vega.data.v1";

/**
 * Filter describes the conditions under which a data source data is considered of
 * interest or not.
 */
export interface Filter {
  /** Data source's data property key targeted by the filter. */
  key:
    | PropertyKey
    | undefined;
  /**
   * Conditions that should be matched by the data to be
   * considered of interest.
   */
  conditions: Condition[];
}

/** PropertyKey describes the property key contained in data source data. */
export interface PropertyKey {
  /** Name of the property. */
  name: string;
  /** Data type of the property. */
  type: PropertyKey_Type;
  /**
   * Optional decimal place to be be applied on the provided value
   * valid only for PropertyType of type DECIMAL and INTEGER
   */
  numberDecimalPlaces?: number | undefined;
}

/**
 * Type describes the data type of properties that are supported by the data source
 * engine.
 */
export enum PropertyKey_Type {
  /** TYPE_UNSPECIFIED - The default value. */
  TYPE_UNSPECIFIED = 0,
  /** TYPE_EMPTY - Any type. */
  TYPE_EMPTY = 1,
  /** TYPE_INTEGER - Integer type. */
  TYPE_INTEGER = 2,
  /** TYPE_STRING - String type. */
  TYPE_STRING = 3,
  /** TYPE_BOOLEAN - Boolean type. */
  TYPE_BOOLEAN = 4,
  /** TYPE_DECIMAL - Any floating point decimal type. */
  TYPE_DECIMAL = 5,
  /** TYPE_TIMESTAMP - Timestamp date type. */
  TYPE_TIMESTAMP = 6,
  UNRECOGNIZED = -1,
}

/** Condition describes the condition that must be validated by the network */
export interface Condition {
  /** Type of comparison to make on the value. */
  operator: Condition_Operator;
  /** Value to be compared with by the operator. */
  value: string;
}

/** Operator describes the type of comparison. */
export enum Condition_Operator {
  /** OPERATOR_UNSPECIFIED - The default value */
  OPERATOR_UNSPECIFIED = 0,
  /** OPERATOR_EQUALS - Verify if the property values are strictly equal or not. */
  OPERATOR_EQUALS = 1,
  /** OPERATOR_GREATER_THAN - Verify if the data source data value is greater than the Condition value. */
  OPERATOR_GREATER_THAN = 2,
  /**
   * OPERATOR_GREATER_THAN_OR_EQUAL - Verify if the data source data value is greater than or equal to the Condition
   * value.
   */
  OPERATOR_GREATER_THAN_OR_EQUAL = 3,
  /** OPERATOR_LESS_THAN - Verify if the data source data value is less than the Condition value. */
  OPERATOR_LESS_THAN = 4,
  /**
   * OPERATOR_LESS_THAN_OR_EQUAL - Verify if the data source data value is less or equal to than the Condition
   * value.
   */
  OPERATOR_LESS_THAN_OR_EQUAL = 5,
  UNRECOGNIZED = -1,
}
