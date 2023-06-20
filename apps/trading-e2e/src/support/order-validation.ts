import type {
  OrderAmendment,
  OrderAmendmentBody,
  OrderCancellation,
  OrderCancellationBody,
  OrderSubmission,
  OrderSubmissionBody,
  Transaction,
} from '@vegaprotocol/wallet';
import type { DealTicketOrderSubmission } from '@vegaprotocol/deal-ticket';
import { normalizeOrderSubmission } from '@vegaprotocol/deal-ticket';

export const testOrderSubmission = (
  order: DealTicketOrderSubmission,
  expected?: Partial<DealTicketOrderSubmission>
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
        transaction,
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
