import BasePage from './base-page';
export default class DealTicketPage extends BasePage {
  marketOrderType = 'order-type-TYPE_MARKET';
  limitOrderType = 'order-type-TYPE_LIMIT';
  buyOrder = 'order-side-SIDE_BUY';
  sellOrder = 'order-side-SIDE_SELL';
  orderSizeField = 'order-size';
  orderPriceField = 'order-price';
  orderTypeDropDown = 'order-tif';
  datePickerField = 'date-picker-field';
  placeOrderBtn = 'place-order';
  placeOrderErrorTxt = 'error-text';
  orderDialog = 'order-wrapper';
  orderStatusHeader = 'order-status-header';
  orderTransactionHash = 'tx-hash';
  orderErrorTxt = 'error-reason';

  placeMarketOrder(isBuy, orderSize, orderType) {
    if (isBuy == false) {
      cy.getByTestId(this.sellOrder).click();
    }

    cy.getByTestId(this.orderSizeField).clear().type(orderSize);
    cy.getByTestId(this.orderTypeDropDown).select(orderType);
  }

  placeLimitOrder(isBuy, orderSize, orderPrice, orderType) {
    cy.getByTestId(this.limitOrderType).click();

    if (isBuy == false) {
      cy.getByTestId(this.sellOrder).click();
    }

    cy.getByTestId(this.orderSizeField).clear().type(orderSize);
    cy.getByTestId(this.orderPriceField).clear().type(orderPrice);
    cy.getByTestId(this.orderTypeDropDown).select(orderType);

    if (orderType == 'GTT') {
      const today = new Date(new Date().setSeconds(0));
      const futureDate = new Date(today.setMonth(today.getMonth() + 1)); // set expiry to one month from now
      const formattedDate = this.formatDate(futureDate);
      cy.getByTestId(this.datePickerField).click().type(formattedDate);
    }
  }

  verifyOrderRequestSent() {
    cy.getByTestId(this.orderStatusHeader).should(
      'have.text',
      'Awaiting network confirmation'
    );
    cy.getByTestId(this.orderTransactionHash)
      .invoke('text')
      .should('contain', 'Tx hash: ')
      .and('have.length.above', 64);
  }

  verifyOrderFailedInsufficientFunds() {
    cy.getByTestId(this.orderErrorTxt).should(
      'have.text',
      'Reason: InsufficientAssetBalance'
    );
  }

  clickPlaceOrder() {
    cy.getByTestId(this.placeOrderBtn).click();
  }

  verifyPlaceOrderBtnDisabled() {
    cy.getByTestId(this.placeOrderBtn).should('be.disabled');
  }

  verifySubmitBtnErrorText(expectedText) {
    cy.getByTestId(this.placeOrderErrorTxt).should('have.text', expectedText);
  }

  verifyOrderRejected(errorMsg) {
    cy.getByTestId(this.orderStatusHeader).should(
      'have.text',
      'Order rejected by wallet'
    );
    cy.getByTestId(this.orderDialog)
      .find('pre')
      .should('contain.text', errorMsg);
  }

  formatDate(date) {
    const padZero = (num) => num.toString().padStart(2, '0');

    const year = date.getFullYear();
    const month = padZero(date.getMonth() + 1);
    const day = padZero(date.getDate());
    const hours = padZero(date.getHours());
    const minutes = padZero(date.getMinutes());

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}
