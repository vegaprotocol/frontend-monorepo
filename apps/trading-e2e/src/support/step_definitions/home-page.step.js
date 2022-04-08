import { Then, When } from 'cypress-cucumber-preprocessor/steps';
import VegaWallet from '../vega-wallet';

const vegaWallet = new VegaWallet();

When('I try to connect Vega wallet with incorrect details', () => {
  vegaWallet.navigateToConnectVegaWallet();
  vegaWallet.fillInWalletForm('name', 'wrong passphrase');
  vegaWallet.clickConnectVegaWallet();
});

When('I try to connect Vega wallet with blank fields', () => {
  vegaWallet.navigateToConnectVegaWallet();
  vegaWallet.clickConnectVegaWallet();
});

Then('wallet not running error message is displayed', () => {
  vegaWallet.validateWalletNotRunningError();
});

Then('wallet field validation errors are shown', () => {
  vegaWallet.validateWalletErrorFieldsDisplayed();
});
