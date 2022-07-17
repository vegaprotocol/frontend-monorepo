import { useContext } from 'react';
import { VegaWalletContext } from '.';

export function useVegaWallet() {
  const context = useContext(VegaWalletContext);
  if (context === undefined) {
    throw new Error('useVegaWallet must be used within VegaWalletProvider');
  }
  return context;
}
