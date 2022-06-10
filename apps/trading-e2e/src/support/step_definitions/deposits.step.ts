import { And, Then, When } from 'cypress-cucumber-preprocessor/steps';
import { EthereumWallet } from '../ethereum-wallet';
import DepositsPage from '../pages/deposits-page';

const depositsPage = new DepositsPage();
const ethWallet = new EthereumWallet();

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

When('I submit a deposit with empty fields', () => {
  depositsPage.updateTransactionForm();
  depositsPage.clickDepositSubmit();
});

Then('I can see empty form validation errors present', () => {
  depositsPage.verifyFormErrorDisplayed('Required', 3);
});

Then('I enter the following deposit details in deposit form', (table) => {
  depositsPage.updateTransactionForm({
    asset: table.rowsHash().asset,
    to: Cypress.env(table.rowsHash().to),
    amount: table.rowsHash().amount,
  });
});

And('I submit the form', () => {
  depositsPage.clickDepositSubmit();
});

Then('Invalid Vega key is shown', () => {
  depositsPage.verifyInvalidPublicKey();
});

Then('Amount too small message shown', () => {
  depositsPage.verifyAmountTooSmall();
});

And('I enter a valid amount', () => {
  depositsPage.updateTransactionForm({ amount: '1' });
});

Then('Not approved message shown', () => {
  depositsPage.verifyNotApproved();
});

And('I can see the {string} modal is shown', (text) => {
  depositsPage.checkModalContains(text);
});

And('Insufficient amount message shown', () => {
  depositsPage.verifyInsufficientAmountMessage();
});
