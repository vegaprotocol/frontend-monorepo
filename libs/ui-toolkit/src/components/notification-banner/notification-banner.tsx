import classNames from 'classnames';
import { toastIconMapping } from '../toast';
import { Intent } from '../../utils/intent';
import { Icon } from '../icon';

interface NotificationBannerProps {
  intent?: Intent;
  children?: React.ReactNode;
  onClose?: () => void;
}

export const NotificationBanner = ({
  intent = Intent.None,
  children,
  onClose,
}: NotificationBannerProps) => {
  return (
    <div
      className={classNames(
        'flex items-center p-3 border-b min-h-[56px]',
        'text-[12px] leading-[16px] font-normal',
        {
          'bg-vega-light-100 dark:bg-vega-dark-100 ': intent === Intent.None,
          'bg-vega-blue-300 dark:bg-vega-blue-700': intent === Intent.Primary,
          'bg-vega-green-300 dark:bg-vega-green-700': intent === Intent.Success,
          'bg-vega-orange-300 dark:bg-vega-orange-700':
            intent === Intent.Warning,
          'bg-vega-pink-300 dark:bg-vega-pink-700': intent === Intent.Danger,
        },
        {
          'border-b-vega-light-200 dark:border-b-vega-dark-200 ':
            intent === Intent.None,

          'border-b-vega-blue-500 dark:border-b-vega-blue-500':
            intent === Intent.Primary,

          'border-b-vega-green-600 dark:border-b-vega-green-500':
            intent === Intent.Success,

          'border-b-vega-orange-500 dark:border-b-vega-orange-500':
            intent === Intent.Warning,

          'border-b-vega-pink-500 dark:border-b-vega-pink-500':
            intent === Intent.Danger,
        }
      )}
    >
      {intent === Intent.None ? null : (
        <Icon
          name={toastIconMapping[intent]}
          size={4}
          className={classNames('mr-2', {
            'text-vega-blue-500 dark:text-vega-blue-500':
              intent === Intent.Primary,

            'text-vega-green-600 dark:text-vega-green-500':
              intent === Intent.Success,

            'text-vega-orange-500 dark:text-vega-orange-500':
              intent === Intent.Warning,

            'text-vega-pink-500 dark:text-vega-pink-500':
              intent === Intent.Danger,
          })}
        />
      )}
      <div className="grow">{children}</div>
      {onClose ? (
        <button
          type="button"
          data-testid="notification-banner-close"
          onClick={onClose}
          className="ml-2"
        >
          <Icon name="cross" size={4} className="dark:text-white" />
        </button>
      ) : null}
    </div>
  );
};
