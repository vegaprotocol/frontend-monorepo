import type BigNumber from 'bignumber.js';

export interface Tranche {
  tranche_id: number;
  tranche_start: Date;
  tranche_end: Date;
  total_added: BigNumber;
  total_removed: BigNumber;
  locked_amount: BigNumber;
  deposits: Array<TrancheDeposit>;
  withdrawals: Array<TrancheWithdrawal>;
  users: Array<TrancheUser>;
}

export interface TrancheDeposit {
  amount: BigNumber;
  user: string;
  tx: string;
}

export interface TrancheWithdrawal {
  amount: BigNumber;
  user: string;
  tx: string;
}

export interface TrancheUser {
  address: string;
  deposits: Array<{
    amount: BigNumber;
    user: string;
    tx: string;
    tranche_id: number;
  }>;
  withdrawals: Array<{
    amount: BigNumber;
    user: string;
    tx: string;
    tranche_id: number;
  }>;
  total_tokens: BigNumber;
  withdrawn_tokens: BigNumber;
  remaining_tokens: BigNumber;
}

export enum TrancheEvents {
  Created = 'Tranche_Created',
  BalanceAdded = 'Tranche_Balance_Added',
  BalanceRemoved = 'Tranche_Balance_Removed',
}

export interface IVegaClaimData {
  amount: BigNumber;
  tranche: number;
  expiry: number;
  target?: string;
}

export interface IVegaClaimSignature {
  v: number;
  r: string;
  s: string;
}

export interface IClaimTokenParams {
  claim: IVegaClaimData;
  signature: IVegaClaimSignature;
  country: string | null;
}

export interface EpochDetails {
  id: string;
  startSeconds: BigNumber;
  endSeconds: BigNumber;
}
