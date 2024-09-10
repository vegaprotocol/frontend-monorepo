import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from 'react';
import { type ConnectorType } from '@vegaprotocol/wallet';

const CONNECTION_OPTION_CLASSES =
  'w-full flex gap-2 items-center p-2 rounded first-letter:capitalize hover:bg-surface-1 text-sm';
const CONNECTION_OPTION_CLASSES_DESC =
  'w-full flex gap-2 items-start p-4 rounded first-letter:capitalize hover:bg-surface-1 text-sm';

export const ConnectionOptionButton = forwardRef<
  HTMLButtonElement,
  {
    children: ReactNode;
    id: ConnectorType;
    icon?: ReactNode;
  } & ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, id, icon, ...props }, ref) => {
  return (
    <button
      className={CONNECTION_OPTION_CLASSES}
      data-testid={`connector-${id}`}
      ref={ref}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
});

export const ConnectionOptionButtonWithDescription = forwardRef<
  HTMLButtonElement,
  {
    children: ReactNode;
    onClick: () => void;
    icon?: ReactNode;
  }
>(({ children, onClick, icon }, ref) => {
  return (
    <button
      className={CONNECTION_OPTION_CLASSES_DESC}
      onClick={onClick}
      ref={ref}
    >
      {icon}
      {children}
    </button>
  );
});
