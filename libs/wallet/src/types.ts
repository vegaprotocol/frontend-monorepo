import type {
  OrderSubmissionBody,
  WithdrawSubmissionBody,
} from '@vegaprotocol/vegawallet-service-api-client';

export enum OrderType {
  Market = 'TYPE_MARKET',
  Limit = 'TYPE_LIMIT',
}

export enum OrderSide {
  Buy = 'SIDE_BUY',
  Sell = 'SIDE_SELL',
}

export enum OrderTimeInForce {
  GTC = 'TIME_IN_FORCE_GTC',
  GTT = 'TIME_IN_FORCE_GTT',
  IOC = 'TIME_IN_FORCE_IOC',
  FOK = 'TIME_IN_FORCE_FOK',
  GFN = 'TIME_IN_FORCE_GFN',
  GFA = 'TIME_IN_FORCE_GFA',
}

// TODO: add to vegawallet-service-api-client
export interface VoteSubmissionBody {
  pubKey: string;
  propagate: boolean;
  voteSubmission: {
    value: 'VALUE_YES' | 'VALUE_NO';
    proposalId: string;
  };
}

// TODO: add to vegawallet-service-api-client
export interface UndelegateSubmissionBody {
  pubKey: string;
  propagate: boolean;
  undelegateSubmission: {
    nodeId: string;
    amount: string;
    method: 'METHOD_NOW' | 'METHOD_AT_END_OF_EPOCH';
  };
}

// TODO: add to vegawallet-service-api-client
export interface DelegateSubmissionBody {
  pubKey: string;
  propagate: boolean;
  delegateSubmission: {
    nodeId: string;
    amount: string;
  };
}

// Will make Transaction a union type as other transactions are added
export type TransactionSubmission =
  | OrderSubmissionBody
  | WithdrawSubmissionBody
  | VoteSubmissionBody
  | DelegateSubmissionBody
  | UndelegateSubmissionBody;
