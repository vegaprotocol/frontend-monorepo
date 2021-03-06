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

export interface OrderSubmissionBody extends BaseTransaction {
  orderSubmission: {
    marketId: string;
    reference?: string;
    type: VegaWalletOrderType;
    side: VegaWalletOrderSide;
    timeInForce: VegaWalletOrderTimeInForce;
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
    timeInForce: VegaWalletOrderTimeInForce;
    sizeDelta?: number;
    // Note this is soon changing to price?: string
    price?: {
      value: string;
    };
    // Note this is soon changing to expiresAt?: number
    expiresAt?: {
      value: string;
    };
  };
}

export interface VoteSubmissionBody extends BaseTransaction {
  voteSubmission: {
    value: VegaWalletVoteValue;
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

export enum VegaWalletVoteValue {
  Yes = 'VALUE_YES',
  No = 'VALUE_NO',
}

export enum VegaWalletOrderType {
  Market = 'TYPE_MARKET',
  Limit = 'TYPE_LIMIT',
}

export enum VegaWalletOrderSide {
  Buy = 'SIDE_BUY',
  Sell = 'SIDE_SELL',
}

export enum VegaWalletOrderTimeInForce {
  GTC = 'TIME_IN_FORCE_GTC',
  GTT = 'TIME_IN_FORCE_GTT',
  IOC = 'TIME_IN_FORCE_IOC',
  FOK = 'TIME_IN_FORCE_FOK',
  GFN = 'TIME_IN_FORCE_GFN',
  GFA = 'TIME_IN_FORCE_GFA',
}

// Will make Transaction a union type as other transactions are added
export type TransactionSubmission =
  | OrderSubmissionBody
  | OrderCancellationBody
  | WithdrawSubmissionBody
  | VoteSubmissionBody
  | DelegateSubmissionBody
  | UndelegateSubmissionBody
  | OrderAmendmentBody;

export type TransactionResponse = z.infer<typeof TransactionResponseSchema>;
export type GetKeysResponse = z.infer<typeof GetKeysSchema>;
export type VegaKey = IterableElement<GetKeysResponse['keys']>;

export type TransactionError =
  | {
      errors: {
        '*': string[];
      };
    }
  | {
      error: string;
    };
