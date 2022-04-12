import { When, Then } from 'cypress-cucumber-preprocessor/steps';
import VegaWallet from '../vega-wallet';

const vegaWallet = new VegaWallet();

beforeEach(() => {
  // The two important values here are the signature.value and the From.Pubkey.
  // From.PubKey is the first public key in the UI_Trading_Test wallet. We assert that the returned pubkey matches
  // what is used to sign the transaction
  // The tx.signature.value isn't currently used in any tests but the value returned is used to create IDs objects such
  // as orders, if its invalid an erro will be thrown
  cy.mockVegaCommandSync({
    txHash: 'test-tx-hash',
    tx: {
      signature: {
        value:
          'd86138bba739bbc1069b3dc975d20b3a1517c2b9bdd401c70eeb1a0ecbc502ec268cf3129824841178b8b506b0b7d650c76644dbd96f524a6cb2158fb7121800',
      },
    },
  });
});

When('I connect to Vega Wallet', () => {
  vegaWallet.openVegaWalletConnectDialog();
  vegaWallet.fillInWalletForm(
    'UI_Trading_Test',
    Cypress.env('tradingWalletPassphrase')
  );
  vegaWallet.clickConnectVegaWallet();
});

When('I open wallet dialog', () => {
  vegaWallet.validatePublicKeyDisplayed('47836c…c7d278'); // Default Test wallet pub key
  vegaWallet.clickOnWalletConnectDialog();
});

When('select a different public key', () => {
  vegaWallet.selectPublicKey();
});

Then('public key is switched', () => {
  vegaWallet.validatePublicKeyDisplayed('1a18cd…0cf2e4'); // Second public key for test wallet
});
