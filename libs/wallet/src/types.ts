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

type VegaWalletEvent = 'client.disconnected';

export type ConnectorType = 'injected' | 'jsonRpc' | 'snap' | 'readOnly';

export interface Connector {
  readonly id: ConnectorType;

  bindStore(state: StoreApi<Store>): void;

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

  on(event: VegaWalletEvent, callback: () => void): void;

  off(event: VegaWalletEvent): void;
}

export type Key = {
  publicKey: string;
  name: string;
};

export type Status = 'disconnected' | 'connecting' | 'connected';

export type CoreStore = {
  chainId: string;
  status: Status;
  current: ConnectorType | undefined;
  keys: Key[];
  setKeys: (keys: Key[]) => void;
  error: string | undefined;
  jsonRpcToken: string | undefined;
};

export type SingleKeyStore = {
  pubKey: string | undefined;
  setPubKey: (key: string) => void;
};

export type Store = CoreStore & SingleKeyStore;

export type Config = {
  chains: Chain[];
  defaultChainId: string;
  connectors: Connector[];
};

export type Wallet = {
  store: StoreApi<Store>;
  connectors: Connector[];
  connect: (id: ConnectorType) => Promise<{ success: boolean } | undefined>;
  disconnect: () => Promise<{ success: boolean } | undefined>;
  sendTransaction: (
    params: TransactionParams
  ) => Promise<TransactionResponse | IWalletError>;
  setStoreState: (state: Partial<Store>) => void;
};
