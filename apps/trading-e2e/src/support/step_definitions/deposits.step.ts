import { And, Then, When } from 'cypress-cucumber-preprocessor/steps';
import { EthereumWallet } from '../ethereum-wallet';
import DepositsPage from '../pages/deposits-page';

const depositsPage = new DepositsPage();
const ethWallet = new EthereumWallet();

before(() => {
  cy.mockWeb3Provider();
});

Then('I navigate to deposits page', () => {
  depositsPage.navigateToDeposits();
});

Then('I can see the eth not connected message {string}', (message) => {
  ethWallet.verifyConnectWalletMsg(message);
});

And('the connect button is displayed', () => {
  ethWallet.verifyEthConnectBtnIsDisplayed();
});

When('I connect my Ethereum wallet', () => {
  ethWallet.connect();
});

Then('I can see the deposit form', () => {
  depositsPage.verifyFormDisplayed();
});
