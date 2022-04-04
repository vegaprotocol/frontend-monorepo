import { Then, When } from 'cypress-cucumber-preprocessor/steps';
import MarketsPage from '../pages/markets-page';
const marketsPage = new MarketsPage();

When('I try to connect Vega wallet with incorrect details', () => {
  marketsPage.navigateToConnectVegaWallet();
  marketsPage.fillInWalletForm('name', 'wrong passphrase');
  marketsPage.clickConnectVegaWallet();
});

When('I try to connect Vega wallet with blank fields', () => {
  marketsPage.navigateToConnectVegaWallet();
  marketsPage.clickConnectVegaWallet();
});

Then('wallet not running error message is displayed', () => {
  marketsPage.validateWalletNotRunningError();
});

Then('wallet field validation errors are shown', () => {
  marketsPage.validateWalletErrorFieldsDisplayed();
});
