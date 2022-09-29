import { createContext, useContext } from 'react';
import type { MultisigControl } from '@vegaprotocol/smart-contracts';

export interface ContractsContextShape {
  multisig: MultisigControl;
}

export const ContractsContext = createContext<
  ContractsContextShape | undefined
>(undefined);

export function useContracts() {
  const context = useContext(ContractsContext);
  if (context === undefined) {
    throw new Error('useContracts must be used within ContractsProvider');
  }
  return context;
}
