import { Button } from '../button';
import { t } from '@vegaprotocol/i18n';

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
    <div
      data-testid="view-banner"
      className="w-full p-2 bg-neutral-800 flex justify-between text-neutral-400"
    >
      <div className="text-base flex items-center justify-center">
        {t('Viewing as Vega user:')} {pubKey && truncateMiddle(pubKey)}
      </div>
      <Button data-testid="exit-view" onClick={disconnect}>
        {t('Exit view as')}
      </Button>
    </div>
  );
};
