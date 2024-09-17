import { JSONRPCClient } from '@vegaprotocol/json-rpc';
import { type Connector } from '../../types';
import { BrowserConnector } from './base-connector';

export class InBrowserConnector extends BrowserConnector implements Connector {
  readonly id = 'embedded-wallet';
  name = 'Embedded wallet';
  description = 'Connect with the Embedded Wallet to get started quickly';
  prominent = false;

  private static onAdminMessage = (event: Event) => {
    const msg = (event as CustomEvent).detail;
    InBrowserConnector.adminClient.onmessage(msg);
  };

  /**
   *
   */
  constructor() {
    super();
    if (typeof window !== 'undefined') {
      window.removeEventListener(
        'popup-response',
        InBrowserConnector.onAdminMessage
      );
      window.addEventListener(
        'popup-response',
        InBrowserConnector.onAdminMessage
      );
    }
  }

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

  async hasWallet() {
    const res = (await InBrowserConnector.adminClient.request(
      'admin.app_globals',
      null
    )) as unknown as { wallet: boolean };
    return res.wallet;
  }
}
