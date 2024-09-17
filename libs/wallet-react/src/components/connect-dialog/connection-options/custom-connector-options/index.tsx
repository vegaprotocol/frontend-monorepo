import { type FunctionComponent } from 'react';
import { type ConnectorType } from '@vegaprotocol/wallet';
import { ConnectionOptionInjected } from './connection-option-injected';
import { ConnectionOptionQuickstart } from './connection-option-quickstart';
import { type ConnectionOptionProps } from '../types';
import { ConnectionOptionEmbeddedWallet } from './connection-option-embedded';

export const ConnectionOptionRecord: {
  [C in ConnectorType]?: FunctionComponent<ConnectionOptionProps>;
} = {
  injected: ConnectionOptionInjected,
  'embedded-wallet-quickstart': ConnectionOptionQuickstart,
  'embedded-wallet': ConnectionOptionEmbeddedWallet,
};
