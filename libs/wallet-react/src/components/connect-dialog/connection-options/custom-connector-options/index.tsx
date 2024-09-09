import { type FunctionComponent } from 'react';
import { type Connector, type ConnectorType } from '@vegaprotocol/wallet';
import { ConnectionOptionInjected } from './connection-option-injected';
import { ConnectionOptionQuickstart } from './connection-option-quickstart';

interface ConnectionOptionProps {
  id: ConnectorType;
  name: string;
  description: string;
  showDescription?: boolean;
  onClick: () => void;
  onInstall?: () => void;
  connector: Connector;
}

export const ConnectionOptionRecord: {
  [C in ConnectorType]?: FunctionComponent<ConnectionOptionProps>;
} = {
  injected: ConnectionOptionInjected,
  'embedded-wallet-quickstart': ConnectionOptionQuickstart,
};
