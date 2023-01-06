import type {
  OrderAmendment,
  OrderAmendmentBody,
  OrderCancellation,
  OrderCancellationBody,
  OrderSubmission,
  OrderSubmissionBody,
  Transaction,
} from '@vegaprotocol/wallet';

export const testOrderSubmission = (
  order: OrderSubmission,
  expected?: Partial<OrderSubmission>
) => {
  const expectedOrder = {
    ...order,
    ...expected,
  };

  const transaction: OrderSubmissionBody = {
    orderSubmission: expectedOrder,
  };
  vegaWalletTransaction(transaction);
};

export const testOrderAmendment = (
  order: OrderAmendment,
  expected?: Partial<OrderAmendment>
) => {
  const expectedOrder = {
    ...order,
    ...expected,
  };

  const transaction: OrderAmendmentBody = {
    orderAmendment: expectedOrder,
  };
  vegaWalletTransaction(transaction);
};

export const testOrderCancellation = (
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
  const dialogTitle = 'dialog-title';
  const orderTransactionHash = 'tx-block-explorer';
  cy.wait('@VegaWalletTransaction')
    .its('request.body.params')
    .should('deep.equal', {
      token: JSON.parse(localStorage.getItem('vega_wallet_config') || '{}')
        ?.token,
      publicKey: Cypress.env('VEGA_PUBLIC_KEY2'),
      sendingMode: 'TYPE_SYNC',
      transaction,
    });
  cy.getByTestId(dialogTitle).should(
    'have.text',
    'Awaiting network confirmation'
  );
  cy.getByTestId(orderTransactionHash)
    .invoke('attr', 'href')
    .should('include', `${Cypress.env('EXPLORER_URL')}/txs/0xtest-tx-hash`);
  cy.getByTestId('dialog-close').click();
};
