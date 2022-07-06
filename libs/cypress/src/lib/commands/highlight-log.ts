declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      interface Chainable<Subject> {
        highlight(message: string): void;
      }
    }
  }
  
  export function addHighlightLog() {
    // @ts-ignore - ignoring Cypress type error which gets resolved when Cypress uses the command
    Cypress.Commands.add('highlight', (message) => {
      cy.log(`👉 **_${message}_**`);
    });
  }