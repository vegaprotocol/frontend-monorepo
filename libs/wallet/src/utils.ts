import { removeDecimal, toNanoSeconds } from '@vegaprotocol/react-helpers';
import type { Market, Order } from '@vegaprotocol/types';
import { OrderTimeInForce, OrderType, AccountType } from '@vegaprotocol/types';
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { sha3_256 } from 'js-sha3';
import type {
  OrderAmendmentBody,
  OrderSubmissionBody,
  Transaction,
  Transfer,
} from './connectors';

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
    order.type === OrderType.TYPE_LIMIT && order.price
      ? removeDecimal(order.price, decimalPlaces)
      : undefined,
  size: removeDecimal(order.size, positionDecimalPlaces),
  expiresAt:
    order.expiresAt && order.timeInForce === OrderTimeInForce.TIME_IN_FORCE_GTT
      ? toNanoSeconds(order.expiresAt)
      : undefined,
});

export const normalizeOrderAmendment = (
  order: Pick<Order, 'id' | 'timeInForce' | 'size' | 'expiresAt'>,
  market: Pick<Market, 'id' | 'decimalPlaces' | 'positionDecimalPlaces'>,
  price: string,
  size: string
): OrderAmendmentBody['orderAmendment'] => ({
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

export const normalizeTransfer = (
  address: string,
  amount: string,
  asset: {
    id: string;
    decimals: number;
  }
): Transfer => {
  return {
    fromAccountType: AccountType.ACCOUNT_TYPE_GENERAL,
    to: address,
    toAccountType: AccountType.ACCOUNT_TYPE_GENERAL,
    asset: asset.id,
    amount: removeDecimal(amount, asset.decimals),
    // oneOff or recurring required otherwise wallet will error
    // default oneOff is immediate transfer
    oneOff: {},
  };
};
