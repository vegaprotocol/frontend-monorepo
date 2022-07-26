import {
  VegaWalletOrderTimeInForce,
  VegaWalletOrderType,
  VegaWalletOrderSide,
} from '@vegaprotocol/wallet';
import { toDecimal } from '@vegaprotocol/react-helpers';
import type { Order, Market } from '../order-hooks';

export const getDefaultOrder = (market: Market): Order => ({
  type: VegaWalletOrderType.Market,
  side: VegaWalletOrderSide.Buy,
  timeInForce: VegaWalletOrderTimeInForce.IOC,
  size: String(toDecimal(market.positionDecimalPlaces)),
});
