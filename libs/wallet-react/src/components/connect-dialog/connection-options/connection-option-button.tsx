import { type ReactNode, forwardRef } from 'react';
import { type ConnectorType } from '@vegaprotocol/wallet';
import { ConnectorIcon } from './connector-icon';

const CONNECTION_OPTION_CLASSES =
  'w-full flex gap-2 items-center p-2 rounded first-letter:capitalize hover:bg-surface-1';
const CONNECTION_OPTION_CLASSES_DESC =
  'w-full flex gap-2 items-start p-4 rounded first-letter:capitalize hover:bg-surface-1';

export const ConnectionOptionButton = forwardRef<
  HTMLButtonElement,
  {
    children: ReactNode;
    id: ConnectorType;
    onClick: () => void;
  }
>(({ children, id, onClick }, ref) => {
  return (
    <button
      className={CONNECTION_OPTION_CLASSES}
      onClick={onClick}
      data-testid={`connector-${id}`}
      ref={ref}
    >
      <ConnectorIcon id={id} />
      {children}
    </button>
  );
});

export const ConnectionOptionButtonWithDescription = forwardRef<
  HTMLButtonElement,
  {
    children: ReactNode;
    id: ConnectorType;
    onClick: () => void;
  }
>(({ children, id, onClick }, ref) => {
  return (
    <button
      className={CONNECTION_OPTION_CLASSES_DESC}
      onClick={onClick}
      ref={ref}
    >
      <span>
        <ConnectorIcon id={id} />
      </span>
      {children}
    </button>
  );
});
