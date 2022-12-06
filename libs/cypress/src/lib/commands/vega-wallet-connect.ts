import { aliasWalletQuery } from '../graphql-test-utils';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      connectVegaWallet(): void;
    }
  }
}

export const mockConnectWallet = () => {
  const data = {
    token: Cypress.env('VEGA_WALLET_API_TOKEN'),
  };
  console.log('mockConnectWallet', data);
  cy.mockWalletGQL((req) => {
    aliasWalletQuery(req, 'client.connect_wallet', data);
  });
};

export function addVegaWalletConnect() {
  // @ts-ignore - ignoring Cypress type error which gets resolved when Cypress uses the command
  Cypress.Commands.add('connectVegaWallet', () => {
    mockConnectWallet();
    cy.highlight(`Connecting Vega Wallet`);
    cy.get('[data-testid=connect-vega-wallet]').click();
    cy.get('[data-testid=connectors-list]')
      .find('[data-testid="connector-jsonRpc"]')
      .click();
    cy.wait('@walletGQL');
    cy.get('[data-testid=dialog-content]').should(
      'contain.text',
      'Successfully connected'
    );
    cy.getByTestId('dialog-close').click();
    cy.get('[data-testid=dialog-content]').should('not.exist');
  });
}
