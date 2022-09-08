import type {
  TransactionSubmission,
  TransactionResponse,
} from '../wallet-types';

export interface VegaConnector {
  /** Connect to wallet and return keys */
  connect(): Promise<string[] | null>;

  /** Disconnect from wallet */
  disconnect(): Promise<void>;

  /** Send a TX to the network. Only support order submission for now */
  sendTx: (payload: TransactionSubmission) => Promise<TransactionResponse>;
}
