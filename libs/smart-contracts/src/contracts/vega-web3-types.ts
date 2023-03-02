import type BigNumber from 'bignumber.js';

export interface Tranche {
  tranche_id: number;
  users: string[];
  initial_balance: number;
  current_balance: number;
  cliff_start: number;
  duration: number;
}

export interface TrancheServiceResponse {
  tranches: Tranche[];
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
