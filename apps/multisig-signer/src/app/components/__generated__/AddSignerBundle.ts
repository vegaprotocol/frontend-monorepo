/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: AddSignerBundle
// ====================================================

export interface AddSignerBundle_erc20MultiSigSignerAddedBundles_edges_node {
  __typename: "ERC20MultiSigSignerAddedBundle";
  /**
   * The ethereum address of the signer to be added
   */
  newSigner: string;
  /**
   * The nonce used in the signing operation
   */
  nonce: string;
  /**
   * The bundle of signatures from current validators to sign in the new signer
   */
  signatures: string;
}

export interface AddSignerBundle_erc20MultiSigSignerAddedBundles_edges {
  __typename: "ERC20MultiSigSignerAddedBundleEdge";
  node: AddSignerBundle_erc20MultiSigSignerAddedBundles_edges_node;
}

export interface AddSignerBundle_erc20MultiSigSignerAddedBundles {
  __typename: "ERC20MultiSigSignerAddedConnection";
  edges: (AddSignerBundle_erc20MultiSigSignerAddedBundles_edges | null)[] | null;
}

export interface AddSignerBundle {
  /**
   * Get the signature bundle to add a particular validator to the signer list of the multisig contract
   */
  erc20MultiSigSignerAddedBundles: AddSignerBundle_erc20MultiSigSignerAddedBundles;
}

export interface AddSignerBundleVariables {
  nodeId: string;
}
