import {
  cn,
  getIntentBackground,
  getIntentBorder,
  Intent,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import type { HTMLAttributes, ReactNode } from 'react';
import { ColourfulBorder } from '../../utils/border';

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
        'relative flex gap-2 items-center pl-3 pr-2 h-12',
        'text-xs leading-tight font-normal',
        { border: !isPrimary },
        isPrimary ? undefined : getIntentBackground(intent),
        isPrimary ? undefined : getIntentBorder(intent),
        className
      )}
      {...props}
    >
      {intent === Intent.Primary && <ColourfulBorder />}
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
