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
  marketsPage.clickOnActiveMarket();
  // marketsPage.clickOnTicketTab();
});

When('place a buy {string} market order', (orderType) => {
  dealTicketPage.placeMarketOrder(true, 100, orderType);
  dealTicketPage.clickPlaceOrder();
});

When('place a buy {string} limit order', (limitOrderType) => {
  dealTicketPage.placeLimitOrder(true, 100, 32000, limitOrderType);
  dealTicketPage.clickPlaceOrder();
});

Then('order request is sent', () => {
  dealTicketPage.verifyOrderRequestSent();
  dealTicketPage.verifyOrderFailedInsufficientFunds();
});
