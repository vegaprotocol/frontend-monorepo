import { cn } from '../../utils/cn';
import { toastIconMapping } from '../toast';
import { Intent } from '../../utils/intent';
import { Icon, VegaIcon, VegaIconNames } from '../icon';
import type { HTMLAttributes } from 'react';

interface NotificationBannerProps {
  intent?: Intent;
  children?: React.ReactNode;
  onClose?: () => void;
  className?: string;
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
        {
          'bg-gs-100 ': intent === Intent.None,
          'bg-vega-blue-300 dark:bg-vega-blue-700': intent === Intent.Primary,
          'bg-vega-green-300 dark:bg-vega-green-700': intent === Intent.Success,
          'bg-vega-orange-300 dark:bg-vega-orange-700':
            intent === Intent.Warning,
          'bg-vega-red-300 dark:bg-vega-red-700': intent === Intent.Danger,
        },
        {
          'border-b-gs-200': intent === Intent.None,

          'border-b-vega-blue-500 dark:border-b-vega-blue-500':
            intent === Intent.Primary,

          'border-b-vega-green-600 dark:border-b-vega-green-500':
            intent === Intent.Success,

          'border-b-vega-orange-500 dark:border-b-vega-orange-500':
            intent === Intent.Warning,

          'border-b-vega-red-500 dark:border-b-vega-red-500':
            intent === Intent.Danger,
        },
        className
      )}
      {...props}
    >
      {intent === Intent.None ? null : (
        <Icon
          name={toastIconMapping[intent]}
          size={4}
          className={cn('mr-2', {
            'text-vega-blue-500 dark:text-vega-blue-500':
              intent === Intent.Primary,

            'text-vega-green-600 dark:text-vega-green-500':
              intent === Intent.Success,

            'text-vega-orange-500 dark:text-vega-orange-500':
              intent === Intent.Warning,

            'text-vega-red-500 dark:text-vega-red-500':
              intent === Intent.Danger,
          })}
        />
      )}
      <div className="grow py-2">{children}</div>
      {onClose ? (
        <button
          type="button"
          data-testid="notification-banner-close"
          onClick={onClose}
          className="p-2 -mr-2 dark:text-white"
        >
          <VegaIcon name={VegaIconNames.CROSS} size={14} />
        </button>
      ) : null}
    </div>
  );
};
