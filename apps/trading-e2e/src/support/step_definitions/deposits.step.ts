import { When, Then } from 'cypress-cucumber-preprocessor/steps';
import DepositsPage from '../pages/deposits-page';
import EthWalletsPage from '../pages/ethwallet-page';

const depositsPage = new DepositsPage();
const ethWallet = new EthWalletsPage();

Then('I navigate to deposits page', () => {
  depositsPage.navigateToDeposits();
});

Then('I can see the eth not connected message {string}', (message) => {
  ethWallet.verifyConnectWalletMsg(message);
});

Then('the connect button is displayed', () => {
  ethWallet.verifyEthConnectBtnIsDisplayed();
});
