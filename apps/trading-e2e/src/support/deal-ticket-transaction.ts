import { ethers } from 'ethers';
import type {
  Transaction,
  OrderSubmissionBody,
  OrderSubmission,
} from '@vegaprotocol/wallet';

const orderSizeField = 'order-size';
const orderPriceField = 'order-price';
const orderTIFDropDown = 'order-tif';
const placeOrderBtn = 'place-order';
const dialogTitle = 'dialog-title';
const orderTransactionHash = 'tx-block-explorer';

/**
 * Base64 encode a transaction object
 */
const encodeTransaction = (tx: Transaction): string => {
  return ethers.utils.base64.encode(
    ethers.utils.toUtf8Bytes(JSON.stringify(tx))
  );
};

export const testOrder = (
  order: OrderSubmission,
  expected?: Partial<OrderSubmission>
) => {
  const { type, side, size, price, timeInForce, expiresAt } = order;

  cy.getByTestId(`order-type-${type}`).click();
  cy.getByTestId(`order-side-${side}`).click();
  cy.getByTestId(orderSizeField).clear().type(size);
  if (price) {
    cy.getByTestId(orderPriceField).clear().type(price);
  }
  cy.getByTestId(orderTIFDropDown).select(timeInForce);
  if (timeInForce === 'TIME_IN_FORCE_GTT') {
    if (!expiresAt) {
      throw new Error('Specify expiresAt if using GTT');
    }
    // select expiry
    cy.getByTestId('date-picker-field').type(expiresAt);
  }
  cy.getByTestId(placeOrderBtn).click();

  const expectedOrder = {
    ...order,
    ...expected,
  };

  expectedOrder.expiresAt = expectedOrder.expiresAt || undefined;
  expectedOrder.price = expectedOrder.price || undefined;

  const transaction: OrderSubmissionBody = {
    orderSubmission: expectedOrder,
  };

  cy.wait('@VegaWalletTransaction')
    .its('request.body.params')
    .should('deep.equal', {
      token: JSON.parse(localStorage.getItem('vega_wallet_config') || '{}')
        ?.token,
      publicKey: Cypress.env('VEGA_PUBLIC_KEY2'),
      sendingMode: 'TYPE_SYNC',
      encodedTransaction: encodeTransaction(transaction),
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
