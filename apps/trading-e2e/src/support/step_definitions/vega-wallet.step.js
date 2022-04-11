import { When } from 'cypress-cucumber-preprocessor/steps';
import VegaWallet from '../vega-wallet';

const vegaWallet = new VegaWallet();

beforeEach(() => {
  // The two important values here are the signature.value and the From.Pubkey.
  // From.PubKey is the first public key in the UI_Trading_Test wallet. We assert that the returned pubkey matches
  // what is used to sign the transaction
  // The tx.signature.value isn't currently used in any tests but the value returned is used to create IDs objects such
  // as orders, if its invalid an erro will be thrown
  cy.intercept('POST', 'http://localhost:1789/api/v1/command/sync', {
    body: {
      txHash: 'test-tx-hash',
      tx: {
        input_data:
          'CPe6vpiqsPqxDBDC1w7KPkoKQGE4Y2M0NjUwMjhiMGY4OTM4YTYzZTEzNDViYzM2ODc3ZWRmODg4MjNmOWU0ZmI4ZDRlN2VkMmFlMzAwNzA3ZTMYASABKAM4Ag==',
        signature: {
          // sig value needs to be 'real' so sigToId function doesn't error out
          value:
            'd86138bba739bbc1069b3dc975d20b3a1517c2b9bdd401c70eeb1a0ecbc502ec268cf3129824841178b8b506b0b7d650c76644dbd96f524a6cb2158fb7121800',
          algo: 'vega/ed25519',
          version: 1,
        },
        From: {
          PubKey:
            '47836c253520d2661bf5bed6339c0de08fd02cf5d4db0efee3b4373f20c7d278',
        },
        version: 2,
        pow: {
          tid: '0CEEC2FDFDB5D68BC0C1E2640440E4AA11E49986CB2929E0F3572E16CB7DC59C',
          nonce: 23525,
        },
      },
    },
  }).as('SendTransaction');
});

When('I connect to Vega Wallet', () => {
  vegaWallet.openVegaWalletConnectDialog();
  vegaWallet.fillInWalletForm(
    'UI_Trading_Test',
    Cypress.env('tradingWalletPassphrase')
  );
  vegaWallet.clickConnectVegaWallet();
});
