import { Then, When } from 'cypress-cucumber-preprocessor/steps';

import TransactionsPage from '../pages/transactions-page';
const transactionsPage = new TransactionsPage();

When('I navigate to the transactions page', () => {
  transactionsPage.navigateToTxs();
});

When('I navigate to the blocks page', () => {
  transactionsPage.navigateToBlocks();
});

Then('transactions page is correctly displayed', () => {
  transactionsPage.validateTransactionsPagedisplayed();
  transactionsPage.validateRefreshBtn();
});

Then('blocks page is correctly displayed', () => {
  transactionsPage.validateTransactionsPagedisplayed();
  transactionsPage.validateRefreshBtn();
});
