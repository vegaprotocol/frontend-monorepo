/* eslint-disable */
import type { Signer } from "./data/v1/data";
import type { Condition, Filter } from "./data/v1/spec";

export const protobufPackage = "vega";

/**
 * DataSourceDefinition represents the top level object that deals with data sources.
 * DataSourceDefinition can be external or internal, with whatever number of data sources are defined
 * for each type in the child objects below.
 */
export interface DataSourceDefinition {
  internal?: DataSourceDefinitionInternal | undefined;
  external?: DataSourceDefinitionExternal | undefined;
}

/** DataSourceSpecConfigurationTime is the internal data source used for emitting timestamps. */
export interface DataSourceSpecConfigurationTime {
  /** Conditions that the timestamps should meet in order to be considered. */
  conditions: Condition[];
}

/**
 * DataSourceDefinitionInternal is the top level object used for all internal data sources.
 * It contains one of any of the defined `SourceType` variants.
 */
export interface DataSourceDefinitionInternal {
  time?: DataSourceSpecConfigurationTime | undefined;
}

/**
 * DataSourceDefinitionExternal is the top level object used for all external data sources.
 * It contains one of any of the defined `SourceType` variants.
 */
export interface DataSourceDefinitionExternal {
  oracle?: DataSourceSpecConfiguration | undefined;
  ethCall?: EthCallSpec | undefined;
}

/**
 * All types of external data sources use the same configuration set for meeting requirements
 * in order for the data to be useful for Vega - valid signatures and matching filters.
 */
export interface DataSourceSpecConfiguration {
  /**
   * Signers is the list of authorized signatures that signed the data for this
   * source. All the signatures in the data source data should be contained in this
   * external source. All the signatures in the data should be contained in this list.
   */
  signers: Signer[];
  /**
   * Filters describes which source data are considered of interest or not for
   * the product (or the risk model).
   */
  filters: Filter[];
}

/** Specifies a data source that derives its content from calling a read method on an Ethereum contract. */
export interface EthCallSpec {
  /** Ethereum address of the contract to call. */
  address: string;
  /** The ABI of that contract. */
  abi:
    | Array<any>
    | undefined;
  /** Name of the method on the contract to call. */
  method: string;
  /**
   * List of arguments to pass to method call.
   * Protobuf 'Value' wraps an arbitrary JSON type that is mapped to an Ethereum type according to the ABI.
   */
  args: any[];
  /** Conditions for determining when to call the contract method. */
  trigger: EthCallTrigger | undefined;
}

/** Determines when the contract method should be called. */
export interface EthCallTrigger {
  timeTrigger?: EthTimeTrigger | undefined;
}

/** Trigger for an Ethereum call based on the Ethereum block timestamp. Can be one-off or repeating. */
export interface EthTimeTrigger {
  /** Trigger when the Ethereum time is greater or equal to this time, in Unix seconds. */
  initial?:
    | number
    | undefined;
  /** Repeat the call every n seconds after the inital call. If no time for initial call was specified, begin repeating immediately. */
  every?:
    | number
    | undefined;
  /** If repeating, stop once Ethereum time is greater than this time, in Unix seconds. If not set, then repeat indefinitely. */
  until?: number | undefined;
}

/**
 * Data source spec describes the data source base that a product or a risk model
 * wants to get from the data source engine.
 * This message contains additional information used by the API.
 */
export interface DataSourceSpec {
  /** Hash generated from the DataSpec data. */
  id: string;
  /** Creation date and time */
  createdAt: number;
  /** Last Updated timestamp */
  updatedAt: number;
  data:
    | DataSourceDefinition
    | undefined;
  /** Status describes the status of the data source spec */
  status: DataSourceSpec_Status;
}

/** Status describe the status of the data source spec */
export enum DataSourceSpec_Status {
  /** STATUS_UNSPECIFIED - Default value. */
  STATUS_UNSPECIFIED = 0,
  /** STATUS_ACTIVE - STATUS_ACTIVE describes an active data source spec. */
  STATUS_ACTIVE = 1,
  /**
   * STATUS_DEACTIVATED - STATUS_DEACTIVATED describes an data source spec that is not listening to data
   * anymore.
   */
  STATUS_DEACTIVATED = 2,
  UNRECOGNIZED = -1,
}

export interface ExternalDataSourceSpec {
  spec: DataSourceSpec | undefined;
}
