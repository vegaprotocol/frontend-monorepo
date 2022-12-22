import type {
  OrderAmendment,
  OrderAmendmentBody,
  OrderCancellation,
  OrderCancellationBody,
  Transaction,
} from '@vegaprotocol/wallet';
import { encodeTransaction } from './encode-transaction';

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
  vegaWalletTransaction(transaction);
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
  vegaWalletTransaction(transaction);
};

const vegaWalletTransaction = (transaction: Transaction) => {
  cy.wait('@VegaWalletTransaction')
    .its('request.body.params')
    .should('deep.equal', {
      token: JSON.parse(localStorage.getItem('vega_wallet_config') || '{}')
        ?.token,
      publicKey: Cypress.env('VEGA_PUBLIC_KEY2'),
      sendingMode: 'TYPE_SYNC',
      encodedTransaction: encodeTransaction(transaction),
    });
};
