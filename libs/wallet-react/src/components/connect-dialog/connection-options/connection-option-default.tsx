import { Tooltip } from '@vegaprotocol/ui-toolkit';
import {
  ConnectionOptionButton,
  ConnectionOptionButtonWithDescription,
} from './connection-option-button';
import { type ConnectorType } from '@vegaprotocol/wallet';

interface ConnectionOptionProps {
  id: ConnectorType;
  name: string;
  description: string;
  showDescription?: boolean;
  onClick: () => void;
  onInstall?: () => void;
}

export const ConnectionOptionDefault = ({
  id,
  name,
  description,
  showDescription = false,
  onClick,
}: ConnectionOptionProps) => {
  if (showDescription) {
    return (
      <ConnectionOptionButtonWithDescription id={id} onClick={onClick}>
        <span className="flex flex-col justify-start text-left">
          <span className="first-letter:capitalize">{name}</span>
          <span className="text-surface-0-fg-muted text-sm">{description}</span>
        </span>
      </ConnectionOptionButtonWithDescription>
    );
  }

  return (
    <Tooltip
      description={description}
      align="center"
      side="right"
      sideOffset={10}
      delayDuration={400}
    >
      <span>
        <ConnectionOptionButton id={id} onClick={onClick}>
          {name}
        </ConnectionOptionButton>
      </span>
    </Tooltip>
  );
};
