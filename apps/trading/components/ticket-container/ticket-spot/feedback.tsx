import BigNumber from 'bignumber.js';

import { toBigNum } from '@vegaprotocol/utils';
import { OrderType, Side } from '@vegaprotocol/types';
import {
  isMarketClosed,
  isMarketInAuction,
  useMarkPrice,
  useMarketState,
  useMarketTradingMode,
} from '@vegaprotocol/markets';
import { useVegaWallet } from '@vegaprotocol/wallet-react';

import { useTicketContext } from '../ticket-context';
import { useForm } from '../use-form';

import * as Msg from '../feedback';

export const Feedback = () => {
  const { pubKey } = useVegaWallet();
  const ticket = useTicketContext('spot');
  const form = useForm('limit');

  const sizeMode = form.watch('sizeMode');
  const type = form.watch('type');
  const size = form.watch('size');
  const side = form.watch('side');
  const limitPrice = form.watch('price');

  const { data: markPrice } = useMarkPrice(ticket.market.id);
  const { data: marketState } = useMarketState(ticket.market.id);
  const { data: marketTradingMode } = useMarketTradingMode(ticket.market.id);

  if (!pubKey) return null;

  const price =
    type === OrderType.TYPE_LIMIT
      ? BigNumber(limitPrice)
      : toBigNum(markPrice || '0', ticket.market.decimalPlaces);

  const quoteBalance = toBigNum(
    ticket.accounts.quote,
    ticket.quoteAsset.decimals
  );
  const baseBalance = toBigNum(ticket.accounts.base, ticket.baseAsset.decimals);

  if (marketState && isMarketClosed(marketState)) {
    return <Msg.MarketClosed marketState={marketState} />;
  }

  if (sizeMode === 'contracts') {
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
  } else if (sizeMode === 'notional') {
    if (side === Side.SIDE_BUY) {
      if (quoteBalance.isLessThan(size)) {
        return <Msg.NoCollateral asset={ticket.quoteAsset} />;
      }
    } else if (side == Side.SIDE_SELL) {
      const actualSize = BigNumber(size).div(price).toString();
      if (baseBalance.isLessThan(actualSize)) {
        return <Msg.NoCollateral asset={ticket.baseAsset} />;
      }
    }
  }

  if (marketTradingMode && isMarketInAuction(marketTradingMode)) {
    return <Msg.MarketAuction marketTradingMode={marketTradingMode} />;
  }

  return null;
};
