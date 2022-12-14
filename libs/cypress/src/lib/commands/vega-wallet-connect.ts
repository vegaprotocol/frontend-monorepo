import { aliasWalletQuery } from '../mock-rest';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      connectVegaWallet(): void;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      setVegaWallet(): void;
    }
  }
}

export const mockConnectWallet = () => {
  const data = {
    token: Cypress.env('VEGA_WALLET_API_TOKEN'),
  };
  console.log('mockConnectWallet', data);
  cy.mockWallet((req) => {
    aliasWalletQuery(req, 'client.connect_wallet', data);
  });
};

export function addVegaWalletConnect() {
  Cypress.Commands.add('connectVegaWallet', () => {
    // mockConnectWallet();
    cy.highlight(`Connecting Vega Wallet`);
    cy.get('[data-testid=connect-vega-wallet]').click();
    cy.get('[data-testid=connectors-list]')
      .find('[data-testid="connector-jsonRpc"]')
      .click();
    // cy.wait('@walletGQL');
    cy.pause();
    cy.get('[data-testid=dialog-content]').should(
      'contain.text',
      'Successfully connected'
    );
    cy.getByTestId('dialog-close').click();
    cy.get('[data-testid=dialog-content]').should('not.exist');
  });
}

export function addSetVegaWallet() {
  Cypress.Commands.add('setVegaWallet', () => {
    cy.window().then((win) => {
      win.localStorage.setItem(
        'vega_wallet_config',
        JSON.stringify({
          token: Cypress.env('VEGA_WALLET_API_TOKEN'),
          connector: 'jsonRpc',
          url: 'http://localhost:1789',
        })
      );
    });
  });
}
