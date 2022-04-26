import { And, Then, When } from 'cypress-cucumber-preprocessor/steps';
import { EthereumWallet } from '../ethereum-wallet';
import DepositsPage from '../pages/deposits-page';

const depositsPage = new DepositsPage();
const ethWallet = new EthereumWallet();

const tBTC = '5cfa87844724df6069b94e4c8a6f03af21907d7bc251593d08e4251043ee9f7c';
const invalidPublicKey =
  'zzz85edfa7ffdb6ed996ca912e9258998e47bf3515c885cf3c63fb56b15de36f';
const validPublicKey =
  'f8885edfa7ffdb6ed996ca912e9258998e47bf3515c885cf3c63fb56b15de36f';

beforeEach(() => {
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

When('I submit a deposit with empty fields', () => {
  depositsPage.submitForm();
});

Then('I can see validation errors present', () => {
  depositsPage.submitForm();
  depositsPage.verifyFieldsAreRequired();
});

And('I submit with an invalid public key', () => {
  depositsPage.submitForm({
    asset: tBTC,
    to: invalidPublicKey,
    amount: '1',
  });
});

Then('Invalid Vega key is shown', () => {
  depositsPage.verifyInvalidPublicKey();
});

And('I submit with an amount less than the minimum viable amount', () => {
  depositsPage.submitForm({
    asset: tBTC,
    to: invalidPublicKey,
    amount: '0.00000000000001',
  });
});

Then('Amount to small message shown', () => {
  depositsPage.verifyAmountTooSmall();
});

And('I submit with a valid amount', () => {
  depositsPage.submitForm({ amount: '1' });
});

Then('Insufficent funds message shown', () => {
  depositsPage.verifyInsufficientFunds();
});
