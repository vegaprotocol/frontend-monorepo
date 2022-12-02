declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      monitorClipboard(): void;
    }
  }
}

export function addMonitorClipboard() {
  Cypress.Commands.add('monitorClipboard', () => {
    cy.window().then((win) => {
      return cy.stub(win, 'prompt').returns(win.prompt);
    });
  });
}
