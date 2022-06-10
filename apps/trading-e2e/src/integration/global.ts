import { connectVegaWallet } from '../support/vega-wallet';

describe('vega wallet', () => {
  const connectVegaBtn = 'connect-vega-wallet';
  const manageVegaBtn = 'manage-vega-wallet';
  const form = 'rest-connector-form';
  const walletName = Cypress.env('TRADING_TEST_VEGA_WALLET_NAME');
  const walletPassphrase = Cypress.env('TRADING_TEST_VEGA_WALLET_PASSPHRASE');

  beforeEach(() => {
    // Using portfolio page as it requires vega wallet connection
    cy.visit('/portfolio');
  });

  it('can connect', () => {
    cy.getByTestId(connectVegaBtn).click();
    cy.contains('Connects using REST to a running Vega wallet service');
    cy.getByTestId('connectors-list').find('button').click();
    cy.getByTestId(form).find('#wallet').click().type(walletName);
    cy.getByTestId(form).find('#passphrase').click().type(walletPassphrase);
    cy.getByTestId('rest-connector-form').find('button[type=submit]').click();
    cy.getByTestId(manageVegaBtn).should('exist');
  });

  it('doesnt connect with invalid credentials', () => {
    cy.getByTestId(connectVegaBtn).click();
    cy.getByTestId('connectors-list').find('button').click();
    cy.getByTestId(form).find('#wallet').click().type('invalid name');
    cy.getByTestId(form).find('#passphrase').click().type('invalid password');
    cy.getByTestId('rest-connector-form').find('button[type=submit]').click();
    cy.getByTestId('form-error').should('have.text', 'Authentication failed');
  });

  it('doesnt connect with invalid fields', () => {
    cy.getByTestId(connectVegaBtn).click();
    cy.getByTestId('connectors-list').find('button').click();
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

  it('can change selected public key and disconnect', () => {
    connectVegaWallet();
    cy.getByTestId('manage-vega-wallet').click();
    cy.getByTestId('keypair-list').should('exist');
    cy.getByTestId('select-keypair-button').click();
    cy.getByTestId('keypair-list').should('not.exist');
    cy.getByTestId('manage-vega-wallet').contains(
      Cypress.env('TRUNCATED_VEGA_PUBLIC_KEY2')
    );
    cy.getByTestId('manage-vega-wallet').click();
    cy.getByTestId('disconnect').click();
    cy.getByTestId('connect-vega-wallet').should('exist');
    cy.getByTestId('manage-vega-wallet').should('not.exist');
  });
});

describe('ethereum wallet', () => {
  beforeEach(() => {
    cy.mockWeb3Provider();
    // Using portfolio is it requires Ethereum wallet connection
    cy.visit('/portfolio');
  });

  it('can connect', () => {
    cy.getByTestId('connect-eth-wallet-btn').click();
    cy.getByTestId('web3-connector-list').should('exist');
    cy.getByTestId('web3-connector-MetaMask').click();
    cy.getByTestId('web3-connector-list').should('not.exist');
    cy.getByTestId('portfolio-grid').should('exist');
  });
});
