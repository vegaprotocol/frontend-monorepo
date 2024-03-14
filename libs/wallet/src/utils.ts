import { sha3_256 } from 'js-sha3';
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
  type Transaction,
} from './transaction-types';

/**
 * Creates an ID in the same way that core does on the backend. This way we
 * Can match up the newly created order with incoming orders via a subscription
 */
export const determineId = (sig: string) => {
  return sha3_256(new Uint8Array(hexToBytes(sig)));
};

function hexToBytes(hex: string) {
  const bytes = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substring(i, i + 2), 16));
  }
  return bytes;
}

/* Validates string is 64 chars hex string */
export const isValidVegaPublicKey = (value: string) => {
  return /^[A-Fa-f0-9]{64}$/i.test(value);
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
