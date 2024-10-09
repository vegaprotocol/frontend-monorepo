import type {
  AccountType,
  DispatchMetric,
  PeggedReference,
  OrderType,
  Side,
  OrderTimeInForce,
  StopOrderExpiryStrategy,
  VoteValue,
  MarketUpdateType,
} from '@vegaprotocol/types';

export interface LiquidityProvisionSubmission {
  liquidityProvisionSubmission: LiquidityProvisionBody;
  pubKey: string;
  propagate: boolean;
}
export interface LiquidityProvisionBody {
  marketId: string;
  commitmentAmount: string;
  fee: string;
  buys?: PeggedOrders[];
  sells?: PeggedOrders[];
}

export interface PeggedOrders {
  offset: string;
  proportion: string;
  reference: PeggedReference;
}

export interface DelegateSubmissionBody {
  delegateSubmission: {
    nodeId: string;
    amount: string;
  };
}

export interface UndelegateSubmissionBody {
  undelegateSubmission: {
    nodeId: string;
    amount: string;
    method: 'METHOD_NOW' | 'METHOD_AT_END_OF_EPOCH';
  };
}

export interface OrderSubmission {
  marketId: string;
  reference?: string;
  type: OrderType;
  side: Side;
  timeInForce: OrderTimeInForce;
  size: string;
  price?: string;
  expiresAt?: string;
  postOnly?: boolean;
  reduceOnly?: boolean;
  icebergOpts?: {
    peakSize: string;
    minimumVisibleSize: string;
  };
}

export interface OrderCancellation {
  orderId?: string;
  marketId?: string;
}

export interface OrderAmendment {
  marketId: string;
  orderId: string;
  reference?: string;
  timeInForce: OrderTimeInForce;
  sizeDelta?: number;
  price?: string;
  expiresAt?: string;
}
export interface OrderSubmissionBody {
  orderSubmission: OrderSubmission;
}

export interface OrderCancellationBody {
  orderCancellation: OrderCancellation;
}

export interface OrderAmendmentBody {
  orderAmendment: OrderAmendment;
}

export interface StopOrderSetup {
  orderSubmission: OrderSubmission;
  expiresAt?: string;
  expiryStrategy?: StopOrderExpiryStrategy;
  price?: string;
  trailingPercentOffset?: string;
  sizeOverrideSetting?: SizeOverrideSetting;
  sizeOverrideValue?: { percentage: string };
}

export interface StopOrdersSubmission {
  risesAbove: StopOrderSetup | undefined;
  fallsBelow: StopOrderSetup | undefined;
}

export interface StopOrdersCancellation {
  stopOrderId?: string;
  marketId?: string;
}

export interface StopOrdersSubmissionBody {
  stopOrdersSubmission: StopOrdersSubmission;
}

export interface StopOrdersCancellationBody {
  stopOrdersCancellation: StopOrdersCancellation;
}

export interface VoteSubmissionBody {
  voteSubmission: {
    value: VoteValue;
    proposalId: string;
  };
}

export interface WithdrawSubmissionBody {
  withdrawSubmission: {
    amount: string;
    asset: string;
    ext: {
      erc20: {
        receiverAddress: string;
      };
    };
  };
}

interface ProposalNewMarketTerms {
  newMarket: {
    changes: {
      decimalPlaces: string;
      positionDecimalPlaces: string;
      linearSlippageFactor: string;
      // FIXME: workaround because of https://github.com/vegaprotocol/vega/issues/10343
      quadraticSlippageFactor: string;
      instrument: {
        name: string;
        code: string;
        future: {
          settlementAsset: string;
          quoteName: string;
          dataSourceSpecForSettlementData: DataSourceSpec;
          dataSourceSpecForTradingTermination: DataSourceSpec;
          dataSourceSpecBinding: DataSourceSpecBinding;
        };
      };
      metadata?: string[];
      priceMonitoringParameters?: PriceMonitoringParameters;
      liquidityMonitoringParameters?: {
        targetStakeParameters: {
          timeWindow: string;
          scalingFactor: number;
        };
        // FIXME: workaround because of https://github.com/vegaprotocol/vega/issues/10343
        triggeringRatio: string;
        auctionExtension: string;
      };
      logNormal: LogNormal;
      successor?: Successor;
      liquiditySlaParameters: LiquiditySLAParameters;
    };
  };
  closingTimestamp: number;
  enactmentTimestamp: number;
}

interface ProposalUpdateMarketTerms {
  updateMarket: {
    marketId: string;
    changes: {
      linearSlippageFactor: string;
      // FIXME: workaround because of https://github.com/vegaprotocol/vega/issues/10343
      quadraticSlippageFactor: string;
      instrument: {
        code: string;
        future: {
          quoteName: string;
          settlementPriceDecimals: number;
          dataSourceSpecForSettlementPrice: DataSourceSpec;
          dataSourceSpecForTradingTermination: DataSourceSpec;
          dataSourceSpecBinding: DataSourceSpecBinding;
        };
      };
      priceMonitoringParameters?: PriceMonitoringParameters;
      logNormal: LogNormal;
    };
  };
  closingTimestamp: number;
  enactmentTimestamp: number;
}

interface ProposalNetworkParameterTerms {
  updateNetworkParameter: {
    changes: {
      key: string;
      value: string;
    };
  };
  closingTimestamp: number;
  enactmentTimestamp: number;
}

interface ProposalFreeformTerms {
  newFreeform: Record<string, never>;
  closingTimestamp: number;
}

interface ProposalNewAssetTerms {
  newAsset: {
    changes: {
      name: string;
      symbol: string;
      decimals: string;
      quantum: string;
      erc20: {
        contractAddress: string;
        withdrawThreshold: string;
        lifetimeLimit: string;
      };
    };
  };
  closingTimestamp: number;
  enactmentTimestamp: number;
  validationTimestamp: number;
}

interface ProposalUpdateAssetTerms {
  updateAsset: {
    assetId: string;
    changes: {
      quantum: string;
      erc20: {
        withdrawThreshold: string;
        lifetimeLimit: string;
      };
    };
  };
  closingTimestamp: number;
  enactmentTimestamp: number;
}

interface ProposalTransferTerms {
  newTransfer: {
    changes: {
      fractionOfBalance: string;
      amount: string;
      sourceType: string;
      source: string;
      transferType: string;
      destinationType: string;
      destination: string;
      asset: string;
      recurring?: {
        startEpoch: number;
        endEpoch: number;
      };
      oneOff?: {
        deliverOn: string;
      };
    };
  };
  closingTimestamp: number;
  enactmentTimestamp: number;
  validationTimestamp?: number;
}

interface ProposalCancelTransferTerms {
  cancelTransfer: {
    changes: {
      transferId: string;
    };
  };
}

interface DataSourceSpecBinding {
  settlementDataProperty: string;
  tradingTerminationProperty: string;
}

interface InternalDataSourceSpec {
  internal: {
    time: {
      conditions: Condition[];
    };
  };
}

interface ExternalDataSourceSpec {
  external: {
    oracle: {
      signers: Signer[];
      filters: Filter[];
    };
  };
}

type DataSourceSpec = InternalDataSourceSpec | ExternalDataSourceSpec;

type Signer =
  | {
      ethAddress: {
        address: string;
      };
    }
  | {
      pubKey: {
        key: string;
      };
    };

interface Filter {
  key: DefaultFilterKey | IntegerFilterKey;
  conditions?: Condition[];
}

interface DefaultFilterKey {
  name: string;
  type: 'TYPE_DECIMAL' | 'TYPE_BOOLEAN' | 'TYPE_TIMESTAMP' | 'TYPE_STRING';
}

interface IntegerFilterKey {
  name: string;
  type: 'TYPE_INTEGER';
  numberDecimalPlaces: string;
}

type ConditionOperator =
  | 'OPERATOR_EQUALS'
  | 'OPERATOR_GREATER_THAN'
  | 'OPERATOR_GREATER_THAN_OR_EQUAL'
  | 'OPERATOR_LESS_THAN'
  | 'OPERATOR_LESS_THAN_OR_EQUAL';

interface Condition {
  operator: ConditionOperator;
  value: string;
}

interface Successor {
  parentMarketId: string;
  insurancePoolFraction: string;
}

interface LogNormal {
  tau: number;
  riskAversionParameter: number;
  params: {
    mu: number;
    r: number;
    sigma: number;
  };
}

interface PriceMonitoringParameters {
  triggers: Trigger[];
}

interface Trigger {
  horizon: string;
  probability: string;
  auctionExtension: string;
}

interface LiquiditySLAParameters {
  priceRange: string;
  commitmentMinTimeFraction: string;
  performanceHysteresisEpochs: number;
  slaCompetitionFactor: string;
}

interface ProposalUpdateMarketStateTerms {
  updateMarketState: {
    changes: {
      marketId: string;
      updateType: MarketUpdateType;
      price?: string;
    };
  };
  closingTimestamp: number;
  enactmentTimestamp: number;
}

export interface ProposalSubmission {
  reference?: string;
  rationale: {
    description: string;
    title: string;
  };
  terms:
    | ProposalFreeformTerms
    | ProposalNewMarketTerms
    | ProposalUpdateMarketTerms
    | ProposalNetworkParameterTerms
    | ProposalNewAssetTerms
    | ProposalUpdateAssetTerms
    | ProposalTransferTerms
    | ProposalCancelTransferTerms
    | ProposalUpdateMarketStateTerms;
}

export interface ProposalSubmissionBody {
  proposalSubmission: ProposalSubmission;
}

type BatchChange<T> = Omit<T, 'closingTimestamp'>;

export interface BatchProposalSubmission {
  reference?: string;
  rationale: {
    description: string;
    title: string;
  };
  terms: {
    closingTimestamp: string;
    changes: Array<
      | BatchChange<ProposalFreeformTerms>
      | BatchChange<ProposalNewMarketTerms>
      | BatchChange<ProposalUpdateMarketTerms>
      | BatchChange<ProposalNetworkParameterTerms>
      | BatchChange<ProposalNewAssetTerms>
      | BatchChange<ProposalUpdateAssetTerms>
      | BatchChange<ProposalTransferTerms>
      | BatchChange<ProposalCancelTransferTerms>
    >;
  };
}

export interface BatchProposalSubmissionBody {
  batchProposalSubmission: BatchProposalSubmission;
}

export interface BatchMarketInstructionSubmissionBody {
  batchMarketInstructions: {
    // Will be processed in this order and the total amount of instructions is
    // restricted by the net param spam.protection.max.batchSize
    cancellations?: OrderCancellation[];
    amendments?: OrderAmendment[];
    // Note: If multiple orders are submitted the first order ID is determined by hashing the signature of the transaction
    // (see determineId function). For each subsequent order's ID, a hash of the previous orders ID is used
    submissions?: OrderSubmission[];
    stopOrdersSubmission?: StopOrdersSubmission[];
    stopOrdersCancellation?: StopOrdersCancellation[];
    updateMarginMode?: UpdateMarginMode[];
  };
}

interface TransferBase {
  fromAccountType: AccountType;
  to: string;
  toAccountType: AccountType;
  asset: string;
  amount: string;
  reference?: string;
}

export interface OneOffTransfer extends TransferBase {
  oneOff: {
    deliverOn?: number; // omit for immediate
  };
}

export interface RecurringTransfer extends TransferBase {
  recurring: {
    factor: string;
    startEpoch: number;
    endEpoch?: number;
    dispatchStrategy?: {
      assetForMetric: string;
      metric: DispatchMetric;
      markets?: string[];
    };
  };
}

export type Transfer = OneOffTransfer | RecurringTransfer;

export interface TransferBody {
  transfer: Transfer;
}

export type ApplyReferralCode = {
  applyReferralCode: {
    id: string;
    doNotJoinTeam?: boolean;
  };
};

export type JoinTeam = {
  joinTeam: {
    id: string;
  };
};

export type CreateReferralSet = {
  createReferralSet: {
    isTeam: boolean;
    team?: {
      name: string;
      teamUrl?: string;
      avatarUrl?: string;
      closed: boolean;
      allowList: string[];
    };
  };
};

export type UpdateReferralSet = {
  updateReferralSet: {
    id: string;
    isTeam: boolean;
    team?: {
      name: string;
      teamUrl?: string;
      avatarUrl?: string;
      closed: boolean | 'ptr-to-false';
      allowList: string[];
    };
  };
};

export enum MarginMode {
  MARGIN_MODE_CROSS_MARGIN = 1,
  MARGIN_MODE_ISOLATED_MARGIN,
}

export enum SizeOverrideSetting {
  SIZE_OVERRIDE_SETTING_NONE = 1,
  SIZE_OVERRIDE_SETTING_POSITION,
}
export interface UpdateMarginMode {
  marketId: string;
  mode: MarginMode;
  marginFactor?: string;
}

export interface UpdateMarginModeBody {
  updateMarginMode: UpdateMarginMode;
}

export interface UpdatePartyProfile {
  updatePartyProfile: {
    alias: string;
    metadata: Array<{ key: string; value: string }>;
  };
}

/** Liquidity parameters that define the size and range of the AMM's tradeable volume. */
export type ConcentratedLiquidityParameters = {
  /** Price at which the AMM will stop quoting sell volume. If not supplied the AMM will never hold a short position. */
  upperBound?: string;
  /** Price at which the AMM will stop quoting buy volume. If not supplied the AMM will never hold a long position. */
  lowerBound?: string;
  /** Price that the AMM will quote as its "fair price" when its position is zero. */
  base: string;
  /** Leverage at upper bound. If not set the markets risk-factors will be used to calculate leverage. */
  leverageAtUpperBound?: string;
  /** Leverage at lower bound. If not set the markets risk-factors will be used to calculate leverage. */
  leverageAtLowerBound?: string;
};

/** Command to create an automated market maker for a given market. */
export type SubmitAMM = {
  /** Market ID for which to create an AMM. */
  marketId: string;
  /** Amount to be committed to the AMM. */
  commitmentAmount: string;
  /** Slippage tolerance used for rebasing the AMM if its base price crosses with existing order */
  slippageTolerance: string;
  /** Concentrated liquidity parameters defining the shape of the AMM's volume curves. */
  concentratedLiquidityParameters: ConcentratedLiquidityParameters;
  /** Nominated liquidity fee factor, which is an input to the calculation of taker fees on the market. */
  proposedFee: string;
};

export type SubmitAMMBody = {
  submitAmm: SubmitAMM;
};

/** Command to amend an existing automated market maker on a market. */
export type AmendAMM = {
  /** Market ID for the AMM to be amended. */
  marketId: string;
  /** Amount to be committed to the AMM. If not supplied the commitment will remain unchanged. */
  commitmentAmount?: string;
  /** Slippage tolerance for rebasing position when updating the AMM. */
  slippageTolerance: string;
  /** Concentrated liquidity parameters defining the shape of the AMM's volume curves. If not supplied the parameters will remain unchanged. */
  concentratedLiquidityParameters?: ConcentratedLiquidityParameters;
  /** Concentrated liquidity parameters defining the shape of the AMM's volume curves. If not supplied the parameters will remain unchanged. */
  proposedFee?: string;
};

export type AmendAMMBody = {
  amendAmm: AmendAMM;
};

export enum CancelAMMMethod {
  METHOD_UNSPECIFIED = 0,
  /** Cancellation will be immediate and any open positions will be transferred to the network for liquidation. */
  METHOD_IMMEDIATE = 1,
  /** AMM will only trade to reduce its position, and will be cancelled once its position reaches zero. */
  METHOD_REDUCE_ONLY = 2,
}

/** Command to cancel an automated market maker for a given market. */
export type CancelAMM = {
  /** Market ID to cancel an AMM for. */
  marketId: string;
  /** Method to use to cancel the AMM. */
  method: CancelAMMMethod;
};

export type CancelAMMBody = {
  cancelAmm: CancelAMM;
};

export type Transaction =
  | AmendAMMBody
  | ApplyReferralCode
  | BatchMarketInstructionSubmissionBody
  | BatchProposalSubmissionBody
  | CancelAMMBody
  | CreateReferralSet
  | DelegateSubmissionBody
  | JoinTeam
  | LiquidityProvisionSubmission
  | OrderAmendmentBody
  | OrderCancellationBody
  | OrderSubmissionBody
  | ProposalSubmissionBody
  | StopOrdersCancellationBody
  | StopOrdersSubmissionBody
  | SubmitAMMBody
  | TransferBody
  | UndelegateSubmissionBody
  | UpdateMarginModeBody
  | UpdatePartyProfile
  | UpdateReferralSet
  | VoteSubmissionBody
  | WithdrawSubmissionBody;

export interface TransactionResponse {
  transactionHash: string;
  signature: string; // still to be added by core
  receivedAt: string;
  sentAt: string;
}
