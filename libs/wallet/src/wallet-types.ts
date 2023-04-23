import type { z } from 'zod';
import type { GetKeysSchema, TransactionResponseSchema } from './connectors';
import type { IterableElement } from 'type-fest';

interface BaseTransaction {
  pubKey: string;
  propagate: boolean;
}

export interface DelegateSubmissionBody extends BaseTransaction {
  delegateSubmission: {
    nodeId: string;
    amount: string;
  };
}

export interface UndelegateSubmissionBody extends BaseTransaction {
  undelegateSubmission: {
    nodeId: string;
    amount: string;
    method: 'METHOD_NOW' | 'METHOD_AT_END_OF_EPOCH';
  };
}

type OrderTimeInForce =
  | 'TIME_IN_FORCE_FOK'
  | 'TIME_IN_FORCE_GFA'
  | 'TIME_IN_FORCE_GFN'
  | 'TIME_IN_FORCE_GTC'
  | 'TIME_IN_FORCE_GTT'
  | 'TIME_IN_FORCE_IOC';
export interface OrderSubmissionBody extends BaseTransaction {
  orderSubmission: {
    marketId: string;
    reference?: string;
    type: 'TYPE_MARKET' | 'TYPE_LIMIT';
    side: 'SIDE_BUY' | 'SIDE_SELL';
    timeInForce: OrderTimeInForce;
    size: string;
    price?: string;
    expiresAt?: string;
  };
}

export interface OrderCancellationBody extends BaseTransaction {
  orderCancellation: {
    orderId: string;
    marketId: string;
  };
}

export interface OrderAmendmentBody extends BaseTransaction {
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

export interface VoteSubmissionBody extends BaseTransaction {
  voteSubmission: {
    value: 'VALUE_YES' | 'VALUE_NO';
    proposalId: string;
  };
}

export interface WithdrawSubmissionBody extends BaseTransaction {
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

export interface ProposalSubmissionBody extends BaseTransaction {
  proposalSubmission: ProposalSubmission;
}

// Will make Transaction a union type as other transactions are added
export type TransactionSubmission =
  | OrderSubmissionBody
  | OrderCancellationBody
  | WithdrawSubmissionBody
  | VoteSubmissionBody
  | DelegateSubmissionBody
  | UndelegateSubmissionBody
  | OrderAmendmentBody
  | ProposalSubmissionBody;

export type TransactionResponse = z.infer<typeof TransactionResponseSchema>;
export type GetKeysResponse = z.infer<typeof GetKeysSchema>;
export type VegaKey = IterableElement<GetKeysResponse['keys']>;

export type TransactionError =
  | {
      errors: {
        [key: string]: string[];
      };
      details?: string[];
    }
  | {
      error: string;
      details?: string[];
    };
