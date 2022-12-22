import type * as Schema from '@vegaprotocol/types';

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
      instrument: {
        name: string;
        code: string;
        future: {
          settlementAsset: string;
          quoteName: string;
          settlementPriceDecimals: number;
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
        triggeringRatio: number;
        auctionExtension: string;
      };
      logNormal: LogNormal;
    };
    liquidityCommitment: {
      commitmentAmount: string;
      fee: string;
      buys: Buy[];
      sells: Buy[];
    };
  };
  closingTimestamp: number;
  enactmentTimestamp: number;
}

interface ProposalUpdateMarketTerms {
  updateMarket: {
    marketId: string;
    changes: {
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

interface DataSourceSpecBinding {
  settlementPriceProperty: string;
  tradingTerminationProperty: string;
}

interface DataSourceSpec {
  config: {
    signers: Signer[];
    filters: Filter[];
  };
}

type Signer =
  | {
      address: string;
    }
  | {
      key: string;
    };

interface Filter {
  key: {
    name: string;
    type: string;
  };
  conditions?: Condition[];
}

interface Condition {
  operator: string;
  value: string;
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

interface Buy {
  offset: string;
  proportion: number;
  reference: string;
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
    | ProposalUpdateAssetTerms;
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

export type Transaction =
  | OrderSubmissionBody
  | OrderCancellationBody
  | WithdrawSubmissionBody
  | VoteSubmissionBody
  | DelegateSubmissionBody
  | UndelegateSubmissionBody
  | OrderAmendmentBody
  | ProposalSubmissionBody
  | BatchMarketInstructionSubmissionBody;

export const isWithdrawTransaction = (
  transaction: Transaction
): transaction is WithdrawSubmissionBody => 'withdrawSubmission' in transaction;

export const isOrderSubmissionTransaction = (
  transaction: Transaction
): transaction is OrderSubmissionBody => 'orderSubmission' in transaction;

export const isOrderCancellationTransaction = (
  transaction: Transaction
): transaction is OrderCancellationBody => 'orderCancellation' in transaction;

export const isOrderAmendmentTransaction = (
  transaction: Transaction
): transaction is OrderAmendmentBody => 'orderAmendment' in transaction;

export interface TransactionResponse {
  transactionHash: string;
  signature: string; // still to be added by core
  receivedAt: string;
  sentAt: string;
}
export class WalletError {
  message: string;
  code: number;
  data?: string;

  constructor(message: string, code: number, data?: string) {
    this.message = message;
    this.code = code;
    this.data = data;
  }
}

export interface PubKey {
  publicKey: string;
  name: string;
}

export interface VegaConnector {
  url: string | null;

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
}
