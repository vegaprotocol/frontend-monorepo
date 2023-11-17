import { NotificationBanner, SHORT } from '../notification-banner';
import { Intent } from '../../utils/intent';
import { TradingButton } from '../trading-button';
import { useT } from '../../use-t';

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
  const t = useT();
  return (
    <NotificationBanner intent={Intent.None} className={SHORT}>
      <div className="flex items-baseline justify-between">
        <span data-testid="view-banner">
          {t('Viewing as Vega user: {{pubKey}}', {
            pubKey: pubKey && truncateMiddle(pubKey),
          })}
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
