import type { OrderObj } from '@vegaprotocol/orders';

const orderSizeField = 'order-size';
const orderPriceField = 'order-price';
const orderTIFDropDown = 'order-tif';
const placeOrderBtn = 'place-order';

export const createOrder = (order: OrderObj): void => {
  cy.log('Placing order', order);
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
    cy.getByTestId('date-picker-field').type(expiresAt);
  }
  cy.getByTestId(placeOrderBtn).click();
};
