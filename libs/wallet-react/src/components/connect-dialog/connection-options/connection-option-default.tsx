import { Tooltip } from '@vegaprotocol/ui-toolkit';
import {
  ConnectionOptionButton,
  ConnectionOptionButtonWithDescription,
} from './connection-option-button';
import { ConnectorIcon } from './connector-icon';
import { type ConnectionOptionProps } from './types';

export const ConnectionOptionDefault = ({
  id,
  name,
  description,
  showDescription = false,
  onClick,
}: ConnectionOptionProps) => {
  if (showDescription) {
    return (
      <ConnectionOptionButtonWithDescription
        onClick={onClick}
        icon={<ConnectorIcon id={id} />}
      >
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
        <ConnectionOptionButton
          icon={<ConnectorIcon id={id} />}
          id={id}
          onClick={onClick}
        >
          {name}
        </ConnectionOptionButton>
      </span>
    </Tooltip>
  );
};
