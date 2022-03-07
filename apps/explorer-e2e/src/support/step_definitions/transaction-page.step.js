import { Given, Then, When } from 'cypress-cucumber-preprocessor/steps';

import TransactionsPage from '../pages/transactions-page';
const transactionsPage = new TransactionsPage();

When('I navigate to the transactions page', () => {
  transactionsPage.navigateToTxs();
});

Then('transactions page is correctly displayed', () => {
  transactionsPage.validateTransactionsPagedisplayed();
  transactionsPage.validateRefreshBtn();
});
