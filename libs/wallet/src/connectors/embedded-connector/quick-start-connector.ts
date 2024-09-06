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
    try {
      const res = await QuickStartConnector.adminClient.request(
        'admin.import_wallet',
        {
          recoveryPhrase: mnemonic,
          name: 'Wallet',
        }
      );
      // eslint-disable-next-line no-console
      console.log(res);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    }
  }
}
