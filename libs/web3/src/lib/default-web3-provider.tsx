import type { ethers } from 'ethers';
import { createContext, useContext } from 'react';

export type DefaultWeb3ProviderContextShape = {
  providers?: { [chainId: number]: ethers.providers.JsonRpcProvider };
};
export const DefaultWeb3ProviderContext = createContext<
  DefaultWeb3ProviderContextShape | undefined
>(undefined);

export const useDefaultWeb3Providers = () => {
  const context = useContext(DefaultWeb3ProviderContext);
  if (context === undefined) {
    throw new Error(
      'useDefaultWeb3Provider must be used within DefaultWeb3ProviderContext'
    );
  }
  return context;
};
