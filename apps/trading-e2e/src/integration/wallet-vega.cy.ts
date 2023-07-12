import {
  mockConnectWallet,
  mockConnectWalletWithUserError,
} from '@vegaprotocol/cypress';

const connectVegaBtn = 'connect-vega-wallet';
const manageVegaBtn = 'manage-vega-wallet';
const form = 'rest-connector-form';
const dialogContent = 'dialog-content';

describe(
  'connect hosted wallet',
  { tags: '@smoke', testIsolation: true },
  () => {
    beforeEach(() => {
      // Using portfolio page as it requires vega wallet connection
      cy.visit('/#/portfolio');
      cy.mockTradingPage();
      cy.mockSubscription();
      cy.get('main[data-testid="/portfolio"]').should('exist');
    });

    it('can connect', () => {
      // 0002-WCON-002
      // 0002-WCON-003
      // 0002-WCON-039
      // 0002-WCON-017
      // 0002-WCON-018
      // 0002-WCON-019

      // Mock authentication
      cy.intercept(
        'POST',
        'https://wallet.testnet.vega.xyz/api/v1/auth/token',
        {
          body: {
            token: 'test-token',
          },
        }
      );
      // Mock getting keys from wallet
      cy.intercept('GET', 'https://wallet.testnet.vega.xyz/api/v1/keys', {
        body: {
          keys: [
            {
              algorithm: {
                name: 'algo',
                version: 1,
              },
              index: 0,
              meta: [],
              pub: 'HOSTED_PUBKEY',
              tainted: false,
            },
          ],
        },
      });
      cy.getByTestId(connectVegaBtn).click();
      cy.contains(
        'Choose wallet app to connect, or to change port or server URL enter a custom wallet location first'
      );
      cy.contains('Connect Vega wallet');
      cy.contains('Hosted Fairground wallet');

      cy.getByTestId('connectors-list')
        .find('[data-testid="connector-rest"]')
        .click();
      cy.getByTestId(form).find('#wallet').click().type('user');
      cy.getByTestId(form).find('#passphrase').click().type('pass');
      cy.getByTestId('rest-connector-form').find('button[type=submit]').click();
      cy.getByTestId(manageVegaBtn).should('exist');
      cy.getByTestId('manage-vega-wallet').click();
      cy.getByTestId('keypair-list').should('exist');
    });

    it('doesnt connect with invalid credentials', () => {
      // 0002-WCON-020

      // Mock incorrect username/password
      cy.intercept(
        'POST',
        'https://wallet.testnet.vega.xyz/api/v1/auth/token',
        {
          body: {
            error: 'No wallet',
          },
          statusCode: 403, // 403 forbidden invalid crednetials
        }
      );
      cy.getByTestId(connectVegaBtn).click();
      cy.getByTestId('connectors-list')
        .find('[data-testid="connector-rest"]')
        .click();
      cy.getByTestId(form).find('#wallet').click().type('invalid name');
      cy.getByTestId(form).find('#passphrase').click().type('invalid password');
      cy.getByTestId('rest-connector-form').find('button[type=submit]').click();
      cy.getByTestId('form-error').should('have.text', 'Invalid credentials');
    });

    it('doesnt connect with empty fields', () => {
      cy.getByTestId(connectVegaBtn).click();
      cy.getByTestId('connectors-list')
        .find('[data-testid="connector-rest"]')
        .click();

      cy.getByTestId('rest-connector-form').find('button[type=submit]').click();
      cy.getByTestId(form)
        .find('#wallet')
        .next('[data-testid="input-error-text"]')
        .should('have.text', 'Required');
      cy.getByTestId(form)
        .find('#passphrase')
        .next('[data-testid="input-error-text"]')
        .should('have.text', 'Required');
    });
  }
);

describe('connect vega wallet', { tags: '@smoke', testIsolation: true }, () => {
  beforeEach(() => {
    // Using portfolio page as it requires vega wallet connection
    cy.visit('/#/portfolio');
    cy.mockTradingPage();
    cy.mockSubscription();
    cy.get('main[data-testid="/portfolio"]').should('exist');
  });

  it('can connect', () => {
    // 0002-WCON-002
    // 0002-WCON-005
    // 0002-WCON-007
    // 0002-WCON-009

    mockConnectWallet();
    cy.getByTestId(connectVegaBtn).click();
    cy.getByTestId('connectors-list')
      .find('[data-testid="connector-jsonRpc"]')
      .click();
    cy.wait('@walletReq');
    cy.getByTestId(dialogContent).should(
      'contain.text',
      'Approve the connection from your Vega wallet app.'
    );
    cy.getByTestId(dialogContent).should('not.exist');
    cy.getByTestId(manageVegaBtn).should('exist');
  });

  it('can not connect', () => {
    // 0002-WCON-002
    // 0002-WCON-005
    // 0002-WCON-007
    // 0002-WCON-015

    mockConnectWalletWithUserError();
    cy.getByTestId(connectVegaBtn).click();
    cy.getByTestId('connectors-list')
      .find('[data-testid="connector-jsonRpc"]')
      .click();
    cy.getByTestId('dialog-content')
      .should('contain.text', 'User error')
      .and('contain.text', 'the user rejected the wallet connection');
  });

  it('can change selected public key and disconnect', () => {
    // 0002-WCON-022
    // 0002-WCON-023
    // 0002-WCON-025
    // 0002-WCON-026
    // 0002-WCON-021
    // 0002-WCON-027
    // 0002-WCON-030
    // 0002-WCON-029
    // 0002-WCON-008
    // 0002-WCON-035
    // 0002-WCON-014
    // 0002-WCON-010
    // 0003-WTXN-004

    mockConnectWallet();
    const key2 = Cypress.env('VEGA_PUBLIC_KEY2');
    const truncatedKey2 = Cypress.env('TRUNCATED_VEGA_PUBLIC_KEY2');
    cy.connectVegaWallet();
    cy.getByTestId('manage-vega-wallet').click();
    cy.getByTestId('keypair-list').should('exist');
    cy.getByTestId(`key-${key2}`).should('contain.text', truncatedKey2);
    cy.getByTestId(`key-${key2}`)
      .find('[data-testid="copy-vega-public-key"]')
      .should('be.visible');
    cy.get(`[data-testid="key-${key2}"] > .mr-2`).click();
    cy.getByTestId('keypair-list')
      .find('[data-state="checked"]')
      .should('be.visible');
    cy.getByTestId('disconnect').click();
    cy.getByTestId('connect-vega-wallet').should('exist');
    cy.getByTestId('manage-vega-wallet').should('not.exist');
    cy.getByTestId('connect-vega-wallet').click();
    cy.contains(
      'Choose wallet app to connect, or to change port or server URL enter a custom wallet location first'
    );
  });
});
