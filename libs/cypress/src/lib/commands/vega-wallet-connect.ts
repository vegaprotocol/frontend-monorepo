declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      connectVegaWallet(): void;
    }
  }
}

export function addVegaWalletConnect() {
  // @ts-ignore - ignoring Cypress type error which gets resolved when Cypress uses the command
  Cypress.Commands.add('connectVegaWallet', () => {
    cy.highlight(`Connecting Vega Wallet`);
    cy.get('[data-testid=connect-vega-wallet]').click();
    cy.get('[data-testid=connectors-list]')
      .find('[data-testid="connector-jsonRpc"]')
      .click();
    cy.get('[data-testid=dialog-content]').should(
      'contain.text',
      'Successfully connected'
    );
    cy.getByTestId('dialog-close').click();
    cy.get('[data-testid=dialog-content]').should('not.exist');
  });
}
