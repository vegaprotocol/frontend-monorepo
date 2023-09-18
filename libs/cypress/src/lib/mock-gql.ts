import type { GraphQLError } from 'graphql';
import type { RouteHandler } from 'cypress/types/net-stubbing';
import type { CyHttpMessages } from 'cypress/types/net-stubbing';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      mockGQL(handler: RouteHandler): void;
      mockStatistics(handler: RouteHandler): void;
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

/**
 * Extracts variables from the intercepted GQL request.
 * @returns Intercepted variables or empty object
 */
const extractVariables = (req: CyHttpMessages.IncomingHttpRequest): object => {
  const { body } = req;
  return (
    (typeof body === 'object' &&
      body !== null &&
      'variables' in body &&
      body.variables) ||
    {}
  );
};

export function addMockStatistics() {
  Cypress.Commands.add('mockStatistics', (handler: RouteHandler) => {
    cy.intercept(
      'GET',
      Cypress.env('VEGA_URL').replace('graphql', 'statistics'),
      handler
    ).as('ChainId');
  });
}

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
  dataOrDataGetter?: any | ((variables: Record<string, any>) => any),
  errors?: Partial<GraphQLError>[],
  headers?: Record<string, string>
) => {
  if (hasOperationName(req, operationName)) {
    req.alias = operationName;

    let data = dataOrDataGetter;
    if (typeof dataOrDataGetter === 'function') {
      const variables = extractVariables(req);
      data = dataOrDataGetter(variables);
    }
    if (data !== undefined || errors !== undefined) {
      req.reply({
        statusCode: 200,
        body: {
          ...(data && { data }),
          ...(errors && { errors }),
        },
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
