import type { RouteHandler } from 'cypress/types/net-stubbing';
import type { CyHttpMessages } from 'cypress/types/net-stubbing';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      mockGQL(handler: RouteHandler): void;
    }
  }
}

const hasOperationName = (
  req: CyHttpMessages.IncomingHttpRequest,
  operationName: string
) => {
  const { body } = req;
  return 'operationName' in body && body.operationName === operationName;
};

export function addMockGQLCommand() {
  Cypress.Commands.add('mockGQL', (handler: RouteHandler) => {
    cy.intercept('POST', '**/graphql', handler).as('GQL');
  });
}

// Alias query if operationName matches
export const aliasGQLQuery = (
  req: CyHttpMessages.IncomingHttpRequest,
  operationName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any
) => {
  if (hasOperationName(req, operationName)) {
    req.alias = operationName;
    if (data !== undefined) {
      req.reply({
        statusCode: 200,
        body: { data },
      });
    }
  }
};
