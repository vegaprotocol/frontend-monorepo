import { t } from '@vegaprotocol/react-helpers';
import type { WalletClientError } from '@vegaprotocol/wallet-client';
import { WalletClient } from '@vegaprotocol/wallet-client';
import { clearConfig, getConfig, setConfig } from '../storage';
import type { Transaction, VegaConnector } from './vega-connector';
import { WalletError } from './vega-connector';

export const BrowserClientErrors = {
  NO_SERVICE: new WalletError(t('No service'), 100),
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
} as const;

export class BrowserConnector implements VegaConnector {
  url: null;
  reqId = 0;
  client?: WalletClient;

  constructor() {
    this.url = null;
    const cfg = getConfig();

    if (cfg && cfg.connector === 'browser') {
      this.initialize();
      this.connectWallet();
    }
  }

  initialize() {
    if (!this.client) {
      try {
        this.client = new WalletClient({
          type: 'browser',
          firefoxId: '62739efdd16a15a5ff4527bcd08fe6302b18b752@temporary-addon',
          chromeId: 'pebgkinfegfpnkamklihgpeolleghngl',
        });
      } catch (err) {
        throw BrowserClientErrors.NO_SERVICE;
      }
    }
  }

  async getChainId() {
    if (!this.client) {
      throw BrowserClientErrors.NO_CLIENT;
    }
    try {
      return await this.client.GetChainId();
    } catch (err) {
      const {
        code = BrowserClientErrors.UNKNOWN.code,
        message = BrowserClientErrors.UNKNOWN.message,
        title,
      } = err as WalletClientError;
      throw new WalletError(title, code, message);
    }
  }

  async connectWallet() {
    if (!this.client) {
      throw BrowserClientErrors.NO_CLIENT;
    }

    try {
      await this.client.ConnectWallet();
      return null;
    } catch (err) {
      const {
        code = BrowserClientErrors.UNKNOWN.code,
        message = BrowserClientErrors.UNKNOWN.message,
        title,
      } = err as WalletClientError;
      throw new WalletError(title, code, message);
    }
  }

  // connect actually calling list_keys here, not to be confused with connect_wallet
  // which retrieves the session token
  async connect() {
    if (!this.client) {
      throw BrowserClientErrors.NO_CLIENT;
    }

    try {
      const result = await this.client.ListKeys();
      return result.keys;
    } catch (err) {
      const {
        code = BrowserClientErrors.UNKNOWN.code,
        message = BrowserClientErrors.UNKNOWN.message,
        title,
      } = err as WalletClientError;
      throw new WalletError(title, code, message);
    }
  }

  async disconnect() {
    if (!this.client) {
      throw BrowserClientErrors.NO_CLIENT;
    }

    await this.client.DisconnectWallet();
    clearConfig();
  }

  async sendTx(pubKey: string, transaction: Transaction) {
    if (!this.client) {
      throw BrowserClientErrors.NO_CLIENT;
    }

    const result = await this.client.SendTransaction({
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
    return true;
  }
}
