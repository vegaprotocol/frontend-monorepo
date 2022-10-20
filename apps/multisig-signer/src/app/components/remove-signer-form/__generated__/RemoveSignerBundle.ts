/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: RemoveSignerBundle
// ====================================================

export interface RemoveSignerBundle_erc20MultiSigSignerRemovedBundles_edges_node {
  __typename: "ERC20MultiSigSignerRemovedBundle";
  /**
   * The ethereum address of the signer to be removed
   */
  oldSigner: string;
  /**
   * The nonce used in the signing operation
   */
  nonce: string;
  /**
   * The bundle of signatures from current validators to sign in the new signer
   */
  signatures: string;
}

export interface RemoveSignerBundle_erc20MultiSigSignerRemovedBundles_edges {
  __typename: "ERC20MultiSigSignerRemovedBundleEdge";
  node: RemoveSignerBundle_erc20MultiSigSignerRemovedBundles_edges_node;
}

export interface RemoveSignerBundle_erc20MultiSigSignerRemovedBundles {
  __typename: "ERC20MultiSigSignerRemovedConnection";
  /**
   * The list of signer bundles for that validator
   */
  edges: (RemoveSignerBundle_erc20MultiSigSignerRemovedBundles_edges | null)[] | null;
}

export interface RemoveSignerBundle {
  /**
   * Get the signatures bundle to remove a particular validator from signer list of the multisig contract
   */
  erc20MultiSigSignerRemovedBundles: RemoveSignerBundle_erc20MultiSigSignerRemovedBundles;
}

export interface RemoveSignerBundleVariables {
  nodeId: string;
}
