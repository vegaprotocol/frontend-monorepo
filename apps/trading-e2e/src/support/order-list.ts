import type {
  OrderAmendment,
  OrderAmendmentBody,
  OrderCancellation,
  OrderCancellationBody,
  Transaction,
} from '@vegaprotocol/wallet';
import { ethers } from 'ethers';

/**
 * Base64 encode a transaction object
 */
export const encodeTransaction = (tx: Transaction): string => {
  return ethers.utils.base64.encode(
    ethers.utils.toUtf8Bytes(JSON.stringify(tx))
  );
};

export const editOrder = (
  order: OrderAmendment,
  expected?: Partial<OrderAmendment>
) => {
  const expectedOrder = {
    ...order,
    ...expected,
  };

  expectedOrder.expiresAt = expectedOrder.expiresAt || undefined;
  expectedOrder.price = expectedOrder.price || undefined;

  const transaction: OrderAmendmentBody = {
    orderAmendment: expectedOrder,
  };
  VegaWalletTransaction(transaction);
};

export const cancelOrder = (
  order: OrderCancellation,
  expected?: Partial<OrderCancellation>
) => {
  const expectedOrder = {
    ...order,
    ...expected,
  };

  const transaction: OrderCancellationBody = {
    orderCancellation: expectedOrder,
  };
  VegaWalletTransaction(transaction);
};

function VegaWalletTransaction(transaction: any) {
  cy.wait('@VegaWalletTransaction')
    .its('request.body.params')
    .should('deep.equal', {
      token: JSON.parse(localStorage.getItem('vega_wallet_config') || '{}')
        ?.token,
      publicKey: Cypress.env('VEGA_PUBLIC_KEY2'),
      sendingMode: 'TYPE_SYNC',
      encodedTransaction: encodeTransaction(transaction),
    });
}
