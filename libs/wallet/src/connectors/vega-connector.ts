import { WalletClientError } from '@vegaprotocol/wallet-client';
import type { LiquidityProvisionSubmission as LiquidityProvisionBody } from '@vegaprotocol/protos/dist/vega/commands/v1/LiquidityProvisionSubmission';
import type { DelegateSubmission } from '@vegaprotocol/protos/dist/vega/commands/v1/DelegateSubmission';
import type { UndelegateSubmission } from '@vegaprotocol/protos/dist/vega/commands/v1/UndelegateSubmission';
import type { OrderSubmission as OriginalOrderPosition } from '@vegaprotocol/protos/dist/vega/commands/v1/OrderSubmission';
import type { OrderCancellation as OriginalOrderCancellation } from '@vegaprotocol/protos/dist/vega/commands/v1/OrderCancellation';
import type { OrderAmendment as OriginalOrderAmendment } from '@vegaprotocol/protos/dist/vega/commands/v1/OrderAmendment';
import type { VoteSubmission } from '@vegaprotocol/protos/dist/vega/commands/v1/VoteSubmission';
import type { WithdrawSubmission as OriginalWithdrawSubmission } from '@vegaprotocol/protos/dist/vega/commands/v1/WithdrawSubmission';
import type { ProposalSubmission as OriginalProposalSubmission } from '@vegaprotocol/protos/dist/vega/commands/v1/ProposalSubmission';
import type { BatchMarketInstructions as OriginalBatchMarketInstructions } from '@vegaprotocol/protos/dist/vega/commands/v1/BatchMarketInstructions';
import type { Transfer } from '@vegaprotocol/protos/dist/vega/commands/v1/Transfer';
import type { ProposalTerms } from '@vegaprotocol/protos/dist/vega/ProposalTerms';
import type { WithdrawExt } from '@vegaprotocol/protos/dist/vega/WithdrawExt';

// generated type doesn't match in many places with current implementation. It has to be overwrite here
// and re-exported for saving consistency.
export type ProposalSubmission = Omit<
  OriginalProposalSubmission,
  'reference' | 'terms'
> &
  Partial<Pick<OriginalProposalSubmission, 'reference'>> & {
    terms: Omit<ProposalTerms, 'enactmentTimestamp' | 'validationTimestamp'> &
      Partial<
        Pick<ProposalTerms, 'enactmentTimestamp' | 'validationTimestamp'>
      >;
  };
export type WithdrawSubmission = Omit<OriginalWithdrawSubmission, 'ext'> &
  WithdrawExt;

export type OrderSubmission = Omit<
  OriginalOrderPosition,
  | 'price'
  | 'expiresAt'
  | 'reference'
  | 'peggedOrder'
  | 'postOnly'
  | 'reduceOnly'
> &
  Partial<
    Pick<
      OriginalOrderPosition,
      | 'price'
      | 'expiresAt'
      | 'reference'
      | 'peggedOrder'
      | 'postOnly'
      | 'reduceOnly'
    >
  >;

export type OrderAmendment = Omit<
  OriginalOrderAmendment,
  'price' | 'sizeDelta' | 'expiresAt' | 'peggedOffset' | 'peggedReference'
> &
  Partial<
    Pick<
      OriginalOrderAmendment,
      'price' | 'sizeDelta' | 'expiresAt' | 'peggedOffset' | 'peggedReference'
    >
  >;
export type OrderCancellation = Omit<
  OriginalOrderCancellation,
  'orderId' | 'marketId'
> &
  Partial<Pick<OriginalOrderCancellation, 'orderId' | 'marketId'>>;
export type BatchMarketInstructions = Omit<
  OriginalBatchMarketInstructions,
  'submissions' | 'amendments' | 'cancellations'
> &
  Partial<
    Pick<OriginalBatchMarketInstructions, 'amendments' | 'cancellations'>
  > & {
    submissions?: OrderSubmission[];
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
