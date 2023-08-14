import { removeDecimal, toNanoSeconds } from '@vegaprotocol/utils';
import type { Market, Order } from '@vegaprotocol/types';
import { AccountType } from '@vegaprotocol/types';
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { sha3_256 } from 'js-sha3';
import type { OrderAmendment, Transaction, Transfer } from './connectors';
import type { Exact } from 'type-fest';

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

export const normalizeOrderAmendment = <T extends Exact<OrderAmendment, T>>(
  order: Pick<Order, 'id' | 'timeInForce' | 'size' | 'expiresAt'>,
  market: Pick<Market, 'id' | 'decimalPlaces' | 'positionDecimalPlaces'>,
  price: string,
  size: string
): OrderAmendment => ({
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

export const isBrowserWalletInstalled = () => Boolean(window.vega);
