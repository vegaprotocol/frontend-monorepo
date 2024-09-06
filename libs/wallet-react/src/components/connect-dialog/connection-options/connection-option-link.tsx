import { type ReactNode, forwardRef } from 'react';
import { type ConnectorType } from '@vegaprotocol/wallet';
import { ConnectorIcon } from './connector-icon';

const CONNECTION_OPTION_CLASSES =
  'w-full flex gap-2 items-center p-2 rounded first-letter:capitalize hover:bg-surface-1';
const CONNECTION_OPTION_CLASSES_DESC =
  'w-full flex gap-2 items-start p-4 rounded first-letter:capitalize hover:bg-surface-1';

export const ConnectionOptionLink = forwardRef<
  HTMLAnchorElement,
  {
    children: ReactNode;
    id: ConnectorType;
    href: string;
    onClick?: () => void;
  }
>(({ children, id, href, onClick }, ref) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={CONNECTION_OPTION_CLASSES}
      data-testid={`connector-${id}`}
      ref={ref}
      onClick={onClick}
    >
      <ConnectorIcon id={id} />
      {children}
    </a>
  );
});

export const ConnectionOptionLinkWithDescription = forwardRef<
  HTMLAnchorElement,
  {
    children: ReactNode;
    id: ConnectorType;
    href: string;

    onClick?: () => void;
  }
>(({ children, id, href, onClick }, ref) => {
  return (
    <a
      ref={ref}
      className={CONNECTION_OPTION_CLASSES_DESC}
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={onClick}
    >
      <span>
        <ConnectorIcon id={id} />
      </span>
      {children}
    </a>
  );
});
