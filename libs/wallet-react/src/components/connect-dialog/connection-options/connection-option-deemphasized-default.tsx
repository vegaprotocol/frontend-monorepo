import { Tooltip } from '@vegaprotocol/ui-toolkit';
import { ConnectionOptionButton } from './connection-option-button';
import { type ConnectorType } from '@vegaprotocol/wallet';

interface ConnectionOptionProps {
  id: ConnectorType;
  name: string;
  description: string;
  onClick: () => void;
  onInstall?: () => void;
}

export const ConnectionOptionDeemphasizedDefault = ({
  id,
  name,
  description,
  onClick,
}: ConnectionOptionProps) => {
  return (
    <Tooltip
      description={description}
      align="center"
      side="right"
      sideOffset={10}
      delayDuration={400}
    >
      <span className="underline text-muted-foreground">
        <ConnectionOptionButton id={id} onClick={onClick}>
          {name}
        </ConnectionOptionButton>
      </span>
    </Tooltip>
  );
};
