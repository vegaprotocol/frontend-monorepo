import { Then, When } from 'cypress-cucumber-preprocessor/steps';
import MarketsPage from '../pages/trading-page';
import DealTicket from '../trading-windows/deal-ticket';

const marketsPage = new MarketsPage();
const dealTicket = new DealTicket();

When('I click on market for {string}', (marketText) => {
  marketsPage.clickOnMarket(marketText);
});

When('I click on active market', () => {
  if (Cypress.env('bypassPlacingOrders' != true)) {
    marketsPage.clickOnMarket('Active');
  } else {
    marketsPage.clickOnTopMarketRow();
  }
});

When('place a buy {string} market order', (orderType) => {
  dealTicket.placeMarketOrder(true, 100, orderType);
  dealTicket.clickPlaceOrder();
});

When('place a sell {string} market order', (orderType) => {
  dealTicket.placeMarketOrder(false, 100, orderType);
  dealTicket.clickPlaceOrder();
});

When('place a buy {string} limit order', (limitOrderType) => {
  dealTicket.placeLimitOrder(true, 100, 2000, limitOrderType);
  dealTicket.clickPlaceOrder();
});

When('place a sell {string} limit order', (limitOrderType) => {
  dealTicket.placeLimitOrder(false, 100, 2000, limitOrderType);
  dealTicket.clickPlaceOrder();
});

When('place a buy {string} market order with amount of 0', (orderType) => {
  dealTicket.placeMarketOrder(true, 0, orderType);
  dealTicket.clickPlaceOrder();
});

When('I click on suspended market', () => {
  marketsPage.clickOnMarket('Suspended');
});

Then('order request is sent', () => {
  // if (Cypress.env('bypassPlacingOrders' != true)) {
  dealTicket.verifyOrderRequestSent();
  // }
});

Then('error message for insufficient funds is displayed', () => {
  dealTicket.verifyOrderFailedInsufficientFunds();
});

Then('place order button is disabled', () => {
  dealTicket.verifyPlaceOrderBtnDisabled();
});

Then('{string} error is shown', (errorMsg) => {
  dealTicket.verifySubmitBtnErrorText(errorMsg);
});

Then(
  'Order rejected by wallet error shown containing text {string}',
  (expectedError) => {
    dealTicket.verifyOrderRejected(expectedError);
  }
);
