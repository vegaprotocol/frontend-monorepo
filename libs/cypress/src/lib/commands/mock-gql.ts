import type { RouteHandler } from 'cypress/types/net-stubbing';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      mockGQL(alias: string, handler: RouteHandler): void;
    }
  }
}

export function addMockGQLCommand() {
  Cypress.Commands.add('mockGQL', (alias: string, handler: RouteHandler) => {
    cy.intercept('POST', 'https://lb.testnet.vega.xyz/query', handler).as(
      alias
    );
  });
}
