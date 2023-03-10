declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      connectPublicKey(publicKey: string): void;
    }
  }
}

export const addConnectPublicKey = () => {
  Cypress.Commands.add('connectPublicKey', (publicKey) => {
    cy.getByTestId('connect-vega-wallet').then((connectWallet) => {
      if (connectWallet.length) {
        cy.get('aside [data-testid="connect-vega-wallet"]').click();
        cy.getByTestId('connector-view').should('be.visible').click();
        cy.getByTestId('address').click();
        cy.getByTestId('address').type(publicKey);
        cy.getByTestId('connect').click();
      }
    });
  });
};
