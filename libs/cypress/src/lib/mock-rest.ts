import type { RouteHandler } from 'cypress/types/net-stubbing';
import type { CyHttpMessages } from 'cypress/types/net-stubbing';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      mockWallet(handler: RouteHandler): void;
    }
  }
}

const hasMethod = (req: CyHttpMessages.IncomingHttpRequest, method: string) => {
  const { body } = req;
  return 'method' in body && body.method === method;
};

export function addMockWalletCommand() {
  Cypress.Commands.add('mockWallet', (handler: RouteHandler): void => {
    cy.intercept('POST', '**/api/v2/requests', handler).as('walletReq');
  });
}

export const aliasWalletQuery = (
  req: CyHttpMessages.IncomingHttpRequest,
  method: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any
) => {
  const body = {
    jsonrpc: '2.0',
    id: '0',
    result: data,
  };
  if (hasMethod(req, method)) {
    req.alias = method;
    if (data !== undefined) {
      req.reply({
        statusCode: 200,
        body: body,
      });
    }
  }
};
