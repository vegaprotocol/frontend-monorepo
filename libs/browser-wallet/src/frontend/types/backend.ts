import type { Transaction } from '@/lib/transactions';

export interface AllowList {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  publicKeys: any[];
  wallets: string[];
}

export interface Connection {
  allowList: AllowList;
  origin: string;
  accessedAt: number;
  chainId: string;
  networkId: string;
  autoConsent: boolean;
}

export interface Wallet {
  name: string;
  keys: Key[];
}

export interface Key {
  index: number;
  name: string;
  publicKey: string;
}

export interface Network {
  id: string;
  color: string;
  secondaryColor: string;
  name: string;
  chainId: string;
  hidden: boolean;
  rest: string[];
  console: string;
  ethereumExplorerLink: string;
  ethereumChainId: string;
  arbitrumExplorerLink: string;
  arbitrumChainId: string;
  explorer: string;
  governance: string;
  docs: string;
  vegaDapps: string;
  etherscanUrl: string;
}

export interface CheckTransactionResponse {
  valid: boolean;
  error?: string;
}

export enum TransactionState {
  Confirmed = 'Confirmed',
  Rejected = 'Rejected',
  Error = 'Error',
}

export interface StoredTransaction {
  id: string;
  transaction: Transaction;
  publicKey: string;
  sendingMode: string;
  keyName: string;
  walletName: string;
  origin: string;
  receivedAt: string; // Date
  networkId: string;
  chainId: string;
  decision: string; // Date
  state: TransactionState;
  autoApproved: boolean;
  node: string;
  error?: string;
  hash?: string;
  code?: number;
}
