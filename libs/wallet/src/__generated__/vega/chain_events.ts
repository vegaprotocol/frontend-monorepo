/* eslint-disable */

export const protobufPackage = "vega";

/** Result of calling an arbitrary Ethereum contract method */
export interface EthContractCallEvent {
  /** ID of the data source spec that triggered this contract call. */
  specId: string;
  /** Ethereum block height. */
  blockHeight: number;
  /** Ethereum block time in Unix seconds. */
  blockTime: number;
  /** Result of contract call, packed according to the ABI stored in the associated data source spec. */
  result: Uint8Array;
}

/** Deposit for a Vega built-in asset */
export interface BuiltinAssetDeposit {
  /** Vega network internal asset ID. */
  vegaAssetId: string;
  /** Vega party ID i.e. public key. */
  partyId: string;
  /** Amount to be deposited. This field is an unsigned integer scaled to the asset's decimal places. */
  amount: string;
}

/** Withdrawal for a Vega built-in asset */
export interface BuiltinAssetWithdrawal {
  /** Vega network internal asset ID. */
  vegaAssetId: string;
  /** Vega network party ID i.e. public key. */
  partyId: string;
  /** The amount to be withdrawn. This field is an unsigned integer scaled to the asset's decimal places. */
  amount: string;
}

/** Event related to a Vega built-in asset */
export interface BuiltinAssetEvent {
  /** Built-in asset deposit. */
  deposit?:
    | BuiltinAssetDeposit
    | undefined;
  /** Built-in asset withdrawal. */
  withdrawal?: BuiltinAssetWithdrawal | undefined;
}

/** Asset allow-listing for an ERC20 token */
export interface ERC20AssetList {
  /** Vega network internal asset ID. */
  vegaAssetId: string;
  /** Ethereum address of the asset. */
  assetSource: string;
}

/** Asset deny-listing for an ERC20 token */
export interface ERC20AssetDelist {
  /** Vega network internal asset ID. */
  vegaAssetId: string;
}

export interface ERC20AssetLimitsUpdated {
  /** Vega network internal asset ID. */
  vegaAssetId: string;
  /** Ethereum wallet that initiated the deposit. */
  sourceEthereumAddress: string;
  /** Updated lifetime limits. */
  lifetimeLimits: string;
  /** Updated withdrawal threshold. */
  withdrawThreshold: string;
}

/** Asset deposit for an ERC20 token */
export interface ERC20Deposit {
  /** Vega network internal asset ID. */
  vegaAssetId: string;
  /** Ethereum wallet that initiated the deposit. */
  sourceEthereumAddress: string;
  /** Vega party ID i.e. public key that is the target of the deposit. */
  targetPartyId: string;
  /** Amount to be deposited. */
  amount: string;
}

/** Asset withdrawal for an ERC20 token */
export interface ERC20Withdrawal {
  /** Vega network internal asset ID. */
  vegaAssetId: string;
  /** Target Ethereum wallet address. */
  targetEthereumAddress: string;
  /** Reference nonce used for the transaction. */
  referenceNonce: string;
}

/** Event related to an ERC20 token */
export interface ERC20Event {
  /** Index of the log in the transaction. */
  index: number;
  /** Block in which the transaction was added. */
  block: number;
  /** List an ERC20 asset. */
  assetList?:
    | ERC20AssetList
    | undefined;
  /** De-list an ERC20 asset. */
  assetDelist?:
    | ERC20AssetDelist
    | undefined;
  /** Deposit ERC20 asset. */
  deposit?:
    | ERC20Deposit
    | undefined;
  /** Withdraw ERC20 asset. */
  withdrawal?:
    | ERC20Withdrawal
    | undefined;
  /** Update an ERC20 asset. */
  assetLimitsUpdated?:
    | ERC20AssetLimitsUpdated
    | undefined;
  /** Bridge operations has been stopped. */
  bridgeStopped?:
    | boolean
    | undefined;
  /** Bridge operations has been resumed. */
  bridgeResumed?: boolean | undefined;
}

/** New signer added to the ERC20 bridge */
export interface ERC20SignerAdded {
  /** Ethereum address of the new signer */
  newSigner: string;
  /** Nonce created by the Vega network used for this new signer */
  nonce: string;
  /**
   * Time at which the block was produced
   * will be used to inform the core at what time
   * the stake was made unavailable.
   */
  blockTime: number;
}

/** Signer removed from the ERC20 bridge */
export interface ERC20SignerRemoved {
  /** Ethereum address of the old signer */
  oldSigner: string;
  /** Nonce created by the Vega network used for this old signer */
  nonce: string;
  /**
   * Time at which the block was produced.
   * Will be used to inform the core at what time
   * the stake was made unavailable.
   */
  blockTime: number;
}

/** Threshold has been updated on the multisig control */
export interface ERC20ThresholdSet {
  /** New threshold value to set */
  newThreshold: number;
  /** Nonce created by the Vega network */
  nonce: string;
  /**
   * Time at which the block was produced.
   * Will be used to inform the core at what time
   * the stake was made unavailable.
   */
  blockTime: number;
}

/** Event related to the ERC20 MultiSig */
export interface ERC20MultiSigEvent {
  /** Index of the log in the transaction */
  index: number;
  /** Block in which the transaction was added */
  block: number;
  /** Add a signer to the erc20 bridge */
  signerAdded?:
    | ERC20SignerAdded
    | undefined;
  /** Remove a signer from the erc20 bridge */
  signerRemoved?:
    | ERC20SignerRemoved
    | undefined;
  /** Threshold set */
  thresholdSet?: ERC20ThresholdSet | undefined;
}

/** Event related to staking on the Vega network. */
export interface StakingEvent {
  /** Index of the log in the transaction. */
  index: number;
  /** Block in which the transaction was added. */
  block: number;
  stakeDeposited?: StakeDeposited | undefined;
  stakeRemoved?: StakeRemoved | undefined;
  totalSupply?: StakeTotalSupply | undefined;
}

export interface StakeDeposited {
  /** Ethereum Address of the user depositing stake (hex encode with 0x prefix) */
  ethereumAddress: string;
  /** Hex encoded public key of the party receiving the stake deposit. */
  vegaPublicKey: string;
  /** Amount deposited as an unsigned base 10 integer scaled to the asset's decimal places. */
  amount: string;
  /**
   * Time at which the block was produced.
   * Will be used to inform the core at what time
   * the stake started to be available.
   */
  blockTime: number;
}

export interface StakeRemoved {
  /** Ethereum address of the user removing stake. This should be hex encoded with 0x prefix. */
  ethereumAddress: string;
  /** Hex encoded public key of the party from which to remove stake. */
  vegaPublicKey: string;
  /** Amount removed as a base 10 unsigned integer scaled to the asset's decimal places. */
  amount: string;
  /**
   * The time at which the block was produced
   * will be used to inform the core at what time
   * the stake was made unavailable.
   */
  blockTime: number;
}

export interface StakeTotalSupply {
  /** Address of the staking asset */
  tokenAddress: string;
  /** Total supply observed for the token as an unsigned based 10 integer scaled to the asset's decimal places. */
  totalSupply: string;
}
