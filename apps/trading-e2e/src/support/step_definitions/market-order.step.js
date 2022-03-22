import { Given, Then, When } from 'cypress-cucumber-preprocessor/steps';
import MarketsPage from '../pages/markets-page';
import DealTicketPage from '../pages/deal-ticket-page';
const marketsPage = new MarketsPage();
const dealTicketPage = new DealTicketPage();

When('I click on market for {string}', (marketText) => {
  marketsPage.clickOnMarket(marketText);
  // marketsPage.clickOnTicketTab();
});

When('I click on active market', () => {
  marketsPage.clickOnMarket('Active');
  // marketsPage.clickOnTicketTab();
});

When('place a buy {string} market order', (orderType) => {
  dealTicketPage.placeMarketOrder(true, 100, orderType);
  dealTicketPage.clickPlaceOrder();
});

When('place a sell {string} market order', (orderType) => {
  dealTicketPage.placeMarketOrder(false, 100, orderType);
  dealTicketPage.clickPlaceOrder();
});

When('place a buy {string} limit order', (limitOrderType) => {
  dealTicketPage.placeLimitOrder(true, 100, 2000, limitOrderType);
  dealTicketPage.clickPlaceOrder();
});

When('place a sell {string} limit order', (limitOrderType) => {
  dealTicketPage.placeLimitOrder(false, 100, 2000, limitOrderType);
  dealTicketPage.clickPlaceOrder();
});

When('I click on suspended market', () => {
  marketsPage.clickOnMarket('Suspended');
});

Then('order request is sent', () => {
  dealTicketPage.verifyOrderRequestSent();
});

Then('error message for insufficient funds is displayed', () => {
  dealTicketPage.verifyOrderFailedInsufficientFunds();
});

Then('place order button is disabled', () => {
  dealTicketPage.verifyPlaceOrderBtnDisabled();
});

Then('market suspended error is shown', () => {
  dealTicketPage.verySubmitBtnErrorText('Market is currently suspended');
});
