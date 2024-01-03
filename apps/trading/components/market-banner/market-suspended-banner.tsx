import { useT } from '../../lib/use-t';

export const MarketSuspendedBanner = () => {
  const t = useT();
  return <p>{t('Market was suspended by governance')}</p>;
};
