import { type ReactNode, forwardRef } from 'react';
import { type ConnectorType } from '@vegaprotocol/wallet';

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
    icon?: ReactNode;
  }
>(({ children, id, icon, href, onClick }, ref) => {
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
      {icon}
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
    icon?: ReactNode;
    onClick?: () => void;
  }
>(({ children, icon, href, onClick }, ref) => {
  return (
    <a
      ref={ref}
      className={CONNECTION_OPTION_CLASSES_DESC}
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={onClick}
    >
      {icon}
      {children}
    </a>
  );
});
