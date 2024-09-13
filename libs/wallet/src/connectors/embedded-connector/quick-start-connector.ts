import { JSONRPCClient } from '@vegaprotocol/json-rpc';
import { type Connector } from '../../types';
import { BrowserConnector } from './base-connector';

export class QuickStartConnector extends BrowserConnector implements Connector {
  readonly id = 'embedded-wallet-quickstart';
  name = 'Quickstart wallet';
  description =
    'Generate credentials using an Ethereum wallet and start using the network';
  prominent = true;

  static adminClient = new JSONRPCClient({
    idPrefix: 'vega.popup-',
    send(msg: unknown) {
      window.dispatchEvent(
        new CustomEvent('popup', {
          detail: msg,
        })
      );
    },
    onnotification: () => {},
  });

  private static onAdminMessage = (event: Event) => {
    const msg = (event as CustomEvent).detail;
    QuickStartConnector.adminClient.onmessage(msg);
  };

  /**
   *
   */
  constructor() {
    super();
    if (typeof window !== 'undefined') {
      window.removeEventListener(
        'popup-response',
        QuickStartConnector.onAdminMessage
      );
      window.addEventListener(
        'popup-response',
        QuickStartConnector.onAdminMessage
      );
    }
  }

  async importWallet(mnemonic: string) {
    await QuickStartConnector.adminClient.request('admin.import_wallet', {
      recoveryPhrase: mnemonic,
      name: 'Wallet',
    });
    await QuickStartConnector.adminClient.request('admin.generate_key', {
      wallet: 'Wallet',
    });
  }

  async deriveMnemonic(signedMessage: string) {
    const { derivedMnemonic } = (await QuickStartConnector.adminClient.request(
      'admin.create_derived_mnemonic',
      {
        signedData: signedMessage,
      }
    )) as unknown as { derivedMnemonic: string };
    return derivedMnemonic;
  }

  async hasWallet() {
    const res = (await QuickStartConnector.adminClient.request(
      'admin.app_globals',
      null
    )) as unknown as { wallet: boolean };
    return res.wallet;
  }
}
