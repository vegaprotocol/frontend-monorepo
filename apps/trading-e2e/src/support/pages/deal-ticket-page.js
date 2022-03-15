import BasePage from './base-page';

export default class DealTicketPage extends BasePage {
  marketOrderType = 'order-type-TYPE_MARKET';
  limitOrderType = 'order-type-TYPE_LIMIT';
  buyOrder = 'order-side-SIDE_BUY';
  sellOrder = 'order-side-SIDE_SELL';
  orderSizeField = 'order-size';
  orderPriceField = 'order-price';
  orderTypeDropDown = 'order-tif';
  placeOrderBtn = 'place-order';

  placeMarketOrder(isBuy, orderSize, orderType) {
    if (this.isElementSelected(this.marketOrderType) == false) {
      cy.getByTestId(this.marketOrderType).click();
    }

    if (isBuy == true) {
      if (this.isElementSelected(this.buyOrder) == false) {
        cy.getByTestId(this.buyOrder).click();
      }
    }

    cy.getByTestId(this.orderSizeField).clear().type(orderSize);
    cy.getByTestId(this.orderTypeDropDown).select(orderType);
  }

  placeLimitOrder(isBuy, orderSize, orderPrice, orderType) {
    if (this.isElementSelected(this.limitOrderType) == false) {
      cy.getByTestId(this.limitOrderType).click();
    }

    if (isBuy == true) {
      cy.getByTestId(this.buyOrder).click();
    } else cy.getByTestId(this.sellOrder).click();

    cy.getByTestId(this.orderSizeField).clear().type(orderSize);
    cy.getByTestId(this.orderPriceField).clear().type(orderPrice);
    cy.getByTestId(this.orderTypeDropDown).select(orderType);
  }

  clickPlaceOrder() {
    cy.getByTestId(this.placeOrderBtn).click();
  }
}
