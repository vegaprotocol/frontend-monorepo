declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      getByTestId(selector: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}

export function addGetTestIdcommand() {
  Cypress.Commands.add('getByTestId', (selector, ...args) => {
    return cy.get(`[data-testid=${selector}]`, ...args);
  });
}
