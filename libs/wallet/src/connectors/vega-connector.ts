import type {
  OrderTimeInForce,
  OrderType,
  Side,
  VoteValue,
} from '@vegaprotocol/types';

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

export interface OrderSubmissionBody {
  orderSubmission: {
    marketId: string;
    reference?: string;
    type: OrderType;
    side: Side;
    timeInForce: OrderTimeInForce;
    size: string;
    price?: string;
    expiresAt?: string;
  };
}

export interface OrderCancellationBody {
  orderCancellation: {
    orderId: string;
    marketId: string;
  };
}

export interface OrderAmendmentBody {
  orderAmendment: {
    marketId: string;
    orderId: string;
    reference?: string;
    timeInForce: OrderTimeInForce;
    sizeDelta?: number;
    price?: string;
    expiresAt?: string;
  };
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
      instrument: {
        name: string;
        code: string;
        future: {
          settlementAsset: string;
          quoteName: string;
          settlementPriceDecimals: number;
          oracleSpecForSettlementPrice: OracleSpecFor;
          oracleSpecForTradingTermination: OracleSpecFor;
          oracleSpecBinding: OracleSpecBinding;
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
          oracleSpecForSettlementPrice: OracleSpecFor;
          oracleSpecForTradingTermination: OracleSpecFor;
          oracleSpecBinding: OracleSpecBinding;
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

interface OracleSpecBinding {
  settlementPriceProperty: string;
  tradingTerminationProperty: string;
}

interface OracleSpecFor {
  pubKeys: string[];
  filters: Filter[];
}

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
    | ProposalNewAssetTerms;
}

export interface ProposalSubmissionBody {
  proposalSubmission: ProposalSubmission;
}

export type Transaction =
  | OrderSubmissionBody
  | OrderCancellationBody
  | WithdrawSubmissionBody
  | VoteSubmissionBody
  | DelegateSubmissionBody
  | UndelegateSubmissionBody
  | OrderAmendmentBody
  | ProposalSubmissionBody;

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
