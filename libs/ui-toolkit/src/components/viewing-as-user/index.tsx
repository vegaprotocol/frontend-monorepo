import { type Status } from '@vegaprotocol/wallet';
import { NotificationBanner } from '../notification-banner';
import { Intent } from '../../utils/intent';
import { Button } from '../button';
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
  pubKey: string | undefined;
  disconnect: () => Promise<{ status: Status } | undefined>;
}

export const ViewingAsBanner = ({
  pubKey,
  disconnect,
}: ViewingAsBannerProps) => {
  const t = useT();
  return (
    <NotificationBanner>
      <div className="flex items-baseline justify-between">
        <span data-testid="view-banner">
          {t('Viewing as Vega user: {{pubKey}}', {
            pubKey: pubKey && truncateMiddle(pubKey),
          })}
        </span>
        <Button
          intent={Intent.None}
          size="xs"
          data-testid="exit-view"
          onClick={disconnect}
        >
          {t('Exit view as')}
        </Button>
      </div>
    </NotificationBanner>
  );
};
