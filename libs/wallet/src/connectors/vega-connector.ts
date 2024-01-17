import { WalletClientError } from '@vegaprotocol/wallet-client';
import type * as Schema from '@vegaprotocol/types';
import type { PeggedReference } from '@vegaprotocol/types';

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
  type: Schema.OrderType;
  side: Schema.Side;
  timeInForce: Schema.OrderTimeInForce;
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
  timeInForce: Schema.OrderTimeInForce;
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
  expiryStrategy?: Schema.StopOrderExpiryStrategy;
  price?: string;
  trailingPercentOffset?: string;
}

export interface StopOrdersSubmission {
  risesAbove?: StopOrderSetup;
  fallsBelow?: StopOrderSetup;
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
    value: Schema.VoteValue;
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

export interface ProposalSubmission {
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
    | ProposalCancelTransferTerms;
}

export interface ProposalSubmissionBody {
  proposalSubmission: ProposalSubmission;
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
  };
}

interface TransferBase {
  fromAccountType: Schema.AccountType;
  to: string;
  toAccountType: Schema.AccountType;
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
      metric: Schema.DispatchMetric;
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

export type Transaction =
  | StopOrdersSubmissionBody
  | StopOrdersCancellationBody
  | OrderSubmissionBody
  | OrderCancellationBody
  | WithdrawSubmissionBody
  | VoteSubmissionBody
  | DelegateSubmissionBody
  | UndelegateSubmissionBody
  | OrderAmendmentBody
  | ProposalSubmissionBody
  | BatchMarketInstructionSubmissionBody
  | TransferBody
  | LiquidityProvisionSubmission
  | ApplyReferralCode
  | CreateReferralSet;

export const isWithdrawTransaction = (
  transaction: Transaction
): transaction is WithdrawSubmissionBody => 'withdrawSubmission' in transaction;

export const isOrderSubmissionTransaction = (
  transaction: Transaction
): transaction is OrderSubmissionBody => 'orderSubmission' in transaction;

export const isOrderCancellationTransaction = (
  transaction: Transaction
): transaction is OrderCancellationBody => 'orderCancellation' in transaction;

export const isStopOrdersSubmissionTransaction = (
  transaction: Transaction
): transaction is StopOrdersSubmissionBody =>
  'stopOrdersSubmission' in transaction;

export const isStopOrdersCancellationTransaction = (
  transaction: Transaction
): transaction is StopOrdersCancellationBody =>
  'stopOrdersCancellation' in transaction;

export const isOrderAmendmentTransaction = (
  transaction: Transaction
): transaction is OrderAmendmentBody => 'orderAmendment' in transaction;

export const isBatchMarketInstructionsTransaction = (
  transaction: Transaction
): transaction is BatchMarketInstructionSubmissionBody =>
  'batchMarketInstructions' in transaction;

export const isTransferTransaction = (
  transaction: Transaction
): transaction is TransferBody => 'transfer' in transaction;

export const isReferralRelatedTransaction = (
  transaction: Transaction
): transaction is CreateReferralSet | ApplyReferralCode =>
  'createReferralSet' in transaction || 'applyReferralCode' in transaction;

export interface TransactionResponse {
  transactionHash: string;
  signature: string; // still to be added by core
  receivedAt: string;
  sentAt: string;
}
export class WalletError extends WalletClientError {
  data: string;

  constructor(message: string, code: number, data = 'Wallet error') {
    super({ code, message, data });
    this.data = data;
  }
}

export interface PubKey {
  publicKey: string;
  name: string;
}

export interface VegaConnector {
  url?: string | null;

  /** Connect to wallet and return keys */
  connect(): Promise<PubKey[] | null>;

  /** Disconnect from wallet */
  disconnect(): Promise<void>;

  /**
   * sign and send a transaction to the network
   *
   * @returns promise containing either the transaction payload or null if the user rejected the request
   */
  sendTx: (
    pubkey: string,
    transaction: Transaction
  ) => Promise<TransactionResponse | null>;

  /**
   * Checks if the connection to the connector is alive.
   */
  isAlive: () => Promise<boolean>;
}
