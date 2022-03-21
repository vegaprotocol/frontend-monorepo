import BasePage from './base-page';
import { formatForInput } from '@vegaprotocol/react-helpers';
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
  orderDialog = 'order-wrapper';
  orderStatusHeader = 'order-status-header';
  orderTransactionHash = 'tx-hash';
  orderErrorTxt = 'error-reason';

  placeMarketOrder(isBuy, orderSize, orderType) {
    if (isBuy == false) {
      cy.getByTestId(this.buyOrder).click();
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
      const futureDate = new Date(today.setMonth(today.getMonth() + 1));
      const formattedDate = this.formatDate(futureDate);
      // const formattedString = format(
      //   new Date(futureDate),
      //   "yyyy-MM-dd'T'HH:mm"
      // );
      cy.getByTestId(this.datePickerField).click().type(formattedDate); // set expiry to one month from now
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
}
