import { t } from '@vegaprotocol/react-helpers';
import { WalletClient, WalletClientError } from '@vegaprotocol/wallet-client';
import { clearConfig, getConfig, setConfig } from '../storage';
import type { Transaction, VegaConnector } from './vega-connector';
import { WalletError } from './vega-connector';

const VERSION = 'v2';

export const ClientErrors = {
  NO_SERVICE: new WalletError(t('No service'), 100),
  NO_TOKEN: new WalletError(t('No token'), 101),
  INVALID_RESPONSE: new WalletError(t('Something went wrong'), 102),
  INVALID_WALLET: new WalletError(t('Wallet version invalid'), 103),
  WRONG_NETWORK: new WalletError(
    t('Wrong network'),
    104,
    t('App is configured to work with a different chain')
  ),
  UNKNOWN: new WalletError(
    t('Something went wrong'),
    105,
    t('Unknown error occurred')
  ),
  NO_CLIENT: new WalletError(t('No client found.'), 106),
  REQUEST_REJECTED: new WalletError(
    t('Request rejected'),
    107,
    t('The request has been rejected by the user')
  ),
} as const;

export class JsonRpcConnector implements VegaConnector {
  version = VERSION;
  private _url: string | null = null;
  token: string | null = null;
  reqId = 0;
  client?: WalletClient;

  constructor() {
    const cfg = getConfig();

    this.token = cfg?.token ?? null;

    if (cfg && cfg.url) {
      this.url = cfg.url;
      this.client = new WalletClient({
        address: cfg.url,
        token: cfg.token ?? undefined,
        onTokenChange: (token) => {
          setConfig({
            token,
            connector: 'jsonRpc',
            url: this._url,
          });
        },
      });
    }
  }

  set url(url: string) {
    this._url = url;
    this.client = new WalletClient({
      address: url,
      token: this.token ?? undefined,
      onTokenChange: (token) =>
        setConfig({
          token,
          url,
          connector: 'jsonRpc',
        }),
    });
  }

  async getChainId() {
    if (!this.client) {
      throw ClientErrors.NO_CLIENT;
    }
    try {
      const { result } = await this.client.GetChainId();
      return result;
    } catch (err) {
      throw ClientErrors.INVALID_RESPONSE;
    }
  }

  async connectWallet() {
    if (!this.client) {
      throw ClientErrors.NO_CLIENT;
    }

    try {
      await this.client.ConnectWallet();
      return null;
    } catch (err) {
      const clientErr =
        err instanceof WalletClientError && err.code === 3001
          ? ClientErrors.REQUEST_REJECTED
          : ClientErrors.INVALID_RESPONSE;
      throw clientErr;
    }
  }

  // connect actually calling list_keys here, not to be confused with connect_wallet
  // which retrieves the session token
  async connect() {
    if (!this.client) {
      throw ClientErrors.NO_CLIENT;
    }

    try {
      const { result } = await this.client.ListKeys();
      return result.keys;
    } catch (err) {
      throw ClientErrors.INVALID_RESPONSE;
    }
  }

  async disconnect() {
    if (!this.client) {
      throw ClientErrors.NO_CLIENT;
    }

    await this.client.DisconnectWallet();
    clearConfig();
  }

  async sendTx(pubKey: string, transaction: Transaction) {
    if (!this.client) {
      throw ClientErrors.NO_CLIENT;
    }

    const { result } = await this.client.SendTransaction({
      publicKey: pubKey,
      sendingMode: 'TYPE_SYNC',
      transaction,
    });

    return {
      transactionHash: result.transactionHash,
      sentAt: result.sentAt,
      receivedAt: result.receivedAt,
      signature: result.transaction.signature.value,
    };
  }

  async checkCompat() {
    try {
      const result = await fetch(`${this._url}/api/${this.version}/methods`);
      if (!result.ok) {
        const err = ClientErrors.INVALID_WALLET;
        err.data = [
          t('The wallet running at %s is not supported.', this._url as string),
          t("It doesn't expose the API version %s.", this.version),
          t(
            'Update the wallet software to a version that expose the API version %s.',
            this.version
          ),
        ];
        throw err;
      }
      return true;
    } catch (err) {
      if (err instanceof WalletError) {
        throw err;
      }

      throw ClientErrors.NO_SERVICE;
    }
  }
}
