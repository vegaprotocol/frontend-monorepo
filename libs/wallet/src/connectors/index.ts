import type {
  VegaKey,
  TransactionResponse,
} from '@vegaprotocol/vegawallet-service-api-client';
import type { TransactionSubmission } from '../types';
export { RestConnector } from './rest-connector';

type ErrorResponse =
  | {
      error: string;
    }
  | {
      errors: object;
    };

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
  ) => Promise<TransactionResponse | ErrorResponse>;
}
