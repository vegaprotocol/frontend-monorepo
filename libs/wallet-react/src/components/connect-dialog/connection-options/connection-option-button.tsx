import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from 'react';
import { type ConnectorType } from '@vegaprotocol/wallet';

const CONNECTION_OPTION_CLASSES =
  'w-full flex gap-2 items-center p-2 rounded first-letter:capitalize hover:bg-surface-1 text-sm disabled:opacity-40';
const CONNECTION_OPTION_CLASSES_DESC =
  'w-full flex gap-2 items-start p-4 rounded first-letter:capitalize hover:bg-surface-1 text-sm disabled:opacity-40';

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
  ButtonHTMLAttributes<HTMLButtonElement> & { icon?: ReactNode }
>((props, ref) => {
  return (
    <button {...props} className={CONNECTION_OPTION_CLASSES_DESC} ref={ref}>
      {props.icon}
      {props.children}
    </button>
  );
});
