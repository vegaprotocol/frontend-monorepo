import { removeDecimal, toNanoSeconds } from '@vegaprotocol/utils';
import * as Schema from '@vegaprotocol/types';
import type { Market, Order } from '@vegaprotocol/types';
import { OrderTimeInForce, OrderType } from '@vegaprotocol/types';
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { sha3_256 } from 'js-sha3';
import type { Transfer } from '@vegaprotocol/protos/dist/vega/commands/v1/Transfer';
import type { OrderSubmission } from '@vegaprotocol/protos/dist/vega/commands/v1/OrderSubmission';
import type { OrderAmendment } from '@vegaprotocol/protos/dist/vega/commands/v1/OrderAmendment';
import type { Transaction } from './connectors';
import type { Exact } from 'type-fest';
import { vega as vegaProtos } from '@vegaprotocol/protos';
import type { Side } from '@vegaprotocol/protos/dist/vega/Side';
import type { TimeInForce } from '@vegaprotocol/protos/dist/vega/Order/TimeInForce';
import type { Type } from '@vegaprotocol/protos/dist/vega/Order/Type';

export interface DealTicketOrderSubmission {
  marketId: string;
  reference?: string;
  type: Schema.OrderType;
  side: Schema.Side;
  timeInForce: Schema.OrderTimeInForce;
  size: string;
  price?: string;
  expiresAt?: string;
  postOnly?: boolean;
  reduceOnly?: boolean;
}

export interface DealTicketOrderAmendment {
  marketId: string;
  orderId: string;
  reference?: string;
  timeInForce: Schema.OrderTimeInForce;
  sizeDelta?: number;
  price?: string;
  expiresAt?: string;
}

/**
 * Creates an ID in the same way that core does on the backend. This way we
 * Can match up the newly created order with incoming orders via a subscription
 */
export const determineId = (sig: string) => {
  return sha3_256(ethers.utils.arrayify('0x' + sig));
};

/**
 * Base64 encode a transaction object
 */
export const encodeTransaction = (tx: Transaction): string => {
  return ethers.utils.base64.encode(
    ethers.utils.toUtf8Bytes(JSON.stringify(tx))
  );
};

export const normalizeOrderSubmission = (
  order: DealTicketOrderSubmission,
  decimalPlaces: number,
  positionDecimalPlaces: number
): DealTicketOrderSubmission => ({
  marketId: order.marketId,
  reference: order.reference,
  type: order.type,
  side: order.side,
  timeInForce: order.timeInForce,
  price:
    order.type === OrderType.TYPE_LIMIT && order.price
      ? removeDecimal(order.price, decimalPlaces)
      : undefined,
  size: removeDecimal(order.size, positionDecimalPlaces),
  expiresAt:
    order.expiresAt && order.timeInForce === OrderTimeInForce.TIME_IN_FORCE_GTT
      ? toNanoSeconds(order.expiresAt)
      : undefined,
  postOnly: order.postOnly,
  reduceOnly: order.reduceOnly,
});

export const normalizeOrderAmendment = <T extends Exact<OrderAmendment, T>>(
  order: Pick<Order, 'id' | 'timeInForce' | 'size' | 'expiresAt'>,
  market: Pick<Market, 'id' | 'decimalPlaces' | 'positionDecimalPlaces'>,
  price: string,
  size: string
): DealTicketOrderAmendment => ({
  orderId: order.id,
  marketId: market.id,
  price: removeDecimal(price, market.decimalPlaces),
  timeInForce: order.timeInForce,
  sizeDelta: size
    ? new BigNumber(removeDecimal(size, market.positionDecimalPlaces))
        .minus(order.size)
        .toNumber()
    : 0,
  expiresAt: order.expiresAt
    ? toNanoSeconds(order.expiresAt) // Wallet expects timestamp in nanoseconds
    : undefined,
});

export const normalizeTransfer = <T extends Exact<Transfer, T>>(
  address: string,
  amount: string,
  asset: {
    id: string;
    decimals: number;
  }
): Transfer => {
  return {
    fromAccountType: vegaProtos.AccountType.ACCOUNT_TYPE_GENERAL,
    to: address,
    toAccountType: vegaProtos.AccountType.ACCOUNT_TYPE_GENERAL,
    asset: asset.id,
    amount: removeDecimal(amount, asset.decimals),
    // oneOff or recurring required otherwise wallet will error
    // default oneOff is immediate transfer
    oneOff: {},
    // to be consistent with proto types
    kind: null,
    reference: '',
  } as Transfer;
};

const SideMap: Readonly<Record<Schema.Side, Side>> = {
  [Schema.Side.SIDE_BUY]: vegaProtos.Side.SIDE_BUY,
  [Schema.Side.SIDE_SELL]: vegaProtos.Side.SIDE_SELL,
  [Schema.Side.SIDE_UNSPECIFIED]: vegaProtos.Side.SIDE_UNSPECIFIED,
};

const TimeInForceMap: Readonly<Record<Schema.OrderTimeInForce, TimeInForce>> = {
  [Schema.OrderTimeInForce.TIME_IN_FORCE_FOK]:
    vegaProtos.Order.TimeInForce.TIME_IN_FORCE_FOK,
  [Schema.OrderTimeInForce.TIME_IN_FORCE_GFA]:
    vegaProtos.Order.TimeInForce.TIME_IN_FORCE_GFA,
  [Schema.OrderTimeInForce.TIME_IN_FORCE_GFN]:
    vegaProtos.Order.TimeInForce.TIME_IN_FORCE_GFN,
  [Schema.OrderTimeInForce.TIME_IN_FORCE_GTC]:
    vegaProtos.Order.TimeInForce.TIME_IN_FORCE_GTC,
  [Schema.OrderTimeInForce.TIME_IN_FORCE_GTT]:
    vegaProtos.Order.TimeInForce.TIME_IN_FORCE_GTT,
  [Schema.OrderTimeInForce.TIME_IN_FORCE_IOC]:
    vegaProtos.Order.TimeInForce.TIME_IN_FORCE_IOC,
};

const TypeMap: Readonly<Record<Schema.OrderType, Type>> = {
  [Schema.OrderType.TYPE_LIMIT]: vegaProtos.Order.Type.TYPE_LIMIT,
  [Schema.OrderType.TYPE_MARKET]: vegaProtos.Order.Type.TYPE_MARKET,
  [Schema.OrderType.TYPE_NETWORK]: vegaProtos.Order.Type.TYPE_NETWORK,
  // [undefined]: vegaProtos.Order.Type.TYPE_UNSPECIFIED,
};

export const convertDealTicketToOrderSubmission = (
  dealTicketOrder: DealTicketOrderSubmission
) => {
  return {
    ...dealTicketOrder,
    expiresAt: dealTicketOrder.expiresAt
      ? BigInt(dealTicketOrder.expiresAt)
      : null,
    size: BigInt(dealTicketOrder.size),
    side: SideMap[dealTicketOrder.side],
    timeInForce: TimeInForceMap[dealTicketOrder.timeInForce],
    type: TypeMap[dealTicketOrder.type],
  } as OrderSubmission;
};

export const convertDealTicketToOrderAmendment = (
  dealTicketOrder: DealTicketOrderAmendment
) => {
  return {
    ...dealTicketOrder,
    expiresAt: dealTicketOrder.expiresAt
      ? BigInt(dealTicketOrder.expiresAt)
      : null,
    timeInForce: TimeInForceMap[dealTicketOrder.timeInForce],
    sizeDelta: BigInt(dealTicketOrder.sizeDelta || 0),
  } as OrderAmendment;
};
