import * as Schema from '@vegaprotocol/types';
import { ethers } from 'ethers';
import { sha3_256 } from 'js-sha3';
import type { Transaction } from './connectors';
import { vega as vegaProtos } from '@vegaprotocol/protos';
import type { Side } from '@vegaprotocol/protos/dist/vega/Side';
import type { TimeInForce } from '@vegaprotocol/protos/dist/vega/Order/TimeInForce';
import type { Type } from '@vegaprotocol/protos/dist/vega/Order';

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

export const SideMap: Readonly<Record<Schema.Side, Side>> = {
  [Schema.Side.SIDE_BUY]: vegaProtos.Side.SIDE_BUY,
  [Schema.Side.SIDE_SELL]: vegaProtos.Side.SIDE_SELL,
  [Schema.Side.SIDE_UNSPECIFIED]: vegaProtos.Side.SIDE_UNSPECIFIED,
};

export const SideRevertMap: Record<Side, Schema.Side> = Object.entries(
  SideMap
).reduce((agg, item) => {
  agg[item[1]] = item[0] as Schema.Side;
  return agg;
}, {} as Record<Side, Schema.Side>);

export const TimeInForceMap: Readonly<
  Record<Schema.OrderTimeInForce, TimeInForce>
> = {
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

export const TimeInForceRevertMap: Record<
  TimeInForce,
  Schema.OrderTimeInForce
> = Object.entries(TimeInForceMap).reduce((agg, item) => {
  agg[item[1]] = item[0] as Schema.OrderTimeInForce;
  return agg;
}, {} as Record<TimeInForce, Schema.OrderTimeInForce>);

export const TypeMap: Readonly<Record<Schema.OrderType, Type.Type>> = {
  [Schema.OrderType.TYPE_LIMIT]: vegaProtos.Order.Type.TYPE_LIMIT,
  [Schema.OrderType.TYPE_MARKET]: vegaProtos.Order.Type.TYPE_MARKET,
  [Schema.OrderType.TYPE_NETWORK]: vegaProtos.Order.Type.TYPE_NETWORK,
};

export const TypeRevertMap: Record<Type.Type, Schema.OrderType> =
  Object.entries(TypeMap).reduce((agg, item) => {
    agg[item[1]] = item[0] as Schema.OrderType;
    return agg;
  }, {} as Record<Type.Type, Schema.OrderType>);
