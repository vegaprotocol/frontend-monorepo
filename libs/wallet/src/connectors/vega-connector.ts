import type {
  TransactionSubmission,
  TransactionResponse,
} from '../wallet-types';

export interface ConnectorConfig {
  token: string | null;
  connector: 'rest' | 'jsonRpc';
  url: string | null;
}

export interface VegaConnector {
  /** Connect to wallet and return keys */
  connect(): Promise<string[] | null>;

  /** Disconnect from wallet */
  disconnect(): Promise<void>;

  /** Send a TX to the network. Only support order submission for now */
  sendTx: (payload: TransactionSubmission) => Promise<any>;
}
