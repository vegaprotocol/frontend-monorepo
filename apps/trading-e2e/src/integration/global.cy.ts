import { mockConnectWallet } from '@vegaprotocol/cypress';
import { connectEthereumWallet } from '../support/ethereum-wallet';

const connectEthWalletBtn = 'connect-eth-wallet-btn';
const connectVegaBtn = 'connect-vega-wallet';
const manageVegaBtn = 'manage-vega-wallet';
const form = 'rest-connector-form';
const dialogContent = 'dialog-content';

describe('vega wallet v1', { tags: '@smoke' }, () => {
  beforeEach(() => {
    // Using portfolio page as it requires vega wallet connection
    cy.visit('/#/portfolio');
    cy.mockTradingPage();
    cy.mockSubscription();
    cy.get('main[data-testid="/portfolio"]').should('exist');
  });

  it('can connect', () => {
    cy.getByTestId(connectVegaBtn).click();
    mockConnectWallet();
    cy.contains('Connect Vega wallet');
    cy.contains('Hosted Fairground wallet');

    cy.getByTestId('connectors-list')
      .find('[data-testid="connector-jsonRpc"]')
      .click();
    cy.wait('@walletReq');
    cy.getByTestId(manageVegaBtn).should('exist');
  });

  it('doesnt connect with invalid credentials', () => {
    cy.getByTestId(connectVegaBtn).click();
    cy.getByTestId('connectors-list')
      .find('[data-testid="connector-hosted"]')
      .click();
    cy.getByTestId(form).find('#wallet').click().type('invalid name');
    cy.getByTestId(form).find('#passphrase').click().type('invalid password');
    cy.getByTestId('rest-connector-form').find('button[type=submit]').click();
    cy.getByTestId('form-error').should('have.text', 'Invalid credentials');
  });

  it('doesnt connect with invalid fields', () => {
    cy.getByTestId(connectVegaBtn).click();
    cy.getByTestId('connectors-list')
      .find('[data-testid="connector-hosted"]')
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
});

describe('vega wallet v2', { tags: '@smoke' }, () => {
  beforeEach(() => {
    // Using portfolio page as it requires vega wallet connection
    cy.visit('/#/portfolio');
    cy.mockTradingPage();
    cy.mockSubscription();
    cy.get('main[data-testid="/portfolio"]').should('exist');
  });

  it('can connect', () => {
    mockConnectWallet();
    cy.getByTestId(connectVegaBtn).click();
    cy.getByTestId('connectors-list')
      .find('[data-testid="connector-jsonRpc"]')
      .click();
    cy.wait('@walletReq');
    cy.getByTestId(dialogContent).should('not.exist');
    cy.getByTestId(manageVegaBtn).should('exist');
  });

  it('can change selected public key and disconnect', () => {
    const key2 = Cypress.env('VEGA_PUBLIC_KEY2');
    const truncatedKey2 = Cypress.env('TRUNCATED_VEGA_PUBLIC_KEY2');
    cy.connectVegaWallet();
    cy.getByTestId('manage-vega-wallet').click();
    cy.getByTestId('keypair-list').should('exist');
    cy.getByTestId(`key-${key2}`).should('contain.text', truncatedKey2);
    cy.get(`[data-testid="key-${key2}"] > .mr-2`).click();
    cy.getByTestId('disconnect').click();
    cy.getByTestId('connect-vega-wallet').should('exist');
    cy.getByTestId('manage-vega-wallet').should('not.exist');
  });
});

describe('ethereum wallet', { tags: '@smoke' }, () => {
  beforeEach(() => {
    cy.mockWeb3Provider();
    // Using portfolio withdrawals tab is it requires Ethereum wallet connection
    cy.visit('/#/portfolio');
    cy.mockTradingPage();
    cy.mockSubscription();
    cy.get('main[data-testid="/portfolio"]').should('exist');
    cy.connectVegaWallet();
    cy.getByTestId('Withdrawals').click();
  });

  it('can connect', () => {
    cy.wait('@NetworkParams');
    cy.getByTestId('Deposits').click();
    cy.getByTestId('deposit-button').click();
    cy.getByTestId('connect-eth-wallet-btn').click();
    cy.getByTestId('web3-connector-list').should('exist');
    cy.getByTestId('web3-connector-MetaMask').click();
    cy.getByTestId('web3-connector-list').should('not.exist');
    cy.getByTestId('tab-deposits').should('not.be.empty');
  });

  it('able to disconnect eth wallet', () => {
    const ethWalletAddress = Cypress.env('ETHEREUM_WALLET_ADDRESS');
    cy.getByTestId('Deposits').click();
    cy.getByTestId('deposit-button').click();
    connectEthereumWallet();
    cy.get('#ethereum-address').should('have.value', ethWalletAddress);
    cy.getByTestId('disconnect-ethereum-wallet')
      .should('have.text', 'Disconnect')
      .click();
    cy.getByTestId(connectEthWalletBtn).should('exist');
  });
});

describe('Navbar', { tags: '@smoke' }, () => {
  beforeEach(() => {
    cy.mockTradingPage();
    cy.mockSubscription();
    cy.visit('/');
    cy.wait('@Market');
    cy.getByTestId('dialog-close').click();
  });

  it.only('should be properly rendered', () => {
    const links = ['Markets', 'Trading', 'Portfolio'];
    const hashes = ['#/markets/all', '#/markets/market-0', '#/portfolio'];
    let i = 0;
    cy.getByTestId('navbar').within(() => {
      cy.get('a[data-testid]', { log: true })
        .should('have.length', 3)
        .each((item) => {
          cy.wrap(item).click();
          cy.wrap(item).get('span.absolute.h-1.w-full').should('exist');
          cy.location('hash').should('equal', hashes[i]);
          cy.wrap(item).should('have.data', 'testid', links[i++]);
        });
    });
  });

  it('should look nicer on mobile', () => {
    cy.viewport(560, 890);
    cy.getByTestId('theme-switcher').scrollIntoView().click();
  });
});
