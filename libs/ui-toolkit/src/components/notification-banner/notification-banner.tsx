import {
  cn,
  getIntentBackground,
  getIntentBorder,
  Intent,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import type { HTMLAttributes, ReactNode } from 'react';

interface NotificationBanner {
  intent?: Intent;
  children?: ReactNode;
  onClose?: () => void;
  className?: string;
  icon?: ReactNode;
}

export const NotificationBanner = ({
  intent = Intent.None,
  icon,
  children,
  onClose,
  className,
  ...props
}: NotificationBanner & HTMLAttributes<HTMLDivElement>) => {
  const isPrimary = intent === Intent.Primary;
  return (
    <div
      className={cn(
        'relative flex gap-2 items-center pl-3 pr-2 h-20',
        'text-xs leading-tight font-normal',
        { border: !isPrimary },
        isPrimary ? undefined : getIntentBackground(intent),
        isPrimary ? undefined : getIntentBorder(intent),
        className
      )}
      {...props}
    >
      {intent === Intent.Primary && (
        <div
          style={{
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
          }}
          className={cn(
            'absolute inset-0 p-px bg-gradient-to-br rounded-lg pointer-events-none',
            'from-highlight to-highlight-secondary'
          )}
        />
      )}
      {icon}
      <div className="grow">{children}</div>
      {onClose ? (
        <button
          type="button"
          data-testid="notification-banner-close"
          onClick={onClose}
          className="p-2 -mr-2"
        >
          <VegaIcon name={VegaIconNames.CROSS} size={16} />
        </button>
      ) : null}
    </div>
  );
};
