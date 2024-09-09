import { cn } from '../../utils/cn';
import { toastIconMapping } from '../toast';
import {
  getIntentBackground,
  getIntentBorder,
  getIntentText,
  Intent,
} from '../../utils/intent';
import { Icon, VegaIcon, VegaIconNames } from '../icon';
import type { HTMLAttributes, ReactNode } from 'react';

interface NotificationBannerProps {
  intent?: Intent;
  children?: React.ReactNode;
  onClose?: () => void;
  className?: string;
  prefixElement?: ReactNode;
}

export const NotificationBanner = ({
  intent = Intent.None,
  children,
  onClose,
  className,
  ...props
}: NotificationBannerProps & HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        'flex items-center border-b pl-3 pr-2',
        'text-xs leading-tight font-normal',
        getIntentBackground(intent),
        getIntentBorder(intent),
        className
      )}
      {...props}
    >
      {props.prefixElement}
      {intent === Intent.None || props.prefixElement ? null : (
        <Icon
          name={toastIconMapping[intent]}
          size={4}
          className={cn('mr-2', getIntentText(intent))}
        />
      )}
      <div className="grow py-2">{children}</div>
      {onClose ? (
        <button
          type="button"
          data-testid="notification-banner-close"
          onClick={onClose}
          className="p-2 -mr-2"
        >
          <VegaIcon name={VegaIconNames.CROSS} size={14} />
        </button>
      ) : null}
    </div>
  );
};
