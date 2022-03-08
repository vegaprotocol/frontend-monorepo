import { VegaKey } from '@vegaprotocol/vegawallet-service-api-client';
export { RestConnector } from './rest-connector';

export interface VegaConnector {
  /** Description of how to use this connector */
  description: string;

  /** Connect to wallet and return keys */
  connect(): Promise<VegaKey[] | null>;

  /** Disconnect from wallet */
  disconnect(): Promise<void>;
}
