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
    // Intercept the prompt
    cy.window().then((win) => {
      cy.stub(win, 'prompt').returns(publicKey);
    });

    const connectVegaWaletBtn = Cypress.$(`[data-testid="view-as-user"]`);
    if (connectVegaWaletBtn.length > 0) {
      cy.get('aside button').contains('View as party').click();
    }
  });
};
