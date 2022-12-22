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
  verifyToast();
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
  verifyToast();
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
  verifyToast();
};

const vegaWalletTransaction = (transaction: Transaction) => {
  cy.wait('@VegaWalletTransaction')
    .its('request.body.params')
    .should('deep.equal', {
      token: JSON.parse(localStorage.getItem('vega_wallet_config') || '{}')
        ?.token,
      publicKey: Cypress.env('VEGA_PUBLIC_KEY'),
      sendingMode: 'TYPE_SYNC',
      transaction,
    });
};

const verifyToast = () => {
  cy.getByTestId('toast').should('contain.text', 'Awaiting confirmation');
  cy.getByTestId('toast')
    .find('a')
    .invoke('attr', 'href')
    .should('include', `${Cypress.env('EXPLORER_URL')}/txs/0xtest-tx-hash`);
  cy.getByTestId('toast-close').click();
};
