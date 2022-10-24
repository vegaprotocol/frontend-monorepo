import { t } from '@vegaprotocol/react-helpers';
import { OrderTimeInForce } from '@vegaprotocol/types';

// More detail in https://docs.vega.xyz/docs/mainnet/graphql/enums/order-time-in-force
export const timeInForceLabel = (tif: string) => {
  switch (tif) {
    case OrderTimeInForce.TIME_IN_FORCE_GTC:
      return t(`Good 'til Cancelled (GTC)`);
    case OrderTimeInForce.TIME_IN_FORCE_IOC:
      return t('Immediate or Cancel (IOC)');
    case OrderTimeInForce.TIME_IN_FORCE_FOK:
      return t('Fill or Kill (FOK)');
    case OrderTimeInForce.TIME_IN_FORCE_GTT:
      return t(`Good 'til Time (GTT)`);
    case OrderTimeInForce.TIME_IN_FORCE_GFN:
      return t('Good for Normal (GFN)');
    case OrderTimeInForce.TIME_IN_FORCE_GFA:
      return t('Good for Auction (GFA)');
    default:
      return t(tif);
  }
};
