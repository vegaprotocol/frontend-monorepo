import { type StoreApi } from 'zustand';
import {
  type Transaction,
  type TransactionResponse,
} from './transaction-types';
import { type Chain } from './chains';
import { type ConnectorError } from './errors';

export enum JsonRpcMethod {
  ConnectWallet = 'client.connect_wallet',
  DisconnectWallet = 'client.disconnect_wallet',
  ListKeys = 'client.list_keys',
  SignTransaction = 'client.sign_transaction',
  SendTransaction = 'client.send_transaction',
  GetChainId = 'client.get_chain_id',
}

export interface TransactionParams {
  publicKey: string;
  transaction: Transaction;
  sendingMode: 'TYPE_SYNC';
}

export type QuickstartWalletEvents =
  | 'client.transaction_sent'
  | 'client.request_transaction_approval'
  | 'client.request_transaction_decided';
export type CommonEvents =
  | 'client.disconnected'
  | 'client.list_keys'
  | 'client.keys_changed';
export type VegaWalletEvent = QuickstartWalletEvents | CommonEvents;

export type ConnectorType =
  | 'injected'
  | 'jsonRpc'
  | 'snap'
  | 'viewParty'
  | 'mock'
  | 'embedded-wallet'
  | 'embedded-wallet-quickstart';

export interface Connector {
  readonly id: ConnectorType;
  name: string;
  description: string;
  prominent: boolean;

  bindStore(state: StoreApi<Store>): void;
  connectWallet(chainId?: string): Promise<{ success: boolean }>;
  disconnectWallet(): Promise<void>;
  getChainId(): Promise<{ chainId: string }>;
  listKeys(): Promise<Array<{ publicKey: string; name: string }>>;
  isConnected(): Promise<{ connected: boolean }>;
  sendTransaction(params: TransactionParams): Promise<TransactionResponse>;
  on(event: VegaWalletEvent, callback: () => void): void;
  off(event: VegaWalletEvent, callback?: () => void): void;
  disconnect: () => Promise<void>;
}

export type Key = {
  publicKey: string;
  name: string;
};

export type Status =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'creating'
  | 'importing';

export type CoreStore = {
  chainId: string;
  status: Status;
  current: ConnectorType | undefined;
  keys: Key[];
  error: ConnectorError | undefined;
  jsonRpcToken: string | undefined;
};

export type SingleKeyStore = {
  pubKey: string | undefined;
};

export type Store = CoreStore & SingleKeyStore;

export type Config = {
  chains: Chain[];
  defaultChainId: string;
  connectors: Connector[];
  appName: string;
  walletConfig: {
    explorer: string;
    docs: string;
    governance: string;
    console: string;
    chainId: string;
    etherscanUrl: string;
  };
};

export type Wallet = {
  store: StoreApi<Store>;
  connectors: Connector[];
  connect: (id: ConnectorType) => Promise<{ status: Status }>;
  disconnect: () => Promise<{ status: Status }>;
  refreshKeys: () => Promise<void>;
  sendTransaction: (params: TransactionParams) => Promise<TransactionResponse>;
  reset: () => void;
  walletConfig: {
    explorer: string;
    docs: string;
    governance: string;
    console: string;
    chainId: string;
    etherscanUrl: string;
  };
  appName: string;
};

declare global {
  interface Vega {
    connectWallet: (args: { chainId: string }) => Promise<null>;
    disconnectWallet: () => Promise<void>;
    listKeys: () => Promise<{
      keys: Array<{ name: string; publicKey: string }>;
    }>;
    sendTransaction: (params: {
      publicKey: string;
      transaction: Transaction;
      sendingMode: 'TYPE_SYNC';
    }) => Promise<{
      receivedAt: string;
      sentAt: string;
      transaction: {
        from: {
          pubKey: string;
        };
        inputData: string;
        pow: {
          tid: string;
          nonce: string;
        };
        signature: {
          algo: string;
          value: string;
          version: number;
        };
        version: number;
      };
      transactionHash: string;
    }>;

    on: (event: VegaWalletEvent, callback: () => void) => void;
    off: (event: VegaWalletEvent, callback: () => void) => void;
    isConnected: () => Promise<boolean>;
    // deprecated
    getChainId: () => Promise<{ chainID: string }>;
  }

  interface Window {
    vega: Vega;
  }
}
