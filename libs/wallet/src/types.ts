import { type StoreApi } from 'zustand';
import { type Transaction, type TransactionResponse } from './connectors';
import { type Chain } from './chains';

export enum JsonRpcMethod {
  ConnectWallet = 'client.connect_wallet',
  DisconnectWallet = 'client.disconnect_wallet',
  ListKeys = 'client.list_keys',
  SignTransaction = 'client.sign_transaction',
  SendTransaction = 'client.send_transaction',
  GetChainId = 'client.get_chain_id',
}

export interface IWalletError {
  error: string;
}

export interface TransactionParams {
  publicKey: string;
  transaction: Transaction;
  sendingMode: 'TYPE_SYNC';
}

export interface Connector {
  readonly id: string;

  connectWallet(chainId?: string): Promise<{ success: boolean } | IWalletError>;

  disconnectWallet(): Promise<{ success: boolean } | IWalletError>;

  getChainId(): Promise<{ chainId: string } | IWalletError>;

  listKeys(): Promise<
    Array<{ publicKey: string; name: string }> | IWalletError
  >;

  isConnected(): Promise<{ connected: boolean } | IWalletError>;

  sendTransaction(
    params: TransactionParams
  ): Promise<TransactionResponse | IWalletError>;

  on(event: string, callback: () => void): void;

  off(event: string, callback: () => void): void;
}

export type Key = {
  publicKey: string;
  name: string;
};

export type Status = 'disconnected' | 'connecting' | 'connected';

export type Store = {
  chainId: string;
  status: Status;
  current: string | undefined;
  keys: Key[];
  setKeys: (keys: Key[]) => void;
  error: string | undefined;
};

export type Config = {
  chains: Chain[];
  defaultChainId: string;
  connectors: Connector[];
};

export type Wallet = {
  store: StoreApi<Store>;
  connectors: Connector[];
  connect: (id: string) => Promise<void>;
  disconnect: () => Promise<void>;
  sendTransaction: (
    params: TransactionParams
  ) => Promise<TransactionResponse | IWalletError>;
  setStoreState: (state: Partial<Store>) => void;
};
