import { removeDecimal, toNanoSeconds } from '@vegaprotocol/utils';
import { type AccountType, type Market, type Order } from '@vegaprotocol/types';
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { sha3_256 } from 'js-sha3';
import type { Exact } from 'type-fest';
import {
  type ApplyReferralCode,
  type BatchMarketInstructionSubmissionBody,
  type CreateReferralSet,
  type OrderAmendmentBody,
  type OrderCancellationBody,
  type OrderSubmissionBody,
  type StopOrdersCancellationBody,
  type StopOrdersSubmissionBody,
  type TransferBody,
  type UpdateMarginModeBody,
  type WithdrawSubmissionBody,
  type Transfer,
  type OrderAmendment,
  type Transaction,
} from './transaction-types';

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
  fromAccountType: AccountType,
  toAccountType: AccountType,
  asset: {
    id: string;
    decimals: number;
  }
): Transfer => {
  return {
    to: address,
    fromAccountType,
    toAccountType,
    asset: asset.id,
    amount: removeDecimal(amount, asset.decimals),
    // oneOff or recurring required otherwise wallet will error
    // default oneOff is immediate transfer
    oneOff: {},
  };
};

/**
 * TODO: We may want to create a package similar to @metamask/detect-ethereum-provider as this wont suffice
 * if called immeidately, and before the extension has been able to add the vega object to the window
 */
export const isBrowserWalletInstalled = () => Boolean(window.vega);

/**
 * TODO: We may want to use @metamask/detect-ethereum-provider here. It works for now as this is called
 * when the dialog is opened so metamask has had plenty of time to add the ethereum object to the window
 */
export const isMetaMaskInstalled = () => {
  return window.ethereum && window.ethereum.isMetaMask;
};

export const isMarginModeUpdateTransaction = (
  transaction: Transaction
): transaction is UpdateMarginModeBody => 'updateMarginMode' in transaction;

export const isWithdrawTransaction = (
  transaction: Transaction
): transaction is WithdrawSubmissionBody => 'withdrawSubmission' in transaction;

export const isOrderSubmissionTransaction = (
  transaction: Transaction
): transaction is OrderSubmissionBody => 'orderSubmission' in transaction;

export const isOrderCancellationTransaction = (
  transaction: Transaction
): transaction is OrderCancellationBody => 'orderCancellation' in transaction;

export const isStopOrdersSubmissionTransaction = (
  transaction: Transaction
): transaction is StopOrdersSubmissionBody =>
  'stopOrdersSubmission' in transaction;

export const isStopOrdersCancellationTransaction = (
  transaction: Transaction
): transaction is StopOrdersCancellationBody =>
  'stopOrdersCancellation' in transaction;

export const isOrderAmendmentTransaction = (
  transaction: Transaction
): transaction is OrderAmendmentBody => 'orderAmendment' in transaction;

export const isBatchMarketInstructionsTransaction = (
  transaction: Transaction
): transaction is BatchMarketInstructionSubmissionBody =>
  'batchMarketInstructions' in transaction;

export const isTransferTransaction = (
  transaction: Transaction
): transaction is TransferBody => 'transfer' in transaction;

export const isReferralRelatedTransaction = (
  transaction: Transaction
): transaction is CreateReferralSet | ApplyReferralCode =>
  'createReferralSet' in transaction || 'applyReferralCode' in transaction;
