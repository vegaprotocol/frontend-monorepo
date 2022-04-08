export default class DealTicket {
  marketOrderType = 'order-type-TYPE_MARKET';
  limitOrderType = 'order-type-TYPE_LIMIT';
  buyOrder = 'order-side-SIDE_BUY';
  sellOrder = 'order-side-SIDE_SELL';
  orderSizeField = 'order-size';
  orderPriceField = 'order-price';
  orderTypeDropDown = 'order-tif';
  datePickerField = 'date-picker-field';
  placeOrderBtn = 'place-order';
  orderDialog = 'order-wrapper';
  orderStatusHeader = 'order-status-header';
  orderTransactionHash = 'tx-hash';
  orderErrorTxt = 'error-reason';

  placeMarketOrder(isBuy, orderSize, orderType) {
    cy.get(`[data-testid=${this.placeOrderBtn}]`, { timeout: 8000 }).should(
      'be.visible'
    );

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
      .should('contain', 'Tx hash: test-tx-hash');
  }

  verifyOrderFailedInsufficientFunds() {
    cy.get(`[data-testid=${this.orderErrorTxt}]`, { timeout: 8000 }).should(
      'have.text',
      'Reason: InsufficientAssetBalance'
    );
  }

  clickPlaceOrder() {
    // if (Cypress.env('bypassPlacingOrders' != true)) {
    cy.getByTestId(this.placeOrderBtn).click();
    cy.contains('Awaiting network confirmation');
    // }
  }

  verifyPlaceOrderBtnDisabled() {
    cy.getByTestId(this.placeOrderBtn).should('be.disabled');
  }

  verifySubmitBtnErrorText(expectedText) {
    cy.getByTestId('dealticket-error-message').should(
      'have.text',
      expectedText
    );
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

  reloadPageIfPublicKeyErrorDisplayed() {
    cy.get('body').then(($body) => {
      if ($body.find(`[data-testid=${this.inputError}]`).length) {
        cy.getByTestId(this.inputError)
          .invoke('text')
          .then(($errorText) => {
            if ($errorText == 'No public key selected') {
              cy.reload;
            }
          });
      }
    });
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
