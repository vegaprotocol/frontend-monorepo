declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      getByTestId(selector: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}
// eslint-disable-next-line @typescript-eslint/no-namespace
export function addGetTestIdcommand() {
  // @ts-ignore - ignoring Cypress type error which gets resolved when Cypress uses the command
  Cypress.Commands.add('getByTestId', (selector, ...args) => {
    return cy.get(`[data-testid=${selector}]`, ...args);
  });
}
