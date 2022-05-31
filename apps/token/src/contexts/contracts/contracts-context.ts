import type {
  TxData,
  VegaClaim,
  createTokenContract,
  createStakingBridgeContract,
  createTokenVestingContract,
  createCollateralBridgeContract,
} from '@vegaprotocol/smart-contracts';
import React from 'react';

export interface ContractsContextShape {
  token: ReturnType<typeof createTokenContract>;
  staking: ReturnType<typeof createStakingBridgeContract>;
  vesting: ReturnType<typeof createTokenVestingContract>;
  claim: VegaClaim;
  erc20Bridge: ReturnType<typeof createCollateralBridgeContract>;
  transactions: TxData[];
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
