import {
  mockConnectWallet,
  mockConnectWalletWithUserError,
} from '@vegaprotocol/cypress';

const connectVegaBtn = 'connect-vega-wallet';
const manageVegaBtn = 'manage-vega-wallet';
const dialogContent = 'dialog-content';

describe('connect vega wallet', { tags: '@smoke', testIsolation: true }, () => {
  beforeEach(() => {
    // Using portfolio page as it requires vega wallet connection
    cy.visit('/#/portfolio');
    cy.mockTradingPage();
    cy.mockSubscription();
    cy.setOnBoardingViewed();
    cy.get('[data-testid="pathname-/portfolio"]').should('exist');
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
    cy.contains('Enter a custom wallet location');
  });
});
