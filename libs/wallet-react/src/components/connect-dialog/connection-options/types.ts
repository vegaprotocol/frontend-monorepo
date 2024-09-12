import { type Connector, type ConnectorType } from '@vegaprotocol/wallet';

export interface ConnectionOptionProps {
  id: ConnectorType;
  name: string;
  description: string;
  showDescription?: boolean;
  onClick: () => void;
  onInstall?: () => void;
  connector: Connector;
}
