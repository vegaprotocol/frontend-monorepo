import { createContext } from 'react';
import type {
  Transaction,
  TransactionResponse,
  VegaConnector,
  WalletError,
} from './connectors';

export interface VegaWalletContextShape {
  /** The current select public key */
  pubKey: string | null;

  /** Public keys stored in users wallet */
  pubKeys: string[] | null;

  /** Calls connect on the supplied connector, storing the returned keys  */
  connect: (connector: VegaConnector) => Promise<string[] | null>;

  /** Disconnects from the connector and clears public key state */
  disconnect: () => Promise<boolean>;

  /** Sets the current selected public key */
  selectPublicKey: (pubKey: string) => void;

  /** Sign and send a transaction to the network */
  sendTx: (
    /** Public key to use in connected wallet */
    pubKey: string,
    /** Transaction payload */
    transaction: Transaction
  ) => Promise<TransactionResponse | null>;
}

export const VegaWalletContext = createContext<
  VegaWalletContextShape | undefined
>(undefined);
