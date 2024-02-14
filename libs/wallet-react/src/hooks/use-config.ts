import { useContext } from 'react';
import { WalletContext } from '../context';

export function useConfig() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('must be used within VegaWalletProvider');
  }
  return context;
}
