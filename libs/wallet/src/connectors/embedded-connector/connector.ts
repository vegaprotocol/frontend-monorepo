import { type Connector } from '../../types';
import { BrowserConnector } from './base-connector';

export class InBrowserConnector extends BrowserConnector implements Connector {
  readonly id = 'embedded-wallet';
  name = 'Embedded wallet';
  description = 'Connect with the Embedded Wallet to get started quickly';
  prominent = false;
}
