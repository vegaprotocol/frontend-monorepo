import { ethers } from 'ethers';
import { sha3_256 } from 'js-sha3';
import type { Transaction } from './connectors';
import { removeDecimal, toNanoSeconds } from '@vegaprotocol/react-helpers';
import type { OrderSubmissionBody } from './connectors/vega-connector';
import * as Schema from '@vegaprotocol/types';

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
  order: OrderSubmissionBody['orderSubmission'],
  decimalPlaces: number,
  positionDecimalPlaces: number
): OrderSubmissionBody['orderSubmission'] => ({
  ...order,
  price:
    order.type === Schema.OrderType.TYPE_LIMIT && order.price
      ? removeDecimal(order.price, decimalPlaces)
      : undefined,
  size: removeDecimal(order.size, positionDecimalPlaces),
  expiresAt:
    order.expiresAt &&
    order.timeInForce === Schema.OrderTimeInForce.TIME_IN_FORCE_GTT
      ? toNanoSeconds(order.expiresAt)
      : undefined,
});
