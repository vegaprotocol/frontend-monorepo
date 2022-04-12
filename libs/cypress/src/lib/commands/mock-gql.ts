import type { RouteHandler } from 'cypress/types/net-stubbing';

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Chainable<Subject> {
    mockGQL(alias: string, handler: RouteHandler): void;
  }
}

export function addMockGQLCommand() {
  Cypress.Commands.add(
    // @ts-ignore - ignoring Cypress type error which gets resolved when Cypress uses the command
    'mockGQL',
    (alias: string, handler: RouteHandler) => {
      cy.intercept('POST', 'https://lb.testnet.vega.xyz/query', handler).as(
        alias
      );
    }
  );
}
