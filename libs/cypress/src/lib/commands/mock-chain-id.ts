import { aliasGQLQuery } from '../mock-gql';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { statisticsQuery } from '@vegaprotocol/mock';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      mockChainId(): void;
    }
  }
}

const chainId = 'test-id';

export function addMockChainId() {
  Cypress.Commands.add('mockChainId', () => {
    const result = {
      statistics: {
        chainId,
      },
    };
    cy.mockGQL((req) => {
      aliasGQLQuery(req, 'NodeCheck', statisticsQuery(result));
    });
    cy.mockStatistics((req) => {
      req.reply({
        statusCode: 200,
        body: result,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  });
}
