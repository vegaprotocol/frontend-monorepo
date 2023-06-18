import { WalletClientError } from '@vegaprotocol/wallet-client';
import type { SetOptional } from 'type-fest';
import type { vega as vegaProtos } from '@vegaprotocol/protos';

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
export type Transfer = vegaProtos.commands.v1.Transfer.Transfer;

type ProposalTerms = vegaProtos.ProposalTerms.ProposalTerms;
type WithdrawExt = vegaProtos.WithdrawExt.WithdrawExt;

// generated type doesn't match in many places with current implementation. It has to be overwrite here
// and re-exported for saving consistency.
export type ProposalSubmission = SetOptional<
  OriginalProposalSubmission,
  'reference' | 'terms'
> & {
  terms: SetOptional<
    ProposalTerms,
    'enactmentTimestamp' | 'validationTimestamp'
  >;
};
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
