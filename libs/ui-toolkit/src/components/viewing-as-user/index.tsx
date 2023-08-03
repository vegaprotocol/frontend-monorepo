import { t } from '@vegaprotocol/i18n';
import { NotificationBanner } from '../notification-banner';
import { Intent } from '../../utils/intent';
import { TradingButton } from '../trading-button';

export function truncateMiddle(address: string, start = 6, end = 4) {
  if (address.length < 11) return address;
  return (
    address.slice(0, start) +
    '\u2026' +
    address.slice(address.length - end, address.length)
  );
}

export interface ViewingAsBannerProps {
  pubKey: string | null;
  disconnect: () => Promise<void>;
}

export const ViewingAsBanner = ({
  pubKey,
  disconnect,
}: ViewingAsBannerProps) => {
  return (
    <NotificationBanner
      data-testid="view-banner"
      intent={Intent.None}
      className="!px-1 !py-1 min-h-fit"
    >
      <div className="flex justify-between items-baseline">
        <span>
          {t('Viewing as Vega user:')} {pubKey && truncateMiddle(pubKey)}{' '}
        </span>
        <TradingButton
          intent={Intent.None}
          size="extra-small"
          data-testid="exit-view"
          onClick={disconnect}
        >
          {t('Exit view as')}
        </TradingButton>
      </div>
    </NotificationBanner>
  );
};
