import { BigNumber } from 'bignumber.js';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import { addDecimal } from '@vegaprotocol/utils';
import * as Schema from '@vegaprotocol/types';
import type { Market, MarketData } from '@vegaprotocol/market-list';
import {
  useAccountBalance,
  useMarketAccountBalance,
} from '@vegaprotocol/accounts';
import { useMarketMargin } from '@vegaprotocol/positions';
import { useMarketPositions } from './use-market-positions';

interface Props {
  order: OrderSubmissionBody['orderSubmission'];
  market: Market;
  marketData: MarketData;
}

export const useOrderCloseOut = ({
  order,
  market,
  marketData,
}: Props): string | null => {
  const { accountBalance, accountDecimals } = useAccountBalance(
    market.tradableInstrument.instrument.product.settlementAsset.id
  );
  const { accountBalance: positionBalance, accountDecimals: positionDecimals } =
    useMarketAccountBalance(market.id);
  const maintenanceLevel = useMarketMargin(market.id);

  const marginMaintenanceLevel = new BigNumber(
    addDecimal(maintenanceLevel || 0, market.decimalPlaces)
  );
  const positionAccountBalance = new BigNumber(
    addDecimal(positionBalance || 0, positionDecimals || 0)
  );
  const generalAccountBalance = new BigNumber(
    addDecimal(accountBalance || 0, accountDecimals || 0)
  );
  const { openVolume } =
    useMarketPositions({
      marketId: market.id,
    }) || {};

  const volume = new BigNumber(
    addDecimal(openVolume || '0', market.positionDecimalPlaces)
  )[order.side === Schema.Side.SIDE_BUY ? 'plus' : 'minus'](order.size);
  const price =
    order.type === Schema.OrderType.TYPE_LIMIT && order.price
      ? new BigNumber(order.price)
      : new BigNumber(addDecimal(marketData.markPrice, market.decimalPlaces));
  // regarding formula (marginMaintenanceLevel - positionAccountBalance - generalAccountBalance) / volume + markPrice
  const marginDifference = marginMaintenanceLevel
    .minus(positionAccountBalance)
    .minus(generalAccountBalance);
  const closeOut = marginDifference.div(volume).plus(price);
  if (closeOut.isPositive()) {
    return closeOut.toString();
  }
  return null;
};
