import { Side } from '@vegaprotocol/types';
import { useTicketContext } from '../ticket-context';
import { useT } from '../../../lib/use-t';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useOpenVolume } from '@vegaprotocol/positions';
import { useActiveOrders, useActiveStopOrders } from '@vegaprotocol/orders';
import { useNetworkParam } from '@vegaprotocol/network-parameters';
import { useForm } from '../use-form';
import BigNumber from 'bignumber.js';

export const FeedbackStop = () => {
  const { pubKey } = useVegaWallet();
  const ticket = useTicketContext('default');
  const form = useForm('stopLimit');

  const { param: maxStopOrders } = useNetworkParam(
    'spam_protection_max_stopOrdersPerMarket'
  );

  const { data: activeStopOrders } = useActiveStopOrders(
    pubKey,
    ticket.market.id,
    !form.formState.isDirty && !form.formState.submitCount
  );
  const { openVolume } = useOpenVolume(pubKey, ticket.market.id) || {};
  const { data: activeOrders } = useActiveOrders(pubKey, ticket.market.id);

  const side = form.watch('side');
  const oco = form.watch('oco');

  if (!pubKey) return null;
  if (!maxStopOrders) return null;

  // Check if current active stop orders + the new stop order (and oco) will go over
  // the limit set by spam protection
  if ((activeStopOrders?.length ?? 0) + (oco ? 2 : 1) > Number(maxStopOrders)) {
    return <MaxStopOrdersPerMarket max={maxStopOrders} />;
  }

  const volume = BigNumber(openVolume || '0');
  const remaining = activeOrders
    ? activeOrders.reduce((sum, o) => {
        if (o.side === side) {
          return sum.plus(o.remaining);
        }
        return sum;
      }, BigNumber(0))
    : BigNumber(0);

  if (
    side === Side.SIDE_BUY &&
    volume.minus(remaining).isGreaterThanOrEqualTo(0)
  ) {
    return <OrderNotReducing />;
  }

  if (
    side === Side.SIDE_SELL &&
    volume.plus(remaining).isLessThanOrEqualTo(0)
  ) {
    return <OrderNotReducing />;
  }
};

const MaxStopOrdersPerMarket = ({ max }: { max: string }) => {
  const t = useT();
  return (
    <p>
      {t(
        'There is a limit of {{max}} active stop orders per market. Orders submitted above the limit will be immediately rejected.',
        {
          max,
        }
      )}
    </p>
  );
};

const OrderNotReducing = () => {
  const t = useT();
  return (
    <p data-testid="stop-order-warning-position">
      {t(
        'Stop orders are reduce only and this order would increase your position.'
      )}
    </p>
  );
};
