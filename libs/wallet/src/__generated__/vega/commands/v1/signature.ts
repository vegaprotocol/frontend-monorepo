/* eslint-disable */

export const protobufPackage = "vega.commands.v1";

/**
 * Signature to authenticate a transaction and to be verified by the Vega
 * network.
 */
export interface Signature {
  /** Hex encoded bytes of the signature. */
  value: string;
  /** Algorithm used to create the signature. */
  algo: string;
  /** Version of the signature used to create the signature. */
  version: number;
}
