import { aliasGQLQuery } from '../mock-gql';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { chainIdQuery, statisticsQuery } from '@vegaprotocol/mock';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      mockChainId(): void;
    }
  }
}

export function addMockChainId() {
  Cypress.Commands.add('mockChainId', () => {
    cy.mockGQL((req) => {
      aliasGQLQuery(req, 'ChainId', chainIdQuery());
      aliasGQLQuery(req, 'Statistics', statisticsQuery());
    });
  });
}
