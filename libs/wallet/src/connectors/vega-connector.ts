import type { VegaKey } from '../wallet-types';
import type {
  TransactionSubmission,
  TransactionResponse,
} from '../wallet-types';

export interface VegaConnector {
  /** Description of how to use this connector */
  description: string;

  /** Connect to wallet and return keys */
  connect(): Promise<VegaKey[] | null>;

  /** Disconnect from wallet */
  disconnect(): Promise<void>;

  /** Send a TX to the network. Only support order submission for now */
  sendTx: (
    body: TransactionSubmission
  ) => Promise<TransactionResponse | { error: string } | null>;
}
