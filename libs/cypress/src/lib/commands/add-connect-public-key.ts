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
    const connectVegaWaletBtn = Cypress.$(
      `[data-testid="connect-vega-wallet"]`
    );
    if (connectVegaWaletBtn.length > 0) {
      cy.get('aside [data-testid="connect-vega-wallet"]').click();
      cy.getByTestId('connector-view').should('be.visible').click();
      cy.getByTestId('address').click();
      cy.getByTestId('address').type(publicKey);
      cy.getByTestId('connect').click();
    }
  });
};
