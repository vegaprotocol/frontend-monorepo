import { When } from 'cypress-cucumber-preprocessor/steps';
import VegaWallet from '../vega-wallet';

const vegaWallet = new VegaWallet();

beforeEach(() => {
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
            'f8885edfa7ffdb6ed996ca912e9258998e47bf3515c885cf3c63fb56b15de36f',
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
  vegaWallet.navigateToConnectVegaWallet();
  vegaWallet.fillInWalletForm(
    'test',
    '123'
    // 'UI_Trading_Test',
    // Cypress.env('tradingWalletPassphrase')
  );
  vegaWallet.clickConnectVegaWallet();
});
