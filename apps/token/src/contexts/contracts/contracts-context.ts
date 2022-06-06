import type {
  TxData,
  Claim,
  CollateralBridge,
  Token,
  TokenVesting,
  StakingBridge,
} from '@vegaprotocol/smart-contracts';
import React from 'react';

export interface ContractsContextShape {
  token: Token;
  staking: StakingBridge;
  vesting: TokenVesting;
  claim: Claim;
  erc20Bridge: CollateralBridge;
}

export const ContractsContext = React.createContext<
  ContractsContextShape | undefined
>(undefined);

export function useContracts() {
  const context = React.useContext(ContractsContext);
  if (context === undefined) {
    throw new Error('useContracts must be used within ContractsProvider');
  }
  return context;
}
