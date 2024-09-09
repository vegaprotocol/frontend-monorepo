import { type FunctionComponent } from 'react';
import { type ConnectorType } from '@vegaprotocol/wallet';
import { ConnectionOptionInjected } from './connection-option-injected';
import { ConnectionOptionQuickstart } from './connection-option-quickstart';
import { type ConnectionOptionProps } from '../types';

export const ConnectionOptionRecord: {
  [C in ConnectorType]?: FunctionComponent<ConnectionOptionProps>;
} = {
  injected: ConnectionOptionInjected,
  'embedded-wallet-quickstart': ConnectionOptionQuickstart,
};
