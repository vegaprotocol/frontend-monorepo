import { type ReactNode, forwardRef } from 'react';
import { type ConnectorType } from '@vegaprotocol/wallet';
import { cn } from '@vegaprotocol/ui-toolkit';

const CONNECTION_OPTION_CLASSES =
  'w-full flex gap-2 items-center p-2 rounded first-letter:capitalize hover:bg-surface-1';
const CONNECTION_OPTION_CLASSES_DESC =
  'w-full flex gap-2 items-start p-4 rounded first-letter:capitalize hover:bg-surface-1';

export const ConnectionOptionLink = forwardRef<
  HTMLAnchorElement,
  {
    children: ReactNode;
    id: ConnectorType;
    href?: string;
    onClick?: () => void;
    icon?: ReactNode;
  }
>(({ children, id, icon, href, onClick }, ref) => {
  const props = {
    ref,
    'data-testid': `connector-${id}`,
    target: '_blank',
    rel: 'noreferrer',
    onClick,
  };

  if (href) {
    return (
      <a {...props} href={href}>
        {icon}
        {children}
      </a>
    );
  }

  return (
    <a
      {...props}
      aria-disabled={true}
      className={cn(CONNECTION_OPTION_CLASSES, 'opacity-40')}
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
    href?: string;
    icon?: ReactNode;
    onClick?: () => void;
  }
>(({ children, icon, href, onClick }, ref) => {
  const props = {
    ref,
    target: '_blank',
    rel: 'noreferrer',
    onClick,
  };

  if (href) {
    return (
      <a {...props} href={href}>
        {icon}
        {children}
      </a>
    );
  }

  return (
    <a
      {...props}
      aria-disabled={true}
      className={cn(CONNECTION_OPTION_CLASSES_DESC, 'opacity-40')}
    >
      {icon}
      {children}
    </a>
  );
});
