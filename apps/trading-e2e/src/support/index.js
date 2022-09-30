import '@vegaprotocol/cypress';
import 'cypress-real-events/support';
import registerCypressGrep from 'cypress-grep';
import { aliasQuery } from '@vegaprotocol/cypress';
registerCypressGrep();

beforeEach(() => {
  // Mock chainId fetch which happens on every page for wallet connection
  cy.mockGQL((req) => {
    aliasQuery(req, 'ChainId'); // No response to prevent chain check for wallet connection
  });
});
