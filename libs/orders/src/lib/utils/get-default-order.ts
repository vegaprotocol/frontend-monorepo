import {
  VegaWalletOrderTimeInForce,
  VegaWalletOrderType,
  VegaWalletOrderSide,
} from '@vegaprotocol/wallet';
import { toDecimal } from '@vegaprotocol/react-helpers';
import type { Market } from '../market';
import type { OrderStatus } from '@vegaprotocol/types';

export type Order = {
  size: string;
  type: VegaWalletOrderType.Limit | VegaWalletOrderType.Market;
  timeInForce: VegaWalletOrderTimeInForce;
  side: VegaWalletOrderSide;
  price?: string;
  expiration?: Date;
  rejectionReason?: string | null;
  market?: Market | null;
  status?: OrderStatus | null;
};

export const getDefaultOrder = (market: Market): Order => ({
  type: VegaWalletOrderType.Market,
  side: VegaWalletOrderSide.Buy,
  timeInForce: VegaWalletOrderTimeInForce.IOC,
  size: String(toDecimal(market.positionDecimalPlaces)),
  rejectionReason: null,
  market: null,
});
