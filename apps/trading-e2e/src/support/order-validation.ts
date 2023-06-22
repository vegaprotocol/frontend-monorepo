import type {
  OrderAmendment,
  OrderAmendmentBody,
  OrderCancellation,
  OrderCancellationBody,
  OrderSubmissionBody,
  Transaction,
} from '@vegaprotocol/wallet';
import { normalizeOrderSubmission } from '@vegaprotocol/deal-ticket';
import type { OrderObj } from '@vegaprotocol/orders';

export const testOrderSubmission = (
  order: Omit<OrderObj, 'persist'>,
  expected?: Partial<OrderObj>
) => {
  const expectedOrder = {
    ...order,
    ...expected,
  };

  const transaction: OrderSubmissionBody = {
    orderSubmission: normalizeOrderSubmission(expectedOrder, 0, 0),
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
    .its('request')
    .then((req) => {
      expect(req.body.params).to.deep.equal({
        publicKey: Cypress.env('VEGA_PUBLIC_KEY'),
        sendingMode: 'TYPE_SYNC',
        transaction: JSON.parse(JSON.stringify(transaction)), // this is because BigInt needs to be serialized
      });
      expect(req.headers.authorization).to.equal(
        `VWT ${Cypress.env('VEGA_WALLET_API_TOKEN')}`
      );
    });
};

const verifyToast = () => {
  cy.getByTestId('toast').should('contain.text', 'Awaiting confirmation');
  cy.getByTestId('toast')
    .find('a')
    .invoke('attr', 'href')
    .should('include', `${Cypress.env('EXPLORER_URL')}/txs/test-tx-hash`);
  cy.getByTestId('toast-close').click();
};
