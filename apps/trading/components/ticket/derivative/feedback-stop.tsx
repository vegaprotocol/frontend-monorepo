import { MarginMode, Side } from '@vegaprotocol/types';
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
  useMarketState,
  useMarketTradingMode,
} from '@vegaprotocol/markets';

import * as Msg from '../feedback';
import { toBigNum } from '@vegaprotocol/utils';
import { useEstimatePosition } from '../use-estimate-position';

export const FeedbackStop = () => {
  const { pubKey } = useVegaWallet();
  const ticket = useTicketContext('default');
  const form = useForm('stopLimit');

  const { param: maxStopOrders } = useNetworkParam(
    'spam_protection_max_stopOrdersPerMarket'
  );

  const { data: positionEstimate } = useEstimatePosition();
  const { data: marketState } = useMarketState(ticket.market.id);
  const { data: marketTradingMode } = useMarketTradingMode(ticket.market.id);
  const { data: activeStopOrders } = useActiveStopOrders(
    pubKey,
    ticket.market.id,
    !form.formState.isDirty && !form.formState.submitCount
  );
  const { openVolume } = useOpenVolume(pubKey, ticket.market.id) || {};
  const { data: activeOrders } = useActiveOrders(pubKey, ticket.market.id);

  const side = form.watch('side');
  const oco = form.watch('oco');

  const requiredCollateral = toBigNum(
    positionEstimate?.estimatePosition?.collateralIncreaseEstimate.bestCase ||
      '0',
    ticket.settlementAsset.decimals
  );

  const generalAccount = toBigNum(
    ticket.accounts.general,
    ticket.settlementAsset.decimals
  );
  const marginAccount = toBigNum(
    ticket.accounts.margin,
    ticket.settlementAsset.decimals
  );
  const orderMarginAccount = toBigNum(
    ticket.accounts.orderMargin,
    ticket.settlementAsset.decimals
  );

  if (marketState && isMarketClosed(marketState)) {
    return <Msg.MarketClosed marketState={marketState} />;
  }

  if (!pubKey) return null;
  if (!maxStopOrders) return null;

  if (ticket.marginMode.mode === MarginMode.MARGIN_MODE_CROSS_MARGIN) {
    if (
      generalAccount.isLessThanOrEqualTo(0) &&
      marginAccount.isLessThanOrEqualTo(0)
    ) {
      return <Msg.NoCollateral asset={ticket.settlementAsset} />;
    }
  } else if (
    ticket.marginMode.mode === MarginMode.MARGIN_MODE_ISOLATED_MARGIN
  ) {
    if (
      generalAccount.isLessThanOrEqualTo(0) &&
      orderMarginAccount.isLessThanOrEqualTo(0)
    ) {
      return <Msg.NoCollateral asset={ticket.settlementAsset} />;
    }
  }

  if (generalAccount.isLessThan(requiredCollateral)) {
    return (
      <Msg.NotEnoughCollateral
        requiredCollateral={requiredCollateral}
        availableCollateral={generalAccount}
        asset={ticket.settlementAsset}
      />
    );
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
    <p className="text-xs text-intent-warning">
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
      className="text-xs text-intent-warning"
    >
      {t(
        'Stop orders are reduce only and this order would increase your position.'
      )}
    </p>
  );
};
