declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      contains_exactly(expected_result: string): Chainable<Subject>;
    }
  }
}

export function addContainsExactly() {
  Cypress.Commands.add('contains_exactly', (expected_result) => {
    return cy.contains(new RegExp('^' + expected_result + '$', 'g'));
  });
}
