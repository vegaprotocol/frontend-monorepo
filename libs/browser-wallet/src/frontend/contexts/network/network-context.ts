import { createContext, useContext } from 'react';

export interface NetworkContextShape {
  interactionMode: boolean;
  explorer: string;
  docs: string;
  governance: string;
  console: string;
  chainId: string;
}

export const NetworkContext = createContext<NetworkContextShape | undefined>(
  undefined
);

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within NetworkProvider');
  }
  return context;
}
