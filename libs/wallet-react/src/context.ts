import { createContext, createElement, type PropsWithChildren } from 'react';
import { type Wallet } from '@vegaprotocol/wallet';

export const WalletContext = createContext<Wallet | undefined>(undefined);

export function WalletProvider({
  children,
  config,
}: PropsWithChildren<{ config: Wallet }>) {
  return createElement(WalletContext.Provider, { value: config }, children);
}
