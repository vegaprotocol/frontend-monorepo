import {
  VegaWalletOrderTimeInForce,
  VegaWalletOrderType,
  VegaWalletOrderSide,
} from '@vegaprotocol/wallet';
import { toDecimal } from '@vegaprotocol/react-helpers';
import type { Market } from '../market';

export type Order =
  | {
      size: string;
      type: VegaWalletOrderType.Market;
      timeInForce: VegaWalletOrderTimeInForce;
      side: VegaWalletOrderSide;
      price?: never;
      expiration?: never;
      rejectionReason?: string | null;
      market?: Market | null;
    }
  | {
      size: string;
      type: VegaWalletOrderType.Limit;
      timeInForce: VegaWalletOrderTimeInForce;
      side: VegaWalletOrderSide;
      price?: string;
      expiration?: Date;
      rejectionReason?: string | null;
      market?: Market | null;
    };

export const getDefaultOrder = (market: Market): Order => ({
  type: VegaWalletOrderType.Market,
  side: VegaWalletOrderSide.Buy,
  timeInForce: VegaWalletOrderTimeInForce.IOC,
  size: String(toDecimal(market.positionDecimalPlaces)),
  rejectionReason: null,
  market: null,
});
