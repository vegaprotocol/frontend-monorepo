import { WalletClientError } from '@vegaprotocol/wallet-client';
import type { SetOptional } from 'type-fest';
import type { vega as vegaProtos } from '@vegaprotocol/protos';
import type { RecurringTransfer } from '@vegaprotocol/protos/dist/vega/commands/v1/RecurringTransfer';

export type OriginalOrderPosition =
  vegaProtos.commands.v1.OrderSubmission.OrderSubmission;
export type OriginalOrderCancellation =
  vegaProtos.commands.v1.OrderCancellation.OrderCancellation;
export type LiquidityProvisionBody =
  vegaProtos.commands.v1.LiquidityProvisionSubmission.LiquidityProvisionSubmission;
export type DelegateSubmission =
  vegaProtos.commands.v1.DelegateSubmission.DelegateSubmission;
export type UndelegateSubmission =
  vegaProtos.commands.v1.UndelegateSubmission.UndelegateSubmission;
export type OriginalOrderAmendment =
  vegaProtos.commands.v1.OrderAmendment.OrderAmendment;
export type VoteSubmission =
  vegaProtos.commands.v1.VoteSubmission.VoteSubmission;
export type OriginalWithdrawSubmission =
  vegaProtos.commands.v1.WithdrawSubmission.WithdrawSubmission;
export type OriginalProposalSubmission =
  vegaProtos.commands.v1.ProposalSubmission.ProposalSubmission;
export type OriginalBatchMarketInstructions =
  vegaProtos.commands.v1.BatchMarketInstructions.BatchMarketInstructions;
export type OriginalTransfer = vegaProtos.commands.v1.Transfer.Transfer;

type ProposalTerms = vegaProtos.ProposalTerms.ProposalTerms;
type WithdrawExt = vegaProtos.WithdrawExt.WithdrawExt;

interface ProposalNewMarketTerms {
  newMarket: {
    changes: {
      decimalPlaces: string;
      positionDecimalPlaces: string;
      lpPriceRange: string;
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
        triggeringRatio: string;
        auctionExtension: string;
      };
      logNormal: LogNormal;
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

// generated type doesn't match in many places with current implementation. It has to be overwrite here
// and re-exported for saving consistency.
/*export type ProposalSubmission = SetOptional<
  OriginalProposalSubmission,
  'reference' | 'terms'
> & {
  terms: SetOptional<
    ProposalTerms,
    'enactmentTimestamp' | 'validationTimestamp'
  >;
};*/

export type WithdrawSubmission = Omit<OriginalWithdrawSubmission, 'ext'> &
  WithdrawExt;

export type OrderSubmission = SetOptional<
  OriginalOrderPosition,
  | 'price'
  | 'expiresAt'
  | 'reference'
  | 'peggedOrder'
  | 'postOnly'
  | 'reduceOnly'
>;

export type OrderAmendment = SetOptional<
  OriginalOrderAmendment,
  'price' | 'sizeDelta' | 'expiresAt' | 'peggedOffset' | 'peggedReference'
>;
export type OrderCancellation = SetOptional<
  OriginalOrderCancellation,
  'orderId' | 'marketId'
>;
export type BatchMarketInstructions = SetOptional<
  OriginalBatchMarketInstructions,
  'submissions' | 'amendments' | 'cancellations'
> & {
  submissions?: OrderSubmission[];
};

export type Transfer = SetOptional<OriginalTransfer, 'reference' | 'kind'> & {
  oneOff?: {
    deliverOn?: number; // omit for immediate
  };
  recurring?: SetOptional<RecurringTransfer, 'dispatchStrategy'>;
};

export interface LiquidityProvisionSubmission {
  liquidityProvisionSubmission: LiquidityProvisionBody;
  pubKey: string;
  propagate: boolean;
}

export interface DelegateSubmissionBody {
  delegateSubmission: DelegateSubmission;
}

export interface UndelegateSubmissionBody {
  undelegateSubmission: UndelegateSubmission;
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
  voteSubmission: VoteSubmission;
}

export interface WithdrawSubmissionBody {
  withdrawSubmission: WithdrawSubmission;
}

export interface ProposalSubmissionBody {
  proposalSubmission: ProposalSubmission;
}

export interface BatchMarketInstructionSubmissionBody {
  batchMarketInstructions: BatchMarketInstructions;
}

export interface TransferBody {
  transfer: Transfer;
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
  | BatchMarketInstructionSubmissionBody
  | TransferBody
  | LiquidityProvisionSubmission;

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

export const isBatchMarketInstructionsTransaction = (
  transaction: Transaction
): transaction is BatchMarketInstructionSubmissionBody =>
  'batchMarketInstructions' in transaction;

export const isTransferTransaction = (
  transaction: Transaction
): transaction is TransferBody => 'transfer' in transaction;

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
