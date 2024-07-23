import { OrderType, Side } from '@vegaprotocol/types';
import { useTicketContext } from '../ticket-context';
import { useT } from '../../../lib/use-t';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useOpenVolume } from '@vegaprotocol/positions';
import { useActiveOrders, useActiveStopOrders } from '@vegaprotocol/orders';
import { useNetworkParam } from '@vegaprotocol/network-parameters';
import { useForm } from '../use-form';
import BigNumber from 'bignumber.js';
import {
  isMarketClosed,
  isMarketInAuction,
  useLastTradePrice,
  useMarketState,
  useMarketTradingMode,
} from '@vegaprotocol/markets';

import * as Msg from '../feedback';
import { toBigNum } from '@vegaprotocol/utils';

export const FeedbackStop = () => {
  const { pubKey } = useVegaWallet();
  const ticket = useTicketContext('spot');
  const form = useForm('stopLimit');

  const { param: maxStopOrders } = useNetworkParam(
    'spam_protection_max_stopOrdersPerMarket'
  );

  const { data: marketState } = useMarketState(ticket.market.id);
  const { data: marketTradingMode } = useMarketTradingMode(ticket.market.id);
  const { data: activeStopOrders } = useActiveStopOrders(
    pubKey,
    ticket.market.id,
    !form.formState.isDirty && !form.formState.submitCount
  );
  const { openVolume } = useOpenVolume(pubKey, ticket.market.id) || {};
  const { data: activeOrders } = useActiveOrders(pubKey, ticket.market.id);

  const type = form.watch('type');
  const side = form.watch('side');
  const size = form.watch('size');
  const oco = form.watch('oco');
  const limitPrice = form.watch('price');

  const { data: lastTradePrice } = useLastTradePrice(ticket.market.id);

  const price =
    type === OrderType.TYPE_LIMIT
      ? BigNumber(limitPrice)
      : toBigNum(lastTradePrice || '0', ticket.market.decimalPlaces);

  if (marketState && isMarketClosed(marketState)) {
    return <Msg.MarketClosed marketState={marketState} />;
  }

  if (!pubKey) return null;
  if (!maxStopOrders) return null;

  const quoteBalance = toBigNum(
    ticket.accounts.quote,
    ticket.quoteAsset.decimals
  );
  const baseBalance = toBigNum(ticket.accounts.base, ticket.baseAsset.decimals);

  if (side === Side.SIDE_BUY) {
    const notional = price.times(size);
    if (quoteBalance.isLessThan(notional)) {
      return <Msg.NoCollateral asset={ticket.quoteAsset} />;
    }
  } else if (side === Side.SIDE_SELL) {
    if (baseBalance.isLessThan(size)) {
      return <Msg.NoCollateral asset={ticket.baseAsset} />;
    }
  }

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

  if (marketTradingMode && isMarketInAuction(marketTradingMode)) {
    return <Msg.MarketAuction marketTradingMode={marketTradingMode} />;
  }
};

const MaxStopOrdersPerMarket = ({ max }: { max: string }) => {
  const t = useT();
  return (
    <p className="text-xs text-warning">
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
    <p
      data-testid="stop-order-warning-position"
      className="text-xs text-warning"
    >
      {t(
        'Stop orders are reduce only and this order would increase your position.'
      )}
    </p>
  );
};
