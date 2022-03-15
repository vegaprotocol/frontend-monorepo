import {
  VegaKey,
  OrderSubmissionBody,
  TransactionResponse,
} from '@vegaprotocol/vegawallet-service-api-client';
import { createContext } from 'react';
import { VegaConnector } from './connectors';

export type SendTxError =
  | {
      error: string;
    }
  | {
      errors: object;
    };

export interface VegaKeyExtended extends VegaKey {
  name: string;
}

export interface VegaWalletContextShape {
  /** The current select public key */
  keypair: VegaKeyExtended | null;

  /** Public keys stored in users wallet */
  keypairs: VegaKeyExtended[] | null;

  /** Calls connect on the supplied connector, storing the returned keys  */
  connect: (connector: VegaConnector) => Promise<VegaKey[] | null>;

  /** Disconnects from the connector and clears public key state */
  disconnect: () => Promise<boolean>;

  /** Sets the current selected public key */
  selectPublicKey: (publicKey: string) => void;

  /** Reference to the connector */
  connector: VegaConnector | null;

  /** Send a transaction to the network, only order submissions for now */
  sendTx: (
    body: OrderSubmissionBody
  ) => Promise<TransactionResponse | SendTxError> | null;
}

export const VegaWalletContext = createContext<
  VegaWalletContextShape | undefined
>(undefined);
