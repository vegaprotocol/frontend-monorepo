import type { GraphQLError } from 'graphql';
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
  return (
    typeof body === 'object' &&
    body !== null &&
    'operationName' in body &&
    body.operationName === operationName
  );
};

export function addMockGQLCommand() {
  Cypress.Commands.add('mockGQL', (handler: RouteHandler) => {
    cy.intercept('POST', Cypress.env('VEGA_URL'), handler).as('GQL');
  });
}

// Alias query if operationName matches
export const aliasGQLQuery = (
  req: CyHttpMessages.IncomingHttpRequest,
  operationName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any,
  errors?: Partial<GraphQLError>[],
  headers?: Record<string, string>
) => {
  if (hasOperationName(req, operationName)) {
    console.log(operationName, req);
    req.alias = operationName;
    if (data !== undefined || errors !== undefined) {
      req.reply({
        statusCode: 200,
        body: { ...(data && { data }), ...(errors && { errors }) },
        headers: {
          ...req.headers,
          // basic default block height header response
          'x-block-height': '100',
          'x-block-timestamp': Date.now().toString() + '0'.repeat(6),
          ...headers,
        },
      });
    }
  }
};
