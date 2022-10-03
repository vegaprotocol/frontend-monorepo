import { createContext } from 'react';
import type { VegaConnector } from './connectors';
import type {
  TransactionSubmission,
  TransactionResponse,
} from './wallet-types';

export interface VegaWalletContextShape {
  /** The current select public key */
  keypair: string | null;

  /** Public keys stored in users wallet */
  keypairs: string[] | null;

  /** Calls connect on the supplied connector, storing the returned keys  */
  connect: (connector: VegaConnector) => Promise<boolean>;

  /** Disconnects from the connector and clears public key state */
  disconnect: () => Promise<boolean>;

  /** Sets the current selected public key */
  selectPublicKey: (publicKey: string) => void;

  /** Reference to the connector */
  connector: VegaConnector | null;

  /** Send a transaction to the network, only order submissions for now */
  sendTx: (
    tx: TransactionSubmission
  ) => Promise<
    TransactionResponse | { error: string; details?: string[] }
  > | null;
}

export const VegaWalletContext = createContext<
  VegaWalletContextShape | undefined
>(undefined);
